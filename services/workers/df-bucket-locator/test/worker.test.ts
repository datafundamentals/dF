import {describe, expect, it, vi} from 'vitest';
import {generateBucketCode, handleRequest, type WorkerEnv} from '../src/worker';

const request = (path: string) => new Request(`https://example.com${path}`);

const testEnv = (allowlist: string): WorkerEnv => ({
  ALLOWED_USERS: allowlist,
  DB: {prepare: vi.fn()} as never,
  PHOTOS: {get: vi.fn(), put: vi.fn(), delete: vi.fn()} as never,
});

describe('bucket locator Worker authorization', () => {
  it('fails closed when Access context or allowlist is missing', async () => {
    const noIdentity = await handleRequest(request('/api/locations'), testEnv('user@example.com'), {});
    const noAllowlist = await handleRequest(request('/api/locations'), testEnv(''), {
      access: {getIdentity: vi.fn().mockResolvedValue({email: 'user@example.com'})},
    });

    expect(noIdentity.status).toBe(401);
    expect(noAllowlist.status).toBe(401);
  });

  it('rejects identities outside the configured allowlist', async () => {
    const response = await handleRequest(request('/api/locations'), testEnv('owner@example.com,partner@example.com'), {
      access: {getIdentity: vi.fn().mockResolvedValue({email: 'other@example.com'})},
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({error: 'unauthorized'});
  });

  it('matches allowlisted identities case-insensitively', async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({results: [{id: 'loc-1', name: 'Workshop', bucket_count: 0}]}),
      }),
    };
    const response = await handleRequest(request('/api/locations'), {
      ...testEnv('owner@example.com'),
      DB: db as never,
    }, {
      access: {getIdentity: vi.fn().mockResolvedValue({email: 'OWNER@example.com'})},
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{id: 'loc-1', name: 'Workshop', bucket_count: 0}]);
  });

  it('rejects incomplete location requests before accessing the database', async () => {
    const env = testEnv('owner@example.com');
    const response = await handleRequest(
      new Request('https://example.com/api/locations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: 'x'}),
      }),
      env,
      {access: {getIdentity: vi.fn().mockResolvedValue({email: 'owner@example.com'})}}
    );

    expect(response.status).toBe(400);
    expect(env.DB.prepare).not.toHaveBeenCalled();
  });

  it('rejects intake without a photo before database access', async () => {
    const form = new FormData();
    form.set('bucket_id', 'ABCD');
    form.set('name', 'Bolt');
    form.set('description', 'Steel bolt');
    form.set('quantity', '1');
    form.set('tags', '[]');
    const env = testEnv('owner@example.com');
    const response = await handleRequest(
      new Request('https://example.com/api/parts/intake', {method: 'POST', body: form}),
      env,
      {access: {getIdentity: vi.fn().mockResolvedValue({email: 'owner@example.com'})}}
    );

    expect(response.status).toBe(400);
    expect(env.DB.prepare).not.toHaveBeenCalled();
  });
});

describe('bucket code generation', () => {
  it('generates 4-character uppercase codes from the approved alphabet', () => {
    const allowed = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;
    for (let index = 0; index < 1000; index += 1)
      expect(generateBucketCode()).toMatch(allowed);
  });
});

describe('all-parts index query', () => {
  it('returns creator identity and requests every part in user/location/bucket/name order', async () => {
    let query = '';
    const db = {
      prepare: vi.fn((sql: string) => {
        query = sql;
        return {
          bind: vi.fn().mockReturnThis(),
          all: vi.fn().mockResolvedValue({results: [{
            id: 'part-1',
            created_by: 'owner@example.com',
            name: 'Anchor',
            description: 'Steel anchor',
            quantity: 3,
            bucket_id: 'ABCD',
            location_name: 'Workshop',
            tag_labels: 'hardware',
            photo_r2_key: 'parts/photo.jpg',
          }]}),
        };
      }),
    };
    const response = await handleRequest(request('/api/parts'), {
      ...testEnv('owner@example.com'),
      DB: db as never,
    }, {
      access: {getIdentity: vi.fn().mockResolvedValue({email: 'owner@example.com'})},
    });

    expect(response.status).toBe(200);
    expect(query).toContain('p.created_by');
    expect(query).toContain('ORDER BY lower(p.created_by), lower(l.name), lower(b.id), lower(p.name)');
    expect(query).not.toMatch(/\bLIMIT\b/i);
    expect(await response.json()).toMatchObject([{created_by: 'owner@example.com', bucket_id: 'ABCD'}]);
  });
});

describe('current user bucket filter', () => {
  it('scopes my_buckets to the authenticated Access identity', async () => {
    let boundValues: unknown[] = [];
    const statement = {
      bind: vi.fn((...values: unknown[]) => { boundValues = values; return statement; }),
      all: vi.fn().mockResolvedValue({results: []}),
    };
    const db = {prepare: vi.fn().mockReturnValue(statement)};
    const response = await handleRequest(
      request('/api/parts?my_buckets=true&created_by=attacker@example.com'),
      {...testEnv('owner@example.com'), DB: db as never},
      {access: {getIdentity: vi.fn().mockResolvedValue({email: 'OWNER@example.com'})}}
    );

    expect(response.status).toBe(200);
    expect(db.prepare.mock.calls[0][0]).toContain('b.created_by = ?');
    expect(boundValues).toContain('owner@example.com');
    expect(boundValues).not.toContain('attacker@example.com');
  });
});

describe('record deletion safeguards', () => {
  const owner = {access: {getIdentity: vi.fn().mockResolvedValue({email: 'owner@example.com'})}};

  it('refuses to delete a location that still contains buckets', async () => {
    const statement = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({id: 'location-1'}),
    };
    const db = {
      batch: vi.fn().mockResolvedValue([{meta: {changes: 0}}, {meta: {changes: 0}}]),
      prepare: vi.fn().mockReturnValue(statement),
    };
    const response = await handleRequest(new Request('https://example.com/api/locations/location-1', {method: 'DELETE'}), {
      ...testEnv('owner@example.com'), DB: db as never,
    }, owner);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({error: 'location-has-buckets'});
  });

  it('refuses to delete a bucket that still contains parts', async () => {
    const statement = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({id: 'ABCD'}),
    };
    const db = {
      batch: vi.fn().mockResolvedValue([{meta: {changes: 0}}, {meta: {changes: 0}}]),
      prepare: vi.fn().mockReturnValue(statement),
    };
    const response = await handleRequest(new Request('https://example.com/api/buckets/ABCD', {method: 'DELETE'}), {
      ...testEnv('owner@example.com'), DB: db as never,
    }, owner);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({error: 'bucket-has-parts'});
  });

  it('deletes a part and starts queued photo cleanup', async () => {
    const db = {
      batch: vi.fn().mockResolvedValue([
        {meta: {changes: 1}}, {meta: {changes: 1}}, {meta: {changes: 1}},
      ]),
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({results: []}),
      }),
    };
    const photos = {delete: vi.fn().mockResolvedValue(undefined)};
    const response = await handleRequest(new Request('https://example.com/api/parts/part-1', {method: 'DELETE'}), {
      ...testEnv('owner@example.com'), DB: db as never, PHOTOS: photos as never,
    }, owner);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({success: true, deleted: true});
    expect(db.batch).toHaveBeenCalledTimes(1);
  });
});
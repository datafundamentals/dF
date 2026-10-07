const TAG_LIMIT = 20;
const PHOTO_LIMIT_BYTES = 12 * 1024 * 1024;
const BUCKET_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

interface AccessIdentity {
  email?: string;
  user_uuid?: string;
  sub?: string;
}

interface AccessBinding {
  getIdentity(): Promise<AccessIdentity | null>;
}

interface D1Result<T = Record<string, unknown>> {
  success: boolean;
  results?: T[];
  meta?: {changes?: number};
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
}

interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: {contentType?: string};
}

interface R2Bucket {
  put(key: string, value: ArrayBuffer | ReadableStream, options?: unknown): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

export interface WorkerEnv {
  DB: D1Database;
  PHOTOS: R2Bucket;
  ALLOWED_USERS: string;
}

export interface WorkerContext {
  access?: AccessBinding;
}

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

export default {
  fetch(request: Request, env: WorkerEnv, context: WorkerContext): Promise<Response> {
    return handleRequest(request, env, context);
  },
  async scheduled(_event: unknown, env: WorkerEnv): Promise<void> {
    await retryPhotoCleanup(env);
  },
};

export async function handleRequest(
  request: Request,
  env: WorkerEnv,
  context: WorkerContext
): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, {status: 204});
  const identity = await resolveAllowedIdentity(context, env.ALLOWED_USERS);
  if (!identity) return jsonResponse({error: 'unauthorized'}, 401);

  const url = new URL(request.url);
  try {
    if (url.pathname === '/api/locations' && request.method === 'GET')
      return await listLocations(env.DB);
    if (url.pathname === '/api/locations' && request.method === 'POST')
      return await createLocation(request, env.DB, identity);
    const locationMatch = url.pathname.match(/^\/api\/locations\/([^/]+)$/);
    if (locationMatch && request.method === 'PATCH')
      return await updateLocation(request, env.DB, decodeURIComponent(locationMatch[1]), identity);
    if (locationMatch && request.method === 'DELETE')
      return await deleteLocation(env.DB, decodeURIComponent(locationMatch[1]), identity);
    if (url.pathname === '/api/buckets' && request.method === 'GET')
      return await listBuckets(env.DB);
    if (url.pathname === '/api/buckets' && request.method === 'POST')
      return await createBucket(request, env.DB, identity);

    const bucketLocation = url.pathname.match(/^\/api\/buckets\/([^/]+)\/location$/);
    if (bucketLocation && request.method === 'PATCH')
      return await moveBucket(request, env.DB, decodeURIComponent(bucketLocation[1]), identity);
    const bucketMatch = url.pathname.match(/^\/api\/buckets\/([^/]+)$/);
    if (bucketMatch && request.method === 'PATCH')
      return await updateBucket(request, env.DB, decodeURIComponent(bucketMatch[1]), identity);
    if (bucketMatch && request.method === 'DELETE')
      return await deleteBucket(env.DB, decodeURIComponent(bucketMatch[1]), identity);

    if (url.pathname === '/api/tags' && request.method === 'GET')
      return await listTags(env.DB);
    if (url.pathname === '/api/tags' && request.method === 'POST')
      return await createTag(request, env.DB, identity);
    const tagMatch = url.pathname.match(/^\/api\/tags\/([^/]+)$/);
    if (tagMatch && request.method === 'PATCH')
      return await updateTag(request, env.DB, decodeURIComponent(tagMatch[1]), identity);
    if (tagMatch && request.method === 'DELETE')
      return await deleteTag(env.DB, decodeURIComponent(tagMatch[1]), identity);
    if (url.pathname === '/api/parts' && request.method === 'GET')
      return await searchParts(url, env.DB, identity);
    if (url.pathname === '/api/parts/intake' && request.method === 'POST')
      return await intakePart(request, env, identity);

    const decrementMatch = url.pathname.match(/^\/api\/parts\/([^/]+)\/decrement$/);
    if (decrementMatch && request.method === 'POST')
      return await decrementPart(request, env, decodeURIComponent(decrementMatch[1]), identity);
    const partMatch = url.pathname.match(/^\/api\/parts\/([^/]+)$/);
    if (partMatch && request.method === 'PATCH')
      return await updatePart(request, env, decodeURIComponent(partMatch[1]), identity);
    if (partMatch && request.method === 'DELETE')
      return await deletePart(env, decodeURIComponent(partMatch[1]), identity);

    const photoMatch = url.pathname.match(/^\/api\/photos\/(.+)$/);
    if (photoMatch && request.method === 'GET')
      return await getPhoto(env, decodeURIComponent(photoMatch[1]));

    return jsonResponse({error: 'not-found'}, 404);
  } catch (error) {
    if (error instanceof HttpError)
      return jsonResponse({error: error.message}, error.status);
    console.error('Bucket locator API request failed', error);
    return jsonResponse({error: 'internal-server-error'}, 500);
  }
}

export function generateBucketCode(): string {
  let code = '';
  const random = new Uint8Array(8);
  while (code.length < 4) {
    crypto.getRandomValues(random);
    for (const byte of random) {
      if (byte >= 224) continue;
      code += BUCKET_ALPHABET[byte % BUCKET_ALPHABET.length];
      if (code.length === 4) break;
    }
  }
  return code;
}

async function resolveAllowedIdentity(
  context: WorkerContext,
  allowlist: string
): Promise<string | null> {
  if (!context.access || !allowlist.trim()) return null;
  try {
    const identity = await context.access.getIdentity();
    const email = identity?.email?.trim().toLowerCase();
    if (!email) return null;
    const allowed = new Set(
      allowlist.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
    );
    return allowed.has(email) ? email : null;
  } catch {
    return null;
  }
}

async function listLocations(db: D1Database): Promise<Response> {
  const result = await db.prepare(
    `SELECT l.id, l.name, l.description,
       COUNT(DISTINCT b.id) AS bucket_count
     FROM locations l LEFT JOIN buckets b ON b.location_id = l.id
     WHERE l.is_active = 1 GROUP BY l.id ORDER BY l.name`
  ).all();
  return jsonResponse(result.results ?? []);
}

async function createLocation(request: Request, db: D1Database, user: string): Promise<Response> {
  const body = await jsonBody(request);
  const name = text(body.name, 'name', 2, 80);
  const description = optionalText(body.description, 500);
  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.prepare('INSERT INTO locations (id, name, description) VALUES (?, ?, ?)').bind(id, name, description),
      logStatement(db, id, 'LOCATION', 'CREATE', {name}, user),
    ]);
  } catch (error) {
    if (isConstraintError(error)) throw new HttpError(409, 'location-name-already-exists');
    throw error;
  }
  return jsonResponse({id, name}, 201);
}

async function updateLocation(
  request: Request,
  db: D1Database,
  locationId: string,
  user: string
): Promise<Response> {
  const body = await jsonBody(request);
  const current = await db.prepare('SELECT name, description FROM locations WHERE id = ? AND is_active = 1')
    .bind(locationId).first<{name: string; description: string | null}>();
  if (!current) throw new HttpError(404, 'location-not-found');
  const name = body.name === undefined ? current.name : text(body.name, 'name', 2, 80);
  const description = body.description === undefined ? current.description : optionalText(body.description, 500);
  try {
    const result = await db.batch([
      db.prepare('UPDATE locations SET name = ?, description = ? WHERE id = ? AND is_active = 1')
        .bind(name, description, locationId),
      db.prepare(
        `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
         SELECT 'LOCATION', ?, 'UPDATE_METADATA', ?, ? WHERE changes() > 0`
      ).bind(locationId, JSON.stringify({name, description}), user),
    ]);
    if (!result[0]?.meta?.changes) throw new HttpError(404, 'location-not-found');
  } catch (error) {
    if (isConstraintError(error)) throw new HttpError(409, 'location-name-already-exists');
    throw error;
  }
  return jsonResponse({success: true, id: locationId, name});
}

async function deleteLocation(db: D1Database, locationId: string, user: string): Promise<Response> {
  const result = await db.batch([
    db.prepare('DELETE FROM locations WHERE id = ? AND is_active = 1 AND NOT EXISTS (SELECT 1 FROM buckets WHERE location_id = ?)')
      .bind(locationId, locationId),
    db.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'LOCATION', ?, 'DELETE', '{}', ? WHERE changes() > 0`
    ).bind(locationId, user),
  ]);
  if (!result[0]?.meta?.changes) {
    const location = await db.prepare('SELECT id FROM locations WHERE id = ? AND is_active = 1').bind(locationId).first();
    if (!location) throw new HttpError(404, 'location-not-found');
    throw new HttpError(409, 'location-has-buckets');
  }
  return jsonResponse({success: true, deleted: true});
}

async function listBuckets(db: D1Database): Promise<Response> {
  const result = await db.prepare(
    `SELECT b.id, b.location_id, l.name AS location_name, b.description,
       COUNT(p.id) AS part_count
     FROM buckets b JOIN locations l ON l.id = b.location_id
     LEFT JOIN parts p ON p.bucket_id = b.id
     GROUP BY b.id ORDER BY b.created_at DESC`
  ).all();
  return jsonResponse(result.results ?? []);
}

async function createBucket(request: Request, db: D1Database, user: string): Promise<Response> {
  const body = await jsonBody(request);
  const locationId = text(body.location_id, 'location_id', 1, 128);
  const description = optionalText(body.description, 500);
  const location = await db.prepare(
    'SELECT name FROM locations WHERE id = ? AND is_active = 1'
  ).bind(locationId).first<{name: string}>();
  if (!location) throw new HttpError(400, 'invalid-location-id');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const bucketId = generateBucketCode();
    try {
      await db.batch([
        db.prepare('INSERT INTO buckets (id, location_id, description, created_by) VALUES (?, ?, ?, ?)')
          .bind(bucketId, locationId, description, user),
        logStatement(db, bucketId, 'BUCKET', 'CREATE', {location_id: locationId}, user),
      ]);
      return jsonResponse({success: true, bucket_id: bucketId, location_name: location.name}, 201);
    } catch (error) {
      if (!isConstraintError(error)) throw error;
      const collision = await db.prepare('SELECT id FROM buckets WHERE id = ?').bind(bucketId).first();
      if (!collision) throw new HttpError(400, 'invalid-location-id');
    }
  }
  throw new HttpError(503, 'bucket-code-collision-retry-limit');
}

async function moveBucket(
  request: Request,
  db: D1Database,
  bucketId: string,
  user: string
): Promise<Response> {
  const body = await jsonBody(request);
  const locationId = text(body.location_id, 'location_id', 1, 128);
  const location = await db.prepare(
    'SELECT name FROM locations WHERE id = ? AND is_active = 1'
  ).bind(locationId).first<{name: string}>();
  if (!location) throw new HttpError(400, 'invalid-location-id');
  const result = await db.batch([
    db.prepare('UPDATE buckets SET location_id = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(locationId, bucketId),
    db.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'BUCKET', ?, 'MOVE_LOCATION', ?, ? WHERE changes() > 0`
    ).bind(bucketId, JSON.stringify({location_id: locationId}), user),
  ]);
  if (!result[0]?.meta?.changes) throw new HttpError(404, 'bucket-not-found');
  return jsonResponse({success: true, bucket_id: bucketId, new_location: location.name});
}

async function updateBucket(
  request: Request,
  db: D1Database,
  bucketId: string,
  user: string
): Promise<Response> {
  const body = await jsonBody(request);
  const current = await db.prepare('SELECT location_id, description FROM buckets WHERE id = ?')
    .bind(bucketId).first<{location_id: string; description: string | null}>();
  if (!current) throw new HttpError(404, 'bucket-not-found');
  const locationId = body.location_id === undefined ? current.location_id : text(body.location_id, 'location_id', 1, 128);
  const description = body.description === undefined ? current.description : optionalText(body.description, 500);
  const location = await db.prepare('SELECT name FROM locations WHERE id = ? AND is_active = 1')
    .bind(locationId).first<{name: string}>();
  if (!location) throw new HttpError(400, 'invalid-location-id');
  const result = await db.batch([
    db.prepare('UPDATE buckets SET location_id = ?, description = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(locationId, description, bucketId),
    db.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'BUCKET', ?, 'UPDATE_METADATA', ?, ? WHERE changes() > 0`
    ).bind(bucketId, JSON.stringify({location_id: locationId, description}), user),
  ]);
  if (!result[0]?.meta?.changes) throw new HttpError(404, 'bucket-not-found');
  return jsonResponse({success: true, bucket_id: bucketId, new_location: location.name});
}

async function deleteBucket(db: D1Database, bucketId: string, user: string): Promise<Response> {
  const result = await db.batch([
    db.prepare('DELETE FROM buckets WHERE id = ? AND NOT EXISTS (SELECT 1 FROM parts WHERE bucket_id = ?)')
      .bind(bucketId, bucketId),
    db.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'BUCKET', ?, 'DELETE', '{}', ? WHERE changes() > 0`
    ).bind(bucketId, user),
  ]);
  if (!result[0]?.meta?.changes) {
    const bucket = await db.prepare('SELECT id FROM buckets WHERE id = ?').bind(bucketId).first();
    if (!bucket) throw new HttpError(404, 'bucket-not-found');
    throw new HttpError(409, 'bucket-has-parts');
  }
  return jsonResponse({success: true, deleted: true});
}

async function listTags(db: D1Database): Promise<Response> {
  const result = await db.prepare(
    `SELECT t.id, t.label, COUNT(pt.part_id) AS count
     FROM tags t LEFT JOIN part_tags pt ON pt.tag_id = t.id
     GROUP BY t.id ORDER BY t.label`
  ).all();
  return jsonResponse(result.results ?? []);
}

async function createTag(request: Request, db: D1Database, user: string): Promise<Response> {
  const body = await jsonBody(request);
  const label = text(body.label, 'label', 1, 40);
  const id = slug(label);
  try {
    await db.batch([
      db.prepare('INSERT INTO tags (id, label) VALUES (?, ?)').bind(id, label),
      logStatement(db, id, 'TAG', 'CREATE', {label}, user),
    ]);
  } catch (error) {
    if (isConstraintError(error)) throw new HttpError(409, 'tag-label-or-slug-already-exists');
    throw error;
  }
  return jsonResponse({success: true, id, label}, 201);
}

async function updateTag(request: Request, db: D1Database, tagId: string, user: string): Promise<Response> {
  const body = await jsonBody(request);
  const label = text(body.label, 'label', 1, 40);
  try {
    const result = await db.batch([
      db.prepare('UPDATE tags SET label = ? WHERE id = ?').bind(label, tagId),
      db.prepare(
        `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
         SELECT 'TAG', ?, 'UPDATE_METADATA', ?, ? WHERE changes() > 0`
      ).bind(tagId, JSON.stringify({label}), user),
    ]);
    if (!result[0]?.meta?.changes) throw new HttpError(404, 'tag-not-found');
  } catch (error) {
    if (isConstraintError(error)) throw new HttpError(409, 'tag-label-already-exists');
    throw error;
  }
  return jsonResponse({success: true, id: tagId, label});
}

async function deleteTag(db: D1Database, tagId: string, user: string): Promise<Response> {
  const result = await db.batch([
    db.prepare('DELETE FROM tags WHERE id = ?').bind(tagId),
    db.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'TAG', ?, 'DELETE', '{}', ? WHERE changes() > 0`
    ).bind(tagId, user),
  ]);
  if (!result[0]?.meta?.changes) throw new HttpError(404, 'tag-not-found');
  return jsonResponse({success: true, deleted: true});
}

async function searchParts(url: URL, db: D1Database, authenticatedUser: string): Promise<Response> {
  const query = url.searchParams.get('q')?.trim() ?? '';
  const bucketId = url.searchParams.get('bucket_id');
  const locationId = url.searchParams.get('location_id');
  const selectedTags = [...new Set(url.searchParams.getAll('tag').filter(Boolean))];
  const where = ['(p.name LIKE ? OR p.description LIKE ?)'];
  const values: unknown[] = [`%${query}%`, `%${query}%`];
  if (bucketId) { where.push('p.bucket_id = ?'); values.push(bucketId); }
  if (locationId) { where.push('b.location_id = ?'); values.push(locationId); }
  if (url.searchParams.get('my_buckets') === 'true') {
    where.push('b.created_by = ?');
    values.push(authenticatedUser);
  }
  let having = '';
  if (selectedTags.length) {
    where.push(`EXISTS (SELECT 1 FROM part_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.part_id = p.id AND t.id IN (${placeholders(selectedTags.length)}))`);
    values.push(...selectedTags);
    having = ` HAVING COUNT(DISTINCT CASE WHEN selected_tags.tag_id IN (${placeholders(selectedTags.length)}) THEN selected_tags.tag_id END) = ?`;
  }
  if (selectedTags.length) values.push(...selectedTags, selectedTags.length);
  const sql = `SELECT p.id, p.created_by, p.name, p.description, p.quantity, p.bucket_id,
       l.name AS location_name, GROUP_CONCAT(DISTINCT t.label) AS tag_labels,
       p.photo_r2_key
     FROM parts p JOIN buckets b ON b.id = p.bucket_id
     JOIN locations l ON l.id = b.location_id
     LEFT JOIN part_tags all_tags ON all_tags.part_id = p.id
     LEFT JOIN tags t ON t.id = all_tags.tag_id
     LEFT JOIN part_tags selected_tags ON selected_tags.part_id = p.id
     WHERE ${where.join(' AND ')}
    GROUP BY p.id${having}
    ORDER BY lower(p.created_by), lower(l.name), lower(b.id), lower(p.name), p.id`;
  const result = await db.prepare(sql).bind(...values).all<Record<string, unknown>>();
  const parts = (result.results ?? []).map((row) => ({
    id: row.id,
    created_by: row.created_by,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    bucket_id: row.bucket_id,
    location_name: row.location_name,
    tags: typeof row.tag_labels === 'string' && row.tag_labels ? row.tag_labels.split(',') : [],
    photo_url: `/api/photos/${String(row.photo_r2_key).split('/').map(encodeURIComponent).join('/')}`,
  }));
  return jsonResponse(parts);
}

async function intakePart(request: Request, env: WorkerEnv, user: string): Promise<Response> {
  const form = await request.formData();
  const file = form.get('file');
  const bucketId = text(form.get('bucket_id'), 'bucket_id', 4, 4).toUpperCase();
  const name = text(form.get('name'), 'name', 2, 120);
  const description = text(form.get('description'), 'description', 3, 2000);
  const quantity = positiveInteger(form.get('quantity'), 'quantity');
  const tags = parseTags(form.get('tags'));
  if (!(file instanceof File) || file.type !== 'image/jpeg')
    throw new HttpError(400, 'photo-required');
  if (file.size > PHOTO_LIMIT_BYTES) throw new HttpError(413, 'photo-too-large');
  const bucket = await env.DB.prepare('SELECT id FROM buckets WHERE id = ?').bind(bucketId).first();
  if (!bucket) throw new HttpError(400, 'invalid-bucket-id');

  const bytes = await file.arrayBuffer();
  const partId = crypto.randomUUID();
  const photoKey = `parts/${await sha256Hex(bytes)}-${partId}.jpg`;
  await env.PHOTOS.put(photoKey, bytes, {httpMetadata: {contentType: 'image/jpeg'}});
  try {
    const statements = [
      env.DB.prepare('INSERT INTO parts (id, bucket_id, name, description, photo_r2_key, quantity, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(partId, bucketId, name, description, photoKey, quantity, user),
      logStatement(env.DB, partId, 'PART', 'CREATE', {bucket_id: bucketId, quantity}, user),
      ...tagInsertStatements(env.DB, tags),
      ...partTagInsertStatements(env.DB, partId, tags),
    ];
    await env.DB.batch(statements);
  } catch (error) {
    await queuePhotoCleanup(env, photoKey);
    throw error;
  }
  return jsonResponse({success: true, part_id: partId}, 201);
}

async function decrementPart(
  request: Request,
  env: WorkerEnv,
  partId: string,
  user: string
): Promise<Response> {
  const body = await jsonBody(request);
  const count = positiveInteger(body.count, 'count');
  const part = await env.DB.prepare('SELECT photo_r2_key FROM parts WHERE id = ?').bind(partId).first<{photo_r2_key: string}>();
  if (!part) throw new HttpError(404, 'part-not-found');
  const results = await env.DB.batch([
    env.DB.prepare('UPDATE parts SET quantity = quantity - ?, updated_at = unixepoch() WHERE id = ? AND quantity >= ?')
      .bind(count, partId, count),
    env.DB.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'PART', ?, 'DECREMENT', ?, ? WHERE changes() > 0`
    ).bind(partId, JSON.stringify({count}), user),
    env.DB.prepare('INSERT OR IGNORE INTO photo_cleanup_queue (photo_r2_key) SELECT photo_r2_key FROM parts WHERE id = ? AND quantity = 0').bind(partId),
    env.DB.prepare('DELETE FROM parts WHERE id = ? AND quantity = 0').bind(partId),
  ]);
  if (!results[0]?.meta?.changes) {
    const exists = await env.DB.prepare('SELECT id FROM parts WHERE id = ?').bind(partId).first();
    if (!exists) throw new HttpError(404, 'part-not-found');
    throw new HttpError(409, 'decrement-exceeds-quantity');
  }
  const remaining = await env.DB.prepare('SELECT quantity FROM parts WHERE id = ?').bind(partId).first<{quantity: number}>();
  if (!remaining) await retryPhotoCleanup(env);
  return jsonResponse({success: true, remaining: remaining?.quantity ?? 0, deleted: !remaining});
}

async function updatePart(
  request: Request,
  env: WorkerEnv,
  partId: string,
  user: string
): Promise<Response> {
  const body = await jsonBody(request);
  const current = await env.DB.prepare('SELECT * FROM parts WHERE id = ?').bind(partId).first<Record<string, unknown>>();
  if (!current) throw new HttpError(404, 'part-not-found');
  const name = body.name === undefined ? String(current.name) : text(body.name, 'name', 2, 120);
  const description = body.description === undefined ? String(current.description) : text(body.description, 'description', 3, 2000);
  const quantity = body.quantity === undefined ? Number(current.quantity) : nonNegativeInteger(body.quantity, 'quantity');
  const bucketId = body.bucket_id === undefined ? String(current.bucket_id) : text(body.bucket_id, 'bucket_id', 4, 4).toUpperCase();
  const tags = body.tags === undefined ? null : parseTags(body.tags);
  const bucket = await env.DB.prepare('SELECT id FROM buckets WHERE id = ?').bind(bucketId).first();
  if (!bucket) throw new HttpError(400, 'invalid-bucket-id');
  const statements = [
    env.DB.prepare('UPDATE parts SET name = ?, description = ?, quantity = ?, bucket_id = ?, updated_at = unixepoch() WHERE id = ? AND EXISTS (SELECT 1 FROM parts WHERE id = ?)')
      .bind(name, description, quantity, bucketId, partId, partId),
    env.DB.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'PART', ?, ?, ?, ? WHERE changes() > 0`
    ).bind(partId, quantity === 0 ? 'DECREMENT' : 'UPDATE_METADATA', JSON.stringify({name, description, quantity, bucket_id: bucketId}), user),
  ];
  if (tags) statements.push(...tagInsertStatements(env.DB, tags));
  if (tags) statements.push(env.DB.prepare('DELETE FROM part_tags WHERE part_id = ?').bind(partId), ...partTagInsertStatements(env.DB, partId, tags));
  if (quantity === 0) {
    statements.push(
      env.DB.prepare('INSERT OR IGNORE INTO photo_cleanup_queue (photo_r2_key) SELECT photo_r2_key FROM parts WHERE id = ?').bind(partId),
      env.DB.prepare('DELETE FROM parts WHERE id = ?').bind(partId)
    );
  }
  const results = await env.DB.batch(statements);
  if (!results[0]?.meta?.changes) throw new HttpError(404, 'part-not-found');
  if (quantity === 0) await retryPhotoCleanup(env);
  return jsonResponse({success: true, ...(quantity === 0 ? {deleted: true} : {part_id: partId})});
}

async function deletePart(env: WorkerEnv, partId: string, user: string): Promise<Response> {
  const results = await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO photo_cleanup_queue (photo_r2_key) SELECT photo_r2_key FROM parts WHERE id = ?')
      .bind(partId),
    env.DB.prepare('DELETE FROM parts WHERE id = ?').bind(partId),
    env.DB.prepare(
      `INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id)
       SELECT 'PART', ?, 'DELETE', '{}', ? WHERE changes() > 0`
    ).bind(partId, user),
  ]);
  if (!results[1]?.meta?.changes) throw new HttpError(404, 'part-not-found');
  await retryPhotoCleanup(env);
  return jsonResponse({success: true, deleted: true});
}

async function getPhoto(env: WorkerEnv, key: string): Promise<Response> {
  if (!key.startsWith('parts/') || key.includes('..')) throw new HttpError(400, 'invalid-photo-key');
  const photo = await env.PHOTOS.get(key);
  if (!photo) throw new HttpError(404, 'photo-not-found');
  return new Response(photo.body, {
    headers: {
      'Cache-Control': 'private, max-age=300',
      'Content-Type': photo.httpMetadata?.contentType ?? 'image/jpeg',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function retryPhotoCleanup(env: WorkerEnv): Promise<void> {
  const queued = await env.DB.prepare('SELECT photo_r2_key FROM photo_cleanup_queue ORDER BY queued_at LIMIT 100').all<{photo_r2_key: string}>();
  for (const item of queued.results ?? []) {
    try {
      await env.PHOTOS.delete(item.photo_r2_key);
      await env.DB.prepare('DELETE FROM photo_cleanup_queue WHERE photo_r2_key = ?').bind(item.photo_r2_key).run();
    } catch (error) {
      console.error('R2 photo cleanup will be retried', error);
    }
  }
}

async function queuePhotoCleanup(env: WorkerEnv, key: string): Promise<void> {
  await env.DB.prepare('INSERT OR IGNORE INTO photo_cleanup_queue (photo_r2_key) VALUES (?)').bind(key).run();
  await retryPhotoCleanup(env);
}

function tagInsertStatements(db: D1Database, tags: string[]): D1Statement[] {
  return tags.map((label) => {
    const id = slug(label);
    return db.prepare('INSERT OR IGNORE INTO tags (id, label) VALUES (?, ?)').bind(id, label);
  });
}

function partTagInsertStatements(db: D1Database, partId: string, tags: string[]): D1Statement[] {
  return tags.map((label) => db.prepare(
    'INSERT OR IGNORE INTO part_tags (part_id, tag_id) SELECT ?, ? WHERE EXISTS (SELECT 1 FROM parts WHERE id = ?)'
  ).bind(partId, slug(label), partId));
}

function logStatement(
  db: D1Database,
  entityId: string,
  entityType: string,
  action: string,
  details: unknown,
  user: string
): D1Statement {
  return db.prepare('INSERT INTO inventory_logs (entity_type, entity_id, action, details, user_id) VALUES (?, ?, ?, ?, ?)')
    .bind(entityType, entityId, action, JSON.stringify(details), user);
}

function parseTags(value: unknown): string[] {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { throw new HttpError(400, 'tags-must-be-json-array'); }
  }
  if (!Array.isArray(parsed) || parsed.some((tag) => typeof tag !== 'string'))
    throw new HttpError(400, 'tags-must-be-string-array');
  const tags = [...new Set(parsed.map((tag: string) => tag.trim()).filter(Boolean))];
  if (tags.length > TAG_LIMIT || tags.some((tag) => tag.length > 40))
    throw new HttpError(400, 'invalid-tags');
  return tags;
}

async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json-body');
  }
}

function text(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new HttpError(400, `invalid-${field}`);
  return value.trim();
}

function optionalText(value: unknown, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new HttpError(400, 'invalid-description');
  return value.trim() || null;
}

function positiveInteger(value: unknown, field: string): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new HttpError(400, `invalid-${field}`);
  return number;
}

function nonNegativeInteger(value: unknown, field: string): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new HttpError(400, `invalid-${field}`);
  return number;
}

function slug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'tag';
}

function placeholders(count: number): string {
  return Array.from({length: count}, () => '?').join(', ');
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

function isConstraintError(error: unknown): boolean {
  return error instanceof Error && /constraint|unique/i.test(error.message);
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {status, headers: jsonHeaders});
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
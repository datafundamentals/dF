PRAGMA foreign_keys = ON;

CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE buckets (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE
);

CREATE TABLE parts (
  id TEXT PRIMARY KEY,
  bucket_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_r2_key TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON UPDATE CASCADE
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE part_tags (
  part_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (part_id, tag_id),
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE inventory_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,         -- PART, BUCKET, LOCATION, TAG
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,              -- CREATE, UPDATE_METADATA, MOVE_LOCATION, DECREMENT, DELETE
  details TEXT,
  user_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE photo_cleanup_queue (
  photo_r2_key TEXT PRIMARY KEY,
  queued_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_buckets_location ON buckets(location_id);
CREATE INDEX idx_parts_bucket ON parts(bucket_id);
CREATE INDEX idx_part_tags_tag ON part_tags(tag_id);
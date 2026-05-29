PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ALUMNI' CHECK (role IN ('ADMIN', 'ALUMNI')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISABLED')),
  rejection_reason TEXT,
  remember_token TEXT,
  reset_token TEXT,
  reset_token_expires INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

CREATE TABLE IF NOT EXISTS alumni_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  high_school_major TEXT NOT NULL CHECK (high_school_major IN ('IPA', 'IPS')),
  college_major TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profile_photo_url TEXT,
  profile_photo_key TEXT,
  address TEXT,
  domicile_city TEXT,
  domicile_province TEXT,
  origin_city TEXT,
  origin_province TEXT,
  linkedin_url TEXT,
  social_media TEXT,
  portfolio_url TEXT,
  bio TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS alumni_major_idx ON alumni_profiles(high_school_major);
CREATE INDEX IF NOT EXISTS alumni_domicile_idx ON alumni_profiles(domicile_province);
CREATE INDEX IF NOT EXISTS alumni_origin_idx ON alumni_profiles(origin_province);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  hidden_at INTEGER,
  hidden_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hidden_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS posts_hidden_idx ON posts(is_hidden);
CREATE INDEX IF NOT EXISTS posts_created_idx ON posts(created_at);

CREATE TABLE IF NOT EXISTS post_images (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_key TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY NOT NULL,
  uploaded_by TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_key TEXT NOT NULL,
  caption TEXT,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  hidden_at INTEGER,
  hidden_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hidden_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS gallery_hidden_idx ON gallery_photos(is_hidden);

CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY NOT NULL,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  description TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS logs_created_idx ON admin_logs(created_at);

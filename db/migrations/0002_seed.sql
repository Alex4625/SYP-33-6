INSERT OR IGNORE INTO users (
  id,
  username,
  password_hash,
  role,
  status
) VALUES (
  '00000000-0000-4000-8000-000000000001',
  'admin',
  '$2b$12$7PHJpb3g4Artto75X53.OuPP8.7BJc/INmWjPDhjNWgl1sSVQ.Y4O',
  'ADMIN',
  'APPROVED'
);

INSERT OR IGNORE INTO alumni_profiles (
  id,
  user_id,
  full_name,
  high_school_major,
  college_major,
  birth_place,
  birth_date
) VALUES (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'Admin SYP-33-6',
  'IPA',
  'Administrator',
  'Indonesia',
  '2000-01-01'
);

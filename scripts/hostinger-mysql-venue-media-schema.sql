-- Good Bookies — Hostinger MySQL #2: TURF images + videos (owner uploads)
-- Create a NEW database in hPanel (e.g. u337490085_gb_venues) then run this SQL there

CREATE TABLE IF NOT EXISTS media_assets (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL COMMENT 'owner user id who uploaded',
  category VARCHAR(20) NOT NULL COMMENT 'venues | videos',
  mime_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size INT UNSIGNED NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_user_category (user_id, category),
  INDEX idx_media_category (category),
  INDEX idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

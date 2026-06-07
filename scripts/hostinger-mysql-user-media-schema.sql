-- Good Bookies — Hostinger MySQL #1: USER profile photos only
-- Database: u337490085_gb_media (gb_media)
-- Run in phpMyAdmin on the USER media database

CREATE TABLE IF NOT EXISTS media_assets (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'avatars' COMMENT 'avatars only',
  mime_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size INT UNSIGNED NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_user (user_id),
  INDEX idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

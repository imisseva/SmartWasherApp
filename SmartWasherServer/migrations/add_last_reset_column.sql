-- Thêm cột last_reset vào bảng user
ALTER TABLE `user` 
ADD COLUMN `last_reset` DATETIME DEFAULT NULL;

-- Cập nhật giá trị mặc định cho last_reset
UPDATE `user` SET `last_reset` = CURRENT_TIMESTAMP WHERE `last_reset` IS NULL;
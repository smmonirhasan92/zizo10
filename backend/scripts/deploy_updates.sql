-- Database Safeguard Migration Script
-- Run this on Live Server (phpMyAdmin) to update schema safely without data loss.

-- 1. Add 'isWithdrawLocked' to Users (Default: 0/False)
ALTER TABLE `users` ADD COLUMN `isWithdrawLocked` TINYINT(1) DEFAULT 0;

-- 2. Add 'account_tier' to Users (Default: 'Starter')
-- Note: If column exists, this might error, but 'ADD COLUMN' is safe if check first.
-- In some SQL versions: ADD COLUMN IF NOT EXISTS ...
ALTER TABLE `users` ADD COLUMN `account_tier` VARCHAR(255) DEFAULT 'Starter';

-- 3. Add 'referredBy' to Users (Default: NULL, as it's optional)
ALTER TABLE `users` ADD COLUMN `referredBy` INT(11) DEFAULT NULL;

-- 4. Create Notifications Table (Safe Create)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `type` varchar(255) DEFAULT 'system',
  `title` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Add 'referral_bonus_amount' to GlobalSettings if missing
ALTER TABLE `globalsettings` ADD COLUMN `referral_bonus_amount` DECIMAL(10,2) DEFAULT 50.00;

-- 6. Create Task Products Table (Smart Review System)
CREATE TABLE IF NOT EXISTS `taskproducts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT 'standard_review',
  `productName` varchar(255) NOT NULL,
  `productImage` varchar(255) NOT NULL,
  `reviewText` text NOT NULL,
  `adCode` text DEFAULT NULL,
  `targetPackage` varchar(255) DEFAULT 'All',
  `status` varchar(255) DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Create Task Schedule Table (Dynamic Matrix)
CREATE TABLE IF NOT EXISTS `taskschedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `targetPackage` varchar(255) NOT NULL,
  `weekNumber` int(11) DEFAULT 0,
  `taskType` varchar(255) NOT NULL,
  `taskCount` int(11) DEFAULT 10,
  `status` varchar(255) DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Create Settings Table (Replacement for GameSettings)
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `settingName` varchar(255) NOT NULL,
  `settingValue` text,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settingName` (`settingName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verification Query
SELECT 'Database Update Complete. Check for errors above.' as status;

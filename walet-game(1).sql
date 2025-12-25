-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 13, 2025 at 04:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `walet-game`
--

-- --------------------------------------------------------

--
-- Table structure for table `agentdocs`
--

CREATE TABLE `agentdocs` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `docType` varchar(255) NOT NULL,
  `fileUrl` varchar(255) NOT NULL,
  `isVerified` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditlogs`
--

CREATE TABLE `auditlogs` (
  `id` int(11) NOT NULL,
  `adminId` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auditlogs`
--

INSERT INTO `auditlogs` (`id`, `adminId`, `action`, `details`, `ipAddress`, `createdAt`, `updatedAt`) VALUES
(1, 2, 'Update Game Status', 'Status set to active', NULL, '2025-12-10 12:45:40', '2025-12-10 12:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `deposit_requests`
--

CREATE TABLE `deposit_requests` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `paymentMethod` varchar(255) DEFAULT NULL,
  `proofImage` varchar(255) DEFAULT NULL,
  `adminComment` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deposit_requests`
--

INSERT INTO `deposit_requests` (`id`, `userId`, `amount`, `status`, `paymentMethod`, `proofImage`, `adminComment`, `createdAt`, `updatedAt`) VALUES
(1, 2, 500.00, 'pending', NULL, 'uploads\\1765331311591.jpg', NULL, '2025-12-10 01:48:31', '2025-12-10 01:48:31');

-- --------------------------------------------------------

--
-- Table structure for table `gamelogs`
--

CREATE TABLE `gamelogs` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `gameType` varchar(255) DEFAULT 'head_tail',
  `betAmount` decimal(10,2) NOT NULL,
  `result` enum('win','loss') NOT NULL,
  `payout` decimal(10,2) DEFAULT 0.00,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gamelogs`
--

INSERT INTO `gamelogs` (`id`, `userId`, `gameType`, `betAmount`, `result`, `payout`, `createdAt`, `updatedAt`) VALUES
(1, 18, 'head_tail', 20.00, 'win', 40.00, '2025-12-10 12:45:55', '2025-12-10 12:45:55'),
(2, 18, 'head_tail', 20.00, 'win', 40.00, '2025-12-10 12:46:43', '2025-12-10 12:46:43'),
(3, 18, 'head_tail', 20.00, 'loss', 0.00, '2025-12-10 12:55:04', '2025-12-10 12:55:04'),
(4, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 03:14:18', '2025-12-12 03:14:18'),
(5, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 03:15:00', '2025-12-12 03:15:00'),
(6, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 03:15:15', '2025-12-12 03:15:15'),
(7, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 03:26:04', '2025-12-12 03:26:04'),
(8, 5, 'head_tail', 10.00, 'win', 20.00, '2025-12-12 03:31:44', '2025-12-12 03:31:44'),
(9, 5, 'head_tail', 20.00, 'win', 40.00, '2025-12-12 03:36:31', '2025-12-12 03:36:31'),
(10, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 03:39:21', '2025-12-12 03:39:21'),
(11, 5, 'head_tail', 10.00, 'loss', 0.00, '2025-12-12 03:42:43', '2025-12-12 03:42:43'),
(12, 5, 'head_tail', 10.00, 'loss', 0.00, '2025-12-12 03:47:29', '2025-12-12 03:47:29'),
(13, 5, 'head_tail', 10.00, 'loss', 0.00, '2025-12-12 03:49:00', '2025-12-12 03:49:00'),
(14, 5, 'head_tail', 20.00, 'win', 40.00, '2025-12-12 04:13:42', '2025-12-12 04:13:42'),
(15, 5, 'head_tail', 20.00, 'win', 40.00, '2025-12-12 05:25:49', '2025-12-12 05:25:49'),
(16, 5, 'head_tail', 20.00, 'win', 40.00, '2025-12-12 05:26:05', '2025-12-12 05:26:05'),
(17, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 05:26:18', '2025-12-12 05:26:18'),
(18, 5, 'head_tail', 20.00, 'loss', 0.00, '2025-12-12 05:26:35', '2025-12-12 05:26:35'),
(19, 5, 'head_tail', 20.00, 'win', 40.00, '2025-12-13 11:55:30', '2025-12-13 11:55:30'),
(20, 5, 'head_tail', 20.00, 'win', 40.00, '2025-12-13 12:00:27', '2025-12-13 12:00:27');

-- --------------------------------------------------------

--
-- Table structure for table `gamesettings`
--

CREATE TABLE `gamesettings` (
  `id` int(11) NOT NULL,
  `settingName` varchar(255) NOT NULL,
  `settingValue` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gamesettings`
--

INSERT INTO `gamesettings` (`id`, `settingName`, `settingValue`, `description`, `createdAt`, `updatedAt`) VALUES
(1, 'game_status', 'active', 'Game Status (active/maintenance)', '2025-12-10 12:45:40', '2025-12-13 14:25:40'),
(2, 'house_edge', '14', NULL, '2025-12-10 12:45:40', '2025-12-13 14:25:40'),
(3, 'winning_percentage', '43', NULL, '2025-12-10 12:45:40', '2025-12-13 14:25:40'),
(4, 'min_bet', '10', NULL, '2025-12-10 12:45:40', '2025-12-13 14:25:40'),
(5, 'max_bet', '1000', NULL, '2025-12-10 12:45:40', '2025-12-13 14:25:40'),
(6, 'deposit_agents', '[{\"number\":\"01985010101\",\"agentId\":3,\"agentName\":\"user-02\"},{\"number\":\"017022020\",\"agentId\":15,\"agentName\":\"Test Agent\"}]', 'Active Deposit Numbers mapped to Agents', '2025-12-11 13:27:39', '2025-12-11 14:07:05'),
(16, 'streak_threshold', '3', NULL, '2025-12-13 14:25:40', '2025-12-13 14:25:40'),
(17, 'streak_multiplier', '1.5', NULL, '2025-12-13 14:25:40', '2025-12-13 14:25:40');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('recharge','send_money','cash_out','add_money','mobile_recharge','commission','admin_credit','admin_debit') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','rejected') DEFAULT 'pending',
  `recipientDetails` varchar(255) DEFAULT NULL,
  `proofImage` varchar(255) DEFAULT NULL,
  `adminComment` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `assignedAgentId` int(11) DEFAULT NULL,
  `bonusAmount` decimal(10,2) DEFAULT 0.00,
  `receivedByAgentId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `userId`, `type`, `amount`, `status`, `recipientDetails`, `proofImage`, `adminComment`, `createdAt`, `updatedAt`, `assignedAgentId`, `bonusAmount`, `receivedByAgentId`) VALUES
(1, 2, 'recharge', 2000.00, 'rejected', NULL, 'uploads\\1765329363170.png', 'Admin Rejected', '2025-12-10 01:16:03', '2025-12-11 07:13:44', NULL, 0.00, NULL),
(2, 2, 'recharge', 2000.00, 'rejected', NULL, 'uploads\\1765329432780.mp4', 'Admin Rejected', '2025-12-10 01:17:12', '2025-12-11 07:13:56', NULL, 0.00, NULL),
(4, 18, 'add_money', 521.00, 'completed', 'Method: bkash, TrxID: test521', 'uploads\\proofImage-1765346472473.png', 'Admin Approved', '2025-12-10 06:01:12', '2025-12-10 06:04:56', NULL, 521.00, NULL),
(5, 18, 'add_money', 198.00, 'completed', 'Method: Bank Transfer, TrxID: fgnhfh', 'uploads\\proofImage-1765346958217.png', 'Admin Approved', '2025-12-10 06:09:18', '2025-12-10 06:09:35', NULL, 0.00, NULL),
(6, 18, 'add_money', 531.00, 'completed', 'Method: Bank Transfer, TrxID: test-531', 'uploads\\proofImage-1765349815507.png', 'Admin Approved', '2025-12-10 06:56:55', '2025-12-10 06:57:46', NULL, 0.00, NULL),
(7, 18, 'add_money', 500.00, 'completed', 'Method: bkash, TrxID: 01985805030', 'uploads\\proofImage-1765350855502.png', '<p><br></p>', '2025-12-10 07:14:15', '2025-12-10 07:33:48', NULL, 0.00, NULL),
(8, 20, 'send_money', -500.00, 'completed', 'To: 01900000000 (nagad) - Agent', NULL, 'hasdkh', '2025-12-10 07:49:48', '2025-12-10 09:06:44', 3, 0.00, NULL),
(9, 18, 'send_money', -501.00, 'completed', 'To: 01985805030 (nagad) - Personal', NULL, 'hkjsdag', '2025-12-10 08:04:52', '2025-12-10 09:06:54', 3, 0.00, NULL),
(10, 18, 'send_money', -503.00, 'rejected', 'To: 01985010101 (bkash) - Personal', NULL, 'Admin Rejected', '2025-12-10 10:33:04', '2025-12-11 07:14:01', 3, 0.00, NULL),
(11, 18, 'send_money', -101.00, 'completed', 'To: 01985010101 (bkash) - Personal', NULL, 'hifghj', '2025-12-10 10:38:22', '2025-12-10 12:54:01', 3, 0.00, NULL),
(12, 18, 'mobile_recharge', -30.00, 'rejected', 'Banglalink - 01985805030', NULL, 'Admin Rejected', '2025-12-10 10:42:06', '2025-12-11 07:14:08', NULL, 0.00, NULL),
(13, 18, 'cash_out', 40.00, 'completed', 'Game Win (Bet: 20)', NULL, NULL, '2025-12-10 12:45:55', '2025-12-10 12:45:55', NULL, 0.00, NULL),
(14, 18, 'cash_out', 40.00, 'completed', 'Game Win (Bet: 20)', NULL, NULL, '2025-12-10 12:46:43', '2025-12-10 12:46:43', NULL, 0.00, NULL),
(15, 18, 'add_money', 0.00, 'completed', 'Method: rocket, Sender: 01701010203', 'uploads\\proofImage-1765370965708.png', 'Admin Approved', '2025-12-10 12:49:25', '2025-12-11 07:09:22', NULL, 0.00, NULL),
(16, 18, 'add_money', 5000.00, 'completed', 'Method: bkash, Sender: 01701020304', 'uploads\\proofImage-1765371047652.png', 'Admin Approved', '2025-12-10 12:50:47', '2025-12-10 12:51:13', NULL, 20.00, 3),
(17, 18, 'send_money', -333.00, 'completed', 'To: 01985010101 (bkash) - Personal', NULL, 'sdfgahf', '2025-12-10 12:52:03', '2025-12-10 12:54:11', 3, 0.00, NULL),
(18, 18, 'mobile_recharge', -50.00, 'completed', 'Grameenphone - 01985010101', NULL, 'sdadf', '2025-12-10 12:52:28', '2025-12-10 12:53:47', 3, 0.00, NULL),
(19, 22, 'add_money', 4998.00, 'completed', 'Method: Bank Transfer, Sender: 1414141414', 'uploads\\proofImage-1765434920288.png', 'Admin Approved', '2025-12-11 06:35:20', '2025-12-11 07:05:00', NULL, 0.00, NULL),
(20, 22, 'add_money', 5000.00, 'completed', 'Method: bkash, Sender: 01985010101', NULL, 'Admin Approved', '2025-12-11 06:42:19', '2025-12-11 06:54:50', NULL, 500.00, NULL),
(21, 22, 'send_money', -500.00, 'rejected', 'To: 01985010101 (bkash) - Personal', NULL, 'Admin Rejected', '2025-12-11 07:03:19', '2025-12-11 07:14:12', 3, 0.00, NULL),
(22, 22, 'add_money', 5000.00, 'completed', 'Method: bkash, Sender: 01714141414', 'uploads\\proofImage-1765437296742.png', 'Admin Approved', '2025-12-11 07:14:56', '2025-12-11 07:15:08', NULL, 0.00, NULL),
(23, 5, 'add_money', 0.00, 'rejected', 'Method: bkash, Sender: 01985212423', 'uploads\\proofImage-1765462069676.png', 'Admin Rejected', '2025-12-11 14:07:49', '2025-12-11 14:08:07', NULL, 0.00, NULL),
(24, 5, 'add_money', 500.00, 'completed', 'Method: bkash, Sender: 0172152542', 'uploads\\proofImage-1765462114620.png', 'Admin Approved', '2025-12-11 14:08:34', '2025-12-11 14:08:54', NULL, 0.00, NULL),
(25, 5, '', -100.00, 'completed', 'Transfer to Game Wallet', NULL, NULL, '2025-12-12 02:37:07', '2025-12-12 02:37:07', NULL, 0.00, NULL),
(26, 5, 'cash_out', 20.00, 'completed', 'Game Win (Bet: 10)', NULL, NULL, '2025-12-12 03:31:44', '2025-12-12 03:31:44', NULL, 0.00, NULL),
(27, 5, 'cash_out', 40.00, 'completed', 'Game Win (Bet: 20)', NULL, NULL, '2025-12-12 03:36:31', '2025-12-12 03:36:31', NULL, 0.00, NULL),
(28, 5, '', -100.00, 'completed', 'Transfer to Game Wallet', NULL, NULL, '2025-12-12 03:49:19', '2025-12-12 03:49:19', NULL, 0.00, NULL),
(29, 5, 'cash_out', 40.00, 'completed', 'Game Win (Bet: 20)', NULL, NULL, '2025-12-12 04:13:42', '2025-12-12 04:13:42', NULL, 0.00, NULL),
(30, 5, 'add_money', 1000.00, 'completed', 'Method: bkash, Sender: 01985112211', NULL, 'Admin Approved', '2025-12-12 05:14:04', '2025-12-12 05:14:29', NULL, 0.00, NULL),
(31, 5, 'mobile_recharge', -45.00, 'pending', 'Banglalink - 01985112211', NULL, NULL, '2025-12-12 05:15:17', '2025-12-12 05:15:17', NULL, 0.00, NULL),
(32, 5, 'send_money', -555.00, 'pending', 'To: 01985112211 (nagad) - Personal', NULL, NULL, '2025-12-12 05:15:52', '2025-12-12 05:15:52', NULL, 0.00, NULL),
(33, 5, 'cash_out', 40.00, 'completed', 'Game Win (Bet: 20)', NULL, NULL, '2025-12-12 05:25:49', '2025-12-12 05:25:49', NULL, 0.00, NULL),
(34, 5, 'cash_out', 40.00, 'completed', 'Game Win (Bet: 20)', NULL, NULL, '2025-12-12 05:26:05', '2025-12-12 05:26:05', NULL, 0.00, NULL),
(35, 5, '', 40.00, 'completed', 'Game Win  (Bet: 20)', NULL, NULL, '2025-12-13 11:55:30', '2025-12-13 11:55:30', NULL, 0.00, NULL),
(36, 5, '', 40.00, 'completed', 'Game Win  (Bet: 20)', NULL, NULL, '2025-12-13 12:00:27', '2025-12-13 12:00:27', NULL, 0.00, NULL),
(37, 5, 'add_money', 5000.00, 'completed', 'Method: Bank Transfer, Sender: 1321346134', 'uploads\\proofImage-1765628326937.png', 'Admin Approved', '2025-12-13 12:18:46', '2025-12-13 12:19:32', NULL, 0.00, NULL),
(38, 5, 'send_money', -2500.00, 'pending', 'To: 01711223311 (bkash) - Personal', NULL, NULL, '2025-12-13 12:20:40', '2025-12-13 12:20:40', NULL, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','employee_admin','agent','user') DEFAULT 'user',
  `kycStatus` enum('pending','approved','rejected','none') DEFAULT 'none',
  `kycImage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `commissionRate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `photoUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `username`, `phone`, `country`, `password`, `role`, `kycStatus`, `kycImage`, `createdAt`, `updatedAt`, `commissionRate`, `photoUrl`) VALUES
(1, 'Super Admin', 'admin', '01ADMIN0000', 'BD', '$2b$10$a0r9asZQe9oMj5QmYu5tcO.IsF/rqnnTpVjGK3jbBSitaynhvjf5G', 'super_admin', 'approved', NULL, '2025-12-09 10:14:35', '2025-12-13 10:19:13', 0.00, NULL),
(2, 'user-01', 'user-011810', '01985010101', 'bangladesh', '$2b$10$3vkmbRQpobRDlCxp0oXuzeGg/eCZo47wzsveoQaK7iaqGQIwxEcQe', 'super_admin', '', NULL, '2025-12-09 10:15:12', '2025-12-10 05:56:54', 0.00, '/uploads/photo-1765341084038.png'),
(3, 'user-02', 'user-022794', '01985222222', 'bangladesh', '$2b$10$Bb8Ai8AI/VNkaeXfAYkrNuBBhzu5lcvVIXVYv8JQhO/gKlcKYqAFG', 'agent', 'none', NULL, '2025-12-09 11:07:52', '2025-12-13 11:57:11', 0.00, NULL),
(4, 'user-03', 'user-033038', '01985888888', 'bangladesh', '$2b$10$m4uruth17WMn0rwm1GP8NOvfy5dk1h19m2koZPiM.B.bDuaIJdv2W', 'user', 'none', NULL, '2025-12-09 11:12:24', '2025-12-09 11:12:24', 0.00, NULL),
(5, 'user-04', 'user-042117', '01985805030', 'bangladesh', '$2b$10$1D9W4Yaic4TvOski/CmTEO1aKU1mXMLS4d6lD8zSU5ymxIAM1lyxq', 'user', 'none', NULL, '2025-12-09 11:59:56', '2025-12-13 11:54:59', 0.00, 'uploads\\photo-1765462916089.png'),
(6, 'user-05', 'user-056960', '01980808080', 'bangladesh', '$2b$10$Tis4bRukk.N6sY6/BDhivu.GCskAdX.0RTsIZw6iUGq/f6PVJc.fK', 'user', 'none', NULL, '2025-12-09 12:14:18', '2025-12-09 12:14:18', 0.00, NULL),
(7, 'Final Test User', 'final3025', '01999888777', '01985010101Bangladesh', '$2b$10$WOmAH7UXwvy6O7/MDKlaRe9Ht9.MfmB0XW17wDtqkPMWvMuq3QJrm', 'user', 'none', NULL, '2025-12-09 12:28:33', '2025-12-09 12:28:33', 0.00, NULL),
(8, 'Final Test 2', 'final1444', '01999888778', '01985010101Bangladesh', '$2b$10$V7NyOg7bgjr.N.wTA5G6tOSeTarbMhdzgodDv52YFP7WEGJyVY8na', 'user', 'none', NULL, '2025-12-09 12:29:21', '2025-12-09 12:29:21', 0.00, NULL),
(9, 'Final Test 3', 'final7891', '01999888776', '01985010101Bangladesh', '$2b$10$Bzr107XMArolR1jf3eYkpebO.Y/nih46b35h7B3udpEKa054w9m92', 'user', 'none', NULL, '2025-12-09 12:29:59', '2025-12-09 12:29:59', 0.00, NULL),
(10, 'useruser', 'useruser3593', '01985805033', 'bangladesh', '$2b$10$V6y9yA3n2gJMPh/bUYf1jOJFEhQ2zpR6MofbNfxhSaPfZlY7v5vrq', 'user', 'none', NULL, '2025-12-09 12:39:01', '2025-12-09 12:39:01', 0.00, NULL),
(11, 'Test User 5000', 'test4898', '017005000', 'Bangladesh', '$2b$10$iiFpe3S7C3rclO82HjRGFOFOpLSNb0lI85vE4qAnFjmSBOG/KZ90.', 'user', 'none', NULL, '2025-12-09 23:54:49', '2025-12-09 23:54:49', 0.00, NULL),
(12, 'Test User 3161', 'test7664', '017003161', 'Bangladesh', '$2b$10$gKpSMTfdXqINbbj.8qoCYOix88v38gXMybOI40d73mgg.gR05jJVS', 'user', 'none', NULL, '2025-12-09 23:55:26', '2025-12-09 23:55:26', 0.00, NULL),
(13, 'Test User 7547', 'test6927', '017007547', 'Bangladesh', '$2b$10$nCwqCIrrevfcR9ka/jCLF.JmEhfULcEBtn1WPagM31jfZ8182esSi', 'user', 'none', NULL, '2025-12-09 23:56:02', '2025-12-09 23:56:02', 0.00, NULL),
(14, 'Test User 5974', 'test3022', '017005974', 'Bangladesh', '$2b$10$aC1uJuCgV3PcCebysFJnFeHn0hrzbhmbOnT4BKIUYah0KSeCYbFb.', 'user', 'none', NULL, '2025-12-10 02:08:19', '2025-12-10 02:08:19', 0.00, NULL),
(15, 'Test Agent', 'test1511', '01711112222', 'Bangladesh', '$2b$10$JZu5qvNtxuuKC5AOGkOrtuQeUy.//O.IxiXXjdRFSi6xEY5tnMPsm', 'agent', 'approved', NULL, '2025-12-10 02:26:32', '2025-12-10 02:26:32', 5.50, NULL),
(16, 'BrowserTest', 'browsertest7093', '01799999999', '', '$2b$10$m8/Su92NFMM5PBxlvTMtKeI8V3OocWicCH7dUZGKyS9ULPgUSE5kK', 'user', 'none', NULL, '2025-12-10 03:48:58', '2025-12-10 03:48:58', 0.00, NULL),
(18, 'user--09', 'user--091128', '01720202020', 'bangladesh', '$2b$10$IFNr/gMmsTGm294MYrq7CuefneZTOx6yS9yuL9tI1dzQvVF2z3Pla', 'user', 'none', NULL, '2025-12-10 06:00:09', '2025-12-10 06:00:09', 0.00, NULL),
(19, 'Test User 8719', 'test6077', '017008719', 'Bangladesh', '$2b$10$QCwpdQlmmTbdNBWZRNcNu.oDvYDtGD9xiLMdsA4pK8Ei7tiR4U756', 'user', 'none', NULL, '2025-12-10 06:53:30', '2025-12-10 06:53:30', 0.00, NULL),
(20, 'Test User', 'test7002', '01734748821', 'Bangladesh', '$2b$10$8SLo55yl2elBJQvtZUy1UOLRMwD76b6ViG/bF558MyXdAoqruuoZy', 'user', 'none', NULL, '2025-12-10 07:49:47', '2025-12-10 07:49:47', 0.00, NULL),
(21, 'Debug User', 'debug8642', '01710966884', 'Bangladesh', '$2b$10$BhZyqW70RNpt0TjydepNF.F0NJKo1YM.uVodtB49EzOQc0QkPIk6.', 'user', 'none', NULL, '2025-12-11 06:31:13', '2025-12-11 06:31:13', 0.00, NULL),
(22, 'user-14', 'user-143393', '01714141414', 'Bangladesh', '$2b$10$xhRAtNHiQkvhNbi.rX1tF.gCbDjfHIajDhaDqKBvkWQspUQueNATe', 'user', 'none', NULL, '2025-12-11 06:33:34', '2025-12-11 06:33:34', 0.00, NULL),
(23, 'Test User 99', 'test3696', '0170099', 'Bangladesh', '$2b$10$49IozahDnPqwOwao2uNApuEvxUSQzxmmqaiewv9rkpCdf8gzFGXyS', 'user', 'none', NULL, '2025-12-11 12:34:30', '2025-12-11 12:34:30', 0.00, NULL),
(24, 'user-15', 'user-155711', '01715151515', 'bnagladesh', '$2b$10$XUZWsfZYNdzJpe9Q9Q4hKOOI1dHyyT7aCCUeWqNsSj4n4qheUr7gy', 'user', 'none', NULL, '2025-12-11 12:35:09', '2025-12-11 12:35:09', 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(255) DEFAULT 'BDT',
  `isActive` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `game_balance` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `userId`, `balance`, `currency`, `isActive`, `createdAt`, `updatedAt`, `game_balance`) VALUES
(1, 2, 0.00, 'BDT', 0, '2025-12-09 10:15:12', '2025-12-09 10:15:12', 0.00),
(2, 3, 1487.00, 'BDT', 0, '2025-12-09 11:07:52', '2025-12-11 07:05:34', 0.00),
(3, 4, 0.00, 'BDT', 0, '2025-12-09 11:12:24', '2025-12-09 11:12:24', 0.00),
(4, 5, 3200.00, 'BDT', 0, '2025-12-09 11:59:56', '2025-12-13 12:20:40', 160.00),
(5, 6, 0.00, 'BDT', 0, '2025-12-09 12:14:18', '2025-12-09 12:14:18', 0.00),
(6, 7, 0.00, 'BDT', 0, '2025-12-09 12:28:33', '2025-12-09 12:28:33', 0.00),
(7, 8, 0.00, 'BDT', 0, '2025-12-09 12:29:21', '2025-12-09 12:29:21', 0.00),
(8, 9, 0.00, 'BDT', 0, '2025-12-09 12:29:59', '2025-12-09 12:29:59', 0.00),
(9, 10, 0.00, 'BDT', 0, '2025-12-09 12:39:01', '2025-12-09 12:39:01', 0.00),
(10, 11, 0.00, 'BDT', 0, '2025-12-09 23:54:49', '2025-12-09 23:54:49', 0.00),
(11, 12, 0.00, 'BDT', 0, '2025-12-09 23:55:26', '2025-12-09 23:55:26', 0.00),
(12, 13, 0.00, 'BDT', 0, '2025-12-09 23:56:02', '2025-12-09 23:56:02', 0.00),
(13, 14, 0.00, 'BDT', 0, '2025-12-10 02:08:19', '2025-12-10 02:08:19', 0.00),
(14, 15, 0.00, 'BDT', 0, '2025-12-10 02:26:32', '2025-12-10 02:26:32', 0.00),
(15, 16, 0.00, 'BDT', 0, '2025-12-10 03:48:58', '2025-12-10 03:48:58', 0.00),
(17, 18, 5793.00, 'BDT', 0, '2025-12-10 06:00:09', '2025-12-11 07:09:22', 0.00),
(18, 19, 0.00, 'BDT', 0, '2025-12-10 06:53:30', '2025-12-10 06:53:30', 0.00),
(19, 20, 4500.00, 'BDT', 0, '2025-12-10 07:49:47', '2025-12-10 07:49:48', 0.00),
(20, 21, 0.00, 'BDT', 0, '2025-12-11 06:31:13', '2025-12-11 06:31:13', 0.00),
(21, 22, 14998.00, 'BDT', 0, '2025-12-11 06:33:34', '2025-12-11 07:15:08', 0.00),
(22, 23, 0.00, 'BDT', 0, '2025-12-11 12:34:30', '2025-12-11 12:34:30', 0.00),
(23, 24, 0.00, 'BDT', 0, '2025-12-11 12:35:09', '2025-12-11 12:35:09', 0.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agentdocs`
--
ALTER TABLE `agentdocs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `auditlogs`
--
ALTER TABLE `auditlogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `adminId` (`adminId`);

--
-- Indexes for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `gamelogs`
--
ALTER TABLE `gamelogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `gamesettings`
--
ALTER TABLE `gamesettings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settingName` (`settingName`),
  ADD UNIQUE KEY `settingName_2` (`settingName`),
  ADD UNIQUE KEY `settingName_3` (`settingName`),
  ADD UNIQUE KEY `settingName_4` (`settingName`),
  ADD UNIQUE KEY `settingName_5` (`settingName`),
  ADD UNIQUE KEY `settingName_6` (`settingName`),
  ADD UNIQUE KEY `settingName_7` (`settingName`),
  ADD UNIQUE KEY `settingName_8` (`settingName`),
  ADD UNIQUE KEY `settingName_9` (`settingName`),
  ADD UNIQUE KEY `settingName_10` (`settingName`),
  ADD UNIQUE KEY `settingName_11` (`settingName`),
  ADD UNIQUE KEY `settingName_12` (`settingName`),
  ADD UNIQUE KEY `settingName_13` (`settingName`),
  ADD UNIQUE KEY `settingName_14` (`settingName`),
  ADD UNIQUE KEY `settingName_15` (`settingName`),
  ADD UNIQUE KEY `settingName_16` (`settingName`),
  ADD UNIQUE KEY `settingName_17` (`settingName`),
  ADD UNIQUE KEY `settingName_18` (`settingName`),
  ADD UNIQUE KEY `settingName_19` (`settingName`),
  ADD UNIQUE KEY `settingName_20` (`settingName`),
  ADD UNIQUE KEY `settingName_21` (`settingName`),
  ADD UNIQUE KEY `settingName_22` (`settingName`),
  ADD UNIQUE KEY `settingName_23` (`settingName`),
  ADD UNIQUE KEY `settingName_24` (`settingName`),
  ADD UNIQUE KEY `settingName_25` (`settingName`),
  ADD UNIQUE KEY `settingName_26` (`settingName`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `assignedAgentId` (`assignedAgentId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `phone_2` (`phone`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `phone_3` (`phone`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `phone_4` (`phone`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `phone_5` (`phone`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `phone_6` (`phone`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `phone_7` (`phone`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `phone_8` (`phone`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `phone_9` (`phone`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `phone_10` (`phone`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `phone_11` (`phone`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `phone_12` (`phone`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `phone_13` (`phone`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `phone_14` (`phone`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `phone_15` (`phone`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `phone_16` (`phone`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `phone_17` (`phone`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `phone_18` (`phone`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `phone_19` (`phone`),
  ADD UNIQUE KEY `username_20` (`username`),
  ADD UNIQUE KEY `phone_20` (`phone`),
  ADD UNIQUE KEY `username_21` (`username`),
  ADD UNIQUE KEY `phone_21` (`phone`),
  ADD UNIQUE KEY `username_22` (`username`),
  ADD UNIQUE KEY `phone_22` (`phone`),
  ADD UNIQUE KEY `username_23` (`username`),
  ADD UNIQUE KEY `phone_23` (`phone`),
  ADD UNIQUE KEY `username_24` (`username`),
  ADD UNIQUE KEY `phone_24` (`phone`),
  ADD UNIQUE KEY `username_25` (`username`),
  ADD UNIQUE KEY `phone_25` (`phone`),
  ADD UNIQUE KEY `username_26` (`username`),
  ADD UNIQUE KEY `phone_26` (`phone`),
  ADD UNIQUE KEY `username_27` (`username`),
  ADD UNIQUE KEY `phone_27` (`phone`),
  ADD UNIQUE KEY `username_28` (`username`),
  ADD UNIQUE KEY `phone_28` (`phone`),
  ADD UNIQUE KEY `username_29` (`username`),
  ADD UNIQUE KEY `phone_29` (`phone`),
  ADD UNIQUE KEY `username_30` (`username`),
  ADD UNIQUE KEY `phone_30` (`phone`),
  ADD UNIQUE KEY `username_31` (`username`),
  ADD UNIQUE KEY `phone_31` (`phone`),
  ADD UNIQUE KEY `username_32` (`username`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agentdocs`
--
ALTER TABLE `agentdocs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auditlogs`
--
ALTER TABLE `auditlogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `gamelogs`
--
ALTER TABLE `gamelogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `gamesettings`
--
ALTER TABLE `gamesettings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agentdocs`
--
ALTER TABLE `agentdocs`
  ADD CONSTRAINT `agentdocs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_11` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_13` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_21` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_25` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_27` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agentdocs_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `auditlogs`
--
ALTER TABLE `auditlogs`
  ADD CONSTRAINT `auditlogs_ibfk_1` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_10` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_11` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_12` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_13` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_14` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_15` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_16` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_17` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_18` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_19` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_2` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_20` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_21` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_22` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_23` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_24` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_25` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_26` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_27` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_28` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_29` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_3` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_30` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_31` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_4` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_5` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_6` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_7` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_8` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `auditlogs_ibfk_9` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD CONSTRAINT `deposit_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_11` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_13` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_21` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_25` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_27` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_28` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deposit_requests_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `gamelogs`
--
ALTER TABLE `gamelogs`
  ADD CONSTRAINT `gamelogs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_11` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_13` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_21` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_25` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_27` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gamelogs_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `Transactions_assignedAgentId_foreign_idx` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_11` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_13` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_15` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_17` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_19` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_21` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_23` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_25` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_27` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_28` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_29` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_30` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_31` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_32` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_33` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_34` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_35` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_36` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_37` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_38` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_39` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_40` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_41` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_42` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_43` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_44` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_45` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_46` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_47` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_48` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_49` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_5` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_50` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_51` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_52` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_53` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_54` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_55` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_56` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_57` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_58` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_59` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_7` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_9` FOREIGN KEY (`assignedAgentId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_11` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_13` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_21` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_25` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_27` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_28` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_29` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_30` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_31` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallets_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

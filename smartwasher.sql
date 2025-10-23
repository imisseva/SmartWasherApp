-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2025 at 05:22 PM
-- Server version: 8.0.41
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smartwasher`
--
CREATE DATABASE IF NOT EXISTS `smartwasher` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smartwasher`;

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'phong27', '1234', 'user', '2025-10-12 23:59:38'),
(2, 'linh99', '12345', 'user', '2025-10-12 23:59:38'),
(3, 'admin', 'admin123', 'admin', '2025-10-12 23:59:38'),
(4, 'trp123', '1234', 'user', '2025-10-18 04:04:32'),
(5, 'dang123', '1234', 'user', '2025-10-20 18:22:33');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` int NOT NULL,
  `account_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `account_id`, `name`, `email`, `phone`) VALUES
(1, 3, 'Admin System', 'admin@smartwasher.com', '0908888888');

-- --------------------------------------------------------

--
-- Stand-in structure for view `daily_revenue`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `daily_revenue`;
CREATE TABLE `daily_revenue` (
`date` date
,`total_income` decimal(32,2)
,`total_washes` bigint
);

-- --------------------------------------------------------

--
-- Table structure for table `revenue`
--

DROP TABLE IF EXISTS `revenue`;
CREATE TABLE `revenue` (
  `id` int NOT NULL,
  `date` date NOT NULL,
  `total_income` decimal(10,2) DEFAULT '0.00',
  `total_washes` int DEFAULT '0',
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL,
  `account_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_washes` int DEFAULT '0',
  `free_washes_left` int DEFAULT '4',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_reset` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `account_id`, `name`, `email`, `phone`, `total_washes`, `free_washes_left`, `created_at`, `last_reset`) VALUES
(1, 1, 'Nguyễn Phong', 'phong@example.com', '0901234567', 1, 3, '2025-10-12 23:59:38', '2025-10-23 22:21:31'),
(2, 2, 'Hoàng Linh', 'linh@example.com', '0909999999', 8, 0, '2025-10-12 23:59:38', '2025-10-23 22:21:31'),
(3, 4, 'phong nguyen', 'trp@example.com', '0979520852', 9, 0, '2025-10-18 04:04:32', '2025-10-23 22:21:31'),
(4, 5, 'Đăng', 'dang@example.com', '0979520855', 3, 1, '2025-10-20 18:22:33', '2025-10-23 22:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `washer`
--

DROP TABLE IF EXISTS `washer`;
CREATE TABLE `washer` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` float DEFAULT '7',
  `price` decimal(10,2) DEFAULT '15000.00',
  `status` enum('available','running','error') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `ip_address` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `washer`
--

INSERT INTO `washer` (`id`, `name`, `location`, `weight`, `price`, `status`, `ip_address`, `last_used`) VALUES
(1, 'Máy giặt 1', 'Ký túc xá A', 8, 15000.00, 'available', '10.13.37.2', '2025-10-23 22:12:53'),
(2, 'Máy giặt B', 'Ký túc xá B', 10, 15000.00, 'available', '172.20.10.11', '2025-10-23 22:09:31'),
(3, 'Máy giặt C', 'Ký túc xá C', 7, 10000.00, 'running', '127.1.1.8', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wash_history`
--

DROP TABLE IF EXISTS `wash_history`;
CREATE TABLE `wash_history` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `washer_id` int NOT NULL,
  `requested_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wash_history`
--

INSERT INTO `wash_history` (`id`, `user_id`, `washer_id`, `requested_at`, `start_time`, `end_time`, `cost`) VALUES
(1, 2, 1, '2025-10-15 22:31:08', NULL, NULL, 5625.00),
(2, 2, 1, '2025-10-15 22:31:12', NULL, NULL, 5625.00),
(3, 2, 1, '2025-10-15 22:42:01', NULL, NULL, 15000.00),
(4, 2, 1, '2025-10-15 22:42:02', NULL, NULL, 15000.00),
(5, 1, 2, '2025-10-15 22:43:02', NULL, NULL, 15000.00),
(6, 1, 1, '2025-10-15 23:14:33', NULL, NULL, 15000.00),
(7, 1, 1, '2025-10-16 00:23:10', NULL, NULL, 7500.00),
(8, 1, 1, '2025-10-16 22:14:54', NULL, NULL, 9375.00),
(9, 2, 1, '2025-10-16 22:20:59', NULL, NULL, 15000.00),
(10, 1, 1, '2025-10-16 22:34:44', NULL, NULL, 5625.00),
(11, 2, 1, '2025-10-16 23:17:11', NULL, NULL, 5625.00),
(12, 1, 1, '2025-10-16 23:23:31', NULL, NULL, 5625.00),
(13, 1, 1, '2025-10-16 23:29:51', NULL, NULL, 3750.00),
(14, 1, 1, '2025-10-16 23:31:42', NULL, NULL, 15000.00),
(15, 1, 1, '2025-10-16 23:39:42', NULL, NULL, 3750.00),
(16, 1, 1, '2025-10-16 23:47:16', NULL, NULL, 15000.00),
(17, 1, 1, '2025-10-16 23:51:23', NULL, NULL, 13125.00),
(18, 1, 1, '2025-10-17 17:03:47', NULL, NULL, 0.00),
(19, 1, 1, '2025-10-17 17:04:02', NULL, NULL, 0.00),
(20, 1, 1, '2025-10-17 17:04:12', NULL, NULL, 0.00),
(21, 1, 1, '2025-10-17 17:04:17', NULL, NULL, 0.00),
(22, 1, 1, '2025-10-17 17:04:25', NULL, NULL, 0.00),
(23, 2, 1, '2025-10-17 17:06:40', NULL, NULL, 0.00),
(24, 2, 1, '2025-10-18 03:38:46', NULL, NULL, 0.00),
(25, 2, 3, '2025-10-18 03:38:57', NULL, NULL, 0.00),
(26, 2, 2, '2025-10-18 03:39:04', NULL, NULL, 0.00),
(27, 2, 1, '2025-10-18 03:39:10', NULL, NULL, 0.00),
(28, 2, 1, '2025-10-18 03:42:25', NULL, NULL, 0.00),
(29, 2, 3, '2025-10-18 03:42:39', NULL, NULL, 0.00),
(30, 2, 2, '2025-10-18 03:42:47', NULL, NULL, 0.00),
(31, 2, 3, '2025-10-18 03:42:56', NULL, NULL, 0.00),
(32, 2, 1, '2025-10-18 03:46:28', NULL, NULL, 0.00),
(33, 2, 3, '2025-10-18 03:46:43', NULL, NULL, 0.00),
(34, 2, 3, '2025-10-18 03:46:49', NULL, NULL, 0.00),
(35, 2, 1, '2025-10-18 03:46:55', NULL, NULL, 0.00),
(36, 2, 1, '2025-10-18 03:47:01', NULL, NULL, 0.00),
(37, 1, 1, '2025-10-18 04:14:14', NULL, NULL, 0.00),
(38, 3, 1, '2025-10-18 19:12:18', NULL, NULL, 0.00),
(39, 3, 2, '2025-10-18 19:12:26', NULL, NULL, 0.00),
(40, 3, 3, '2025-10-18 19:12:32', NULL, NULL, 0.00),
(41, 3, 1, '2025-10-18 19:12:40', NULL, NULL, 0.00),
(42, 3, 1, '2025-10-18 19:12:47', NULL, NULL, 15000.00),
(43, 3, 1, '2025-10-19 14:55:38', NULL, NULL, 3750.00),
(44, 4, 1, '2025-10-20 18:22:50', NULL, NULL, 0.00),
(45, 2, 2, '2025-10-23 07:44:59', NULL, NULL, 0.00),
(46, 2, 1, '2025-10-23 07:52:31', NULL, NULL, 0.00),
(47, 2, 1, '2025-10-23 08:03:41', NULL, NULL, 0.00),
(48, 2, 1, '2025-10-23 09:46:42', NULL, NULL, 0.00),
(49, 2, 2, '2025-10-23 09:49:44', NULL, NULL, 15000.00),
(50, 3, 1, '2025-10-23 11:45:13', NULL, NULL, 15000.00),
(51, 3, 1, '2025-10-23 14:40:55', NULL, NULL, 15000.00),
(52, 3, 2, '2025-10-23 15:03:25', NULL, NULL, 15000.00),
(53, 4, 2, '2025-10-23 22:00:27', NULL, NULL, 0.00),
(54, 4, 2, '2025-10-23 22:02:51', NULL, NULL, 0.00),
(55, 2, 1, '2025-10-23 22:07:21', NULL, NULL, 5625.00),
(56, 2, 1, '2025-10-23 22:08:48', NULL, NULL, 15000.00),
(57, 2, 1, '2025-10-23 22:12:40', NULL, NULL, 15000.00);

-- --------------------------------------------------------

--
-- Structure for view `daily_revenue`
--
DROP TABLE IF EXISTS `daily_revenue`;

DROP VIEW IF EXISTS `daily_revenue`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_revenue`  AS SELECT cast(`wash_history`.`requested_at` as date) AS `date`, sum(`wash_history`.`cost`) AS `total_income`, count(0) AS `total_washes` FROM `wash_history` GROUP BY cast(`wash_history`.`requested_at` as date) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `revenue`
--
ALTER TABLE `revenue`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `washer`
--
ALTER TABLE `washer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wash_history`
--
ALTER TABLE `wash_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `washer_id` (`washer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `revenue`
--
ALTER TABLE `revenue`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `washer`
--
ALTER TABLE `washer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wash_history`
--
ALTER TABLE `wash_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`);

--
-- Constraints for table `wash_history`
--
ALTER TABLE `wash_history`
  ADD CONSTRAINT `wash_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `wash_history_ibfk_2` FOREIGN KEY (`washer_id`) REFERENCES `washer` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

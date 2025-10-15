-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 15, 2025 at 10:56 AM
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
(3, 'admin', 'admin123', 'admin', '2025-10-12 23:59:38');

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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `account_id`, `name`, `email`, `phone`, `total_washes`, `free_washes_left`, `created_at`) VALUES
(1, 1, 'Nguyễn Phong', 'phong@example.com', '0901234567', 0, 4, '2025-10-12 23:59:38'),
(2, 2, 'Hoàng Linh', 'linh@example.com', '0909999999', 0, 4, '2025-10-12 23:59:38');

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
(1, 'Máy giặt 1', 'Ký túc xá A', 8, 15000.00, 'available', '192.168.2.20', NULL),
(2, 'Máy giặt 2', 'Ký túc xá B', 10, 15000.00, 'available', '192.168.2.21', NULL);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `washer`
--
ALTER TABLE `washer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wash_history`
--
ALTER TABLE `wash_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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

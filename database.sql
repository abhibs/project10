-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 02, 2026 at 01:31 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project10`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` bigint(20) DEFAULT NULL,
  `address` longtext DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `password_hint` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `phone`, `address`, `image`, `email_verified_at`, `password`, `password_hint`, `created_at`, `updated_at`) VALUES
(1, 'Abhiram', 'abhirambs97@gmail.com', 9481187122, 'Javalli Tudoor Thirthahalli Shimoga Karnataka 577226', NULL, NULL, '$2y$10$ppIPG38oiWAeCPkwQuJMueOAP.JhZZzX.myXFr1nWZH4K3ucDWpZq', '12345678', '2026-09-24 04:34:59', '2026-09-24 04:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(10) UNSIGNED NOT NULL,
  `branch_id` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `image` varchar(160) DEFAULT NULL,
  `area` varchar(160) NOT NULL,
  `city` varchar(120) NOT NULL,
  `state` varchar(120) NOT NULL,
  `pincode` char(6) NOT NULL,
  `timings` varchar(160) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `url` varchar(2048) NOT NULL DEFAULT '',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `address` varchar(2000) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `branch_id`, `name`, `slug`, `image`, `area`, `city`, `state`, `pincode`, `timings`, `latitude`, `longitude`, `url`, `status`, `address`, `created_at`, `updated_at`) VALUES
(3, 'AGPL001', 'Malleswaram', 'malleswaram', 'AGPL001-5be35a92-2581-4c8c-ab4c-3bbbfb70d249.webp', 'Malleswaram', 'Bengaluru', 'Karnataka', '560003', '9:30 AM - 6:00 PM', '13.0013082', '77.5714447', 'https://maps.app.goo.gl/MNfNsHhurwNn9XXQ8', 'active', 'No.353\\1, 2nd Floor, 10th Cross, Sampige Road, Next To Fastrack Showroom', '2026-09-30 20:02:31', '2026-09-30 20:19:58'),
(11, 'AGPL002', 'White Field', 'white-field', 'AGPL002-2d8ca8ed-7897-47ce-962e-080c0de99900.webp', 'Whitefield Main Road', 'Bengaluru', 'Karnataka', '560066', '9:30 AM - 6:00 PM', '12.9692014', '77.7499764', 'https://maps.app.goo.gl/SyanXLoF7pBczUBn7', 'active', '#2 1st floor Mayuri Bakery Lane , Immidihalli Main road whitefield. opposite masjid Near towards Marthahalli bmtc bus stop', '2026-09-30 20:37:50', '2026-09-30 20:37:50');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `city` varchar(255) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `preffered_date` date DEFAULT NULL,
  `preffered_time` varchar(20) DEFAULT NULL COMMENT '24-hour time or time range',
  `services` varchar(255) NOT NULL,
  `business_type` enum('Branch Visit','Doorstep Service','Quick Contact','Contact Page') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `mobile`, `city`, `weight`, `preffered_date`, `preffered_time`, `services`, `business_type`, `created_at`, `updated_at`) VALUES
(1, 'Abhiram', '9481187122', 'Shimoga', '10.00', '2026-09-30', '09:00-12:00', 'Release Pledged Gold', 'Branch Visit', '2026-09-30 06:31:25', '2026-09-30 06:31:25'),
(2, 'abhiram', '9481187122', NULL, NULL, NULL, NULL, 'Gold Rate / Valuation', 'Quick Contact', '2026-09-30 06:31:46', '2026-09-30 06:31:46');

-- --------------------------------------------------------

--
-- Table structure for table `rates`
--

CREATE TABLE `rates` (
  `id` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `gold_24` decimal(10,2) NOT NULL CHECK (`gold_24` > 0),
  `gold_22` decimal(10,2) NOT NULL CHECK (`gold_22` > 0),
  `gold_18` decimal(10,2) NOT NULL CHECK (`gold_18` > 0),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `rates`
--

INSERT INTO `rates` (`id`, `gold_24`, `gold_22`, `gold_18`, `created_at`, `updated_at`) VALUES
(1, '14000.00', '12000.00', '10000.00', '2026-09-25 05:53:05', '2026-09-30 06:32:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_unique` (`email`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branches_branch_id_unique` (`branch_id`),
  ADD UNIQUE KEY `branches_slug_unique` (`slug`),
  ADD KEY `branches_status_city` (`status`,`city`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contacts_created_at_index` (`created_at`),
  ADD KEY `contacts_business_type_index` (`business_type`);

--
-- Indexes for table `rates`
--
ALTER TABLE `rates`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

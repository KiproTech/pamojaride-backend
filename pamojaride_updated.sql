/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.5-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: pamojaride
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB-4 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `active_sessions`
--

DROP TABLE IF EXISTS `active_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `active_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `active_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `active_sessions`
--

LOCK TABLES `active_sessions` WRITE;
/*!40000 ALTER TABLE `active_sessions` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `active_sessions` VALUES
(1,1,'Chrome Browser - Windows 10','192.168.1.10','2026-03-08 12:03:39');
/*!40000 ALTER TABLE `active_sessions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Temporary table structure for view `all_trips`
--

DROP TABLE IF EXISTS `all_trips`;
/*!50001 DROP VIEW IF EXISTS `all_trips`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `all_trips` AS SELECT
 1 AS `id`,
  1 AS `driver_id`,
  1 AS `start_location`,
  1 AS `end_location`,
  1 AS `departure_datetime`,
  1 AS `seats_available`,
  1 AS `price_per_seat`,
  1 AS `status`,
  1 AS `created_at`,
  1 AS `cancelled_by`,
  1 AS `cancelled_at`,
  1 AS `total_collected` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `trip_id` bigint(20) DEFAULT NULL,
  `trip_history_id` bigint(20) DEFAULT NULL,
  `passenger_id` bigint(20) NOT NULL,
  `seat_number` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('mpesa','cash','card') DEFAULT 'mpesa',
  `booking_status` enum('active','cancelled','completed') DEFAULT 'active',
  `cancelled_by` enum('driver','passenger','system') DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `refund_status` enum('pending','refunded','failed') DEFAULT 'pending',
  `refund_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_bookings_passenger` (`passenger_id`),
  KEY `fk_bookings_trip` (`trip_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_passenger_id_fk` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `bookings` VALUES
(54,20,NULL,15,1,600.00,'mpesa','cancelled','passenger','2026-03-19 11:17:27','pending',0.00,'2026-03-19 11:14:51'),
(55,20,NULL,15,6,600.00,'mpesa','cancelled','passenger','2026-03-19 11:35:56','pending',0.00,'2026-03-19 11:32:52'),
(56,20,NULL,15,2,600.00,'mpesa','cancelled','passenger','2026-03-19 19:27:16','pending',0.00,'2026-03-19 11:37:12'),
(57,20,NULL,15,4,600.00,'mpesa','cancelled','passenger','2026-03-20 06:11:06','pending',0.00,'2026-03-19 19:27:19'),
(58,20,NULL,15,6,600.00,'mpesa','cancelled','passenger','2026-03-20 06:12:02','pending',0.00,'2026-03-20 06:11:10'),
(59,20,NULL,15,5,600.00,'mpesa','cancelled','passenger','2026-03-20 06:47:47','pending',0.00,'2026-03-20 06:12:05'),
(60,20,NULL,15,3,600.00,'mpesa','cancelled','passenger','2026-03-20 07:05:35','pending',0.00,'2026-03-20 06:47:50'),
(61,20,NULL,15,3,600.00,'mpesa','cancelled','passenger','2026-03-20 07:10:07','pending',0.00,'2026-03-20 07:05:43'),
(62,20,NULL,15,5,600.00,'mpesa','cancelled','passenger','2026-03-20 07:18:12','pending',0.00,'2026-03-20 07:10:10'),
(63,20,NULL,15,3,600.00,'mpesa','cancelled','passenger','2026-03-20 07:24:49','pending',0.00,'2026-03-20 07:18:15'),
(64,20,NULL,15,3,600.00,'mpesa','cancelled','passenger','2026-03-20 07:26:51','pending',0.00,'2026-03-20 07:24:51'),
(65,20,NULL,15,1,600.00,'mpesa','cancelled','passenger','2026-03-20 07:27:23','pending',0.00,'2026-03-20 07:26:54'),
(66,20,NULL,15,2,600.00,'mpesa','cancelled','passenger','2026-03-20 07:29:25','pending',0.00,'2026-03-20 07:27:31'),
(67,20,NULL,15,2,600.00,'mpesa','cancelled','passenger','2026-03-20 07:35:34','pending',0.00,'2026-03-20 07:29:30'),
(68,20,NULL,15,1,600.00,'mpesa','cancelled','passenger','2026-03-20 07:57:23','pending',0.00,'2026-03-20 07:35:36'),
(69,20,NULL,15,5,600.00,'mpesa','cancelled','passenger','2026-03-20 08:07:17','pending',0.00,'2026-03-20 07:58:11'),
(70,20,NULL,15,1,600.00,'mpesa','active',NULL,NULL,'pending',0.00,'2026-03-20 08:07:22');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `driver_verifications`
--

DROP TABLE IF EXISTS `driver_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_verifications` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `driver_id` bigint(20) NOT NULL,
  `id_document` varchar(255) NOT NULL,
  `selfie_with_id` varchar(255) NOT NULL,
  `license_document` varchar(255) DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `driver_verifications_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_verifications`
--

LOCK TABLES `driver_verifications` WRITE;
/*!40000 ALTER TABLE `driver_verifications` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `driver_verifications` VALUES
(1,1,'id_doc.pdf','selfie_id.jpg','driver_license.pdf','pending','2026-03-08 12:03:36',NULL);
/*!40000 ALTER TABLE `driver_verifications` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `earnings`
--

DROP TABLE IF EXISTS `earnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `earnings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `driver_id` bigint(20) NOT NULL,
  `trip_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','refunded') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `driver_id` (`driver_id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `earnings_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `earnings_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `earnings`
--

LOCK TABLES `earnings` WRITE;
/*!40000 ALTER TABLE `earnings` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `earnings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `passenger_id` bigint(20) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `notifications_passenger_fk` (`passenger_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_passenger_fk` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `notifications` VALUES
(1,NULL,'Trip Reminder','Your trip to Nairobi tomorrow is confirmed!',NULL,'reminder',1,'2026-03-15 21:53:25',15,'2026-03-19 00:29:39'),
(2,NULL,'Promotion','Get 10% off on your next ride!',NULL,'promo',1,'2026-03-15 21:53:25',15,'2026-03-19 00:29:39'),
(3,NULL,'Trip Cancelled','Your trip scheduled for Friday has been cancelled.',NULL,'alert',1,'2026-03-15 21:53:25',15,'2026-03-19 00:29:39'),
(4,NULL,'Upcoming Trip','Your trip to Eldoret is scheduled for tomorrow 8:00 AM',NULL,'reminder',1,'2026-03-17 21:40:32',15,'2026-03-19 00:29:39'),
(5,NULL,'Trip Completed','Your trip to Mombasa has been completed successfully',NULL,'alert',1,'2026-03-17 21:40:32',15,'2026-03-19 00:29:39'),
(6,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',1,'2026-03-18 17:20:05',15,'2026-03-19 00:29:39'),
(7,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-18 17:20:05',15,'2026-03-18 17:20:05'),
(8,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',1,'2026-03-18 21:20:55',15,'2026-03-19 00:29:39'),
(9,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-18 21:20:55',15,'2026-03-18 21:20:55'),
(10,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',1,'2026-03-18 23:39:30',15,'2026-03-19 00:29:39'),
(11,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-18 23:39:30',15,'2026-03-18 23:39:30'),
(12,NULL,'Trip Booked','Your trip from Mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-18 23:54:52',15,'2026-03-19 00:29:39'),
(13,2,'New Booking','Passenger Amos booked a trip from Mombasa → Nairobi.',NULL,'alert',0,'2026-03-18 23:54:54',NULL,'2026-03-18 23:54:54'),
(14,NULL,'Trip Reminder','Your trip to Nairobi tomorrow is confirmed!',NULL,'reminder',1,'2026-03-19 00:39:47',15,'2026-03-19 00:40:20'),
(15,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-19 11:09:12',15,'2026-03-19 11:09:12'),
(16,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-19 11:09:12',NULL,'2026-03-19 11:09:12'),
(17,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-19 11:14:51',15,'2026-03-19 11:14:51'),
(18,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-19 11:14:51',NULL,'2026-03-19 11:14:51'),
(19,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',1,'2026-03-19 11:17:27',15,'2026-03-19 19:27:10'),
(20,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-19 11:17:27',15,'2026-03-19 11:17:27'),
(21,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-19 11:32:52',15,'2026-03-19 11:32:52'),
(22,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-19 11:32:52',NULL,'2026-03-19 11:32:52'),
(23,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',1,'2026-03-19 11:35:56',15,'2026-03-19 19:27:10'),
(24,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-19 11:35:56',15,'2026-03-19 11:35:56'),
(25,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-19 11:37:12',15,'2026-03-19 11:37:12'),
(26,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-19 11:37:12',NULL,'2026-03-19 11:37:12'),
(27,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',1,'2026-03-19 19:27:16',15,'2026-03-19 19:27:37'),
(28,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-19 19:27:16',15,'2026-03-19 19:27:16'),
(29,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-19 19:27:19',15,'2026-03-19 19:27:19'),
(30,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-19 19:27:19',NULL,'2026-03-19 19:27:19'),
(31,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 06:11:06',15,'2026-03-20 06:11:06'),
(32,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 06:11:06',15,'2026-03-20 06:11:06'),
(33,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 06:11:10',15,'2026-03-20 06:11:10'),
(34,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 06:11:10',NULL,'2026-03-20 06:11:10'),
(35,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 06:12:02',15,'2026-03-20 06:12:02'),
(36,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 06:12:02',15,'2026-03-20 06:12:02'),
(37,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 06:12:05',15,'2026-03-20 06:12:05'),
(38,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 06:12:05',NULL,'2026-03-20 06:12:05'),
(39,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 06:47:47',15,'2026-03-20 06:47:47'),
(40,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 06:47:47',15,'2026-03-20 06:47:47'),
(41,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 06:47:50',15,'2026-03-20 06:47:50'),
(42,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 06:47:50',NULL,'2026-03-20 06:47:50'),
(43,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:05:35',15,'2026-03-20 07:05:35'),
(44,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:05:35',15,'2026-03-20 07:05:35'),
(45,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:05:43',15,'2026-03-20 07:05:43'),
(46,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:05:43',NULL,'2026-03-20 07:05:43'),
(47,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:10:07',15,'2026-03-20 07:10:07'),
(48,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:10:07',15,'2026-03-20 07:10:07'),
(49,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:10:10',15,'2026-03-20 07:10:10'),
(50,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:10:10',NULL,'2026-03-20 07:10:10'),
(51,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:18:12',15,'2026-03-20 07:18:12'),
(52,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:18:12',15,'2026-03-20 07:18:12'),
(53,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:18:15',15,'2026-03-20 07:18:15'),
(54,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:18:15',NULL,'2026-03-20 07:18:15'),
(55,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:24:49',15,'2026-03-20 07:24:49'),
(56,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:24:49',15,'2026-03-20 07:24:49'),
(57,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:24:51',15,'2026-03-20 07:24:51'),
(58,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:24:51',NULL,'2026-03-20 07:24:51'),
(59,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:26:51',15,'2026-03-20 07:26:51'),
(60,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:26:51',15,'2026-03-20 07:26:51'),
(61,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:26:54',15,'2026-03-20 07:26:54'),
(62,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:26:54',NULL,'2026-03-20 07:26:54'),
(63,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:27:23',15,'2026-03-20 07:27:23'),
(64,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:27:23',15,'2026-03-20 07:27:23'),
(65,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:27:31',15,'2026-03-20 07:27:31'),
(66,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:27:31',NULL,'2026-03-20 07:27:31'),
(67,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:29:25',15,'2026-03-20 07:29:25'),
(68,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:29:25',15,'2026-03-20 07:29:25'),
(69,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:29:30',15,'2026-03-20 07:29:30'),
(70,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:29:30',NULL,'2026-03-20 07:29:30'),
(71,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:35:34',15,'2026-03-20 07:35:34'),
(72,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:35:34',15,'2026-03-20 07:35:34'),
(73,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:35:36',15,'2026-03-20 07:35:36'),
(74,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:35:36',NULL,'2026-03-20 07:35:36'),
(75,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 07:57:23',15,'2026-03-20 07:57:23'),
(76,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 07:57:23',15,'2026-03-20 07:57:23'),
(77,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 07:58:11',15,'2026-03-20 07:58:11'),
(78,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 07:58:11',NULL,'2026-03-20 07:58:11'),
(79,NULL,'Trip Cancelled','Your trip from mombasa to Nairobi has been cancelled.',NULL,'alert',0,'2026-03-20 08:07:17',15,'2026-03-20 08:07:17'),
(80,2,'Trip Cancelled','Passenger has cancelled their trip from mombasa to Nairobi.',NULL,'alert',0,'2026-03-20 08:07:17',15,'2026-03-20 08:07:17'),
(81,NULL,'Trip Booked','Your trip from mombasa → Nairobi has been booked.',NULL,'alert',1,'2026-03-20 08:07:22',15,'2026-03-20 08:07:22'),
(82,2,'New Booking','Passenger has booked a trip from mombasa → Nairobi.',NULL,'alert',0,'2026-03-20 08:07:22',NULL,'2026-03-20 08:07:22');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `passengers`
--

DROP TABLE IF EXISTS `passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `passengers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `pox_number` varchar(50) DEFAULT NULL,
  `contact_assistance` varchar(100) DEFAULT NULL,
  `loyalty_points` int(11) DEFAULT 0,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passengers`
--

LOCK TABLES `passengers` WRITE;
/*!40000 ALTER TABLE `passengers` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `passengers` VALUES
(1,'Alice Mwangi','alice@example.com',NULL,'0712345678','',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-02-26 07:39:07','2026-02-26 07:39:07'),
(7,'John Doe','john.doe@example.com',NULL,'0711000001','',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(8,'Jane Smith','jane.smith@example.com',NULL,'0711000002','',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(9,'Peter Kip','peter.kip@example.com',NULL,'0711000003','',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(10,'Alice Njeri','alice.njeri@example.com',NULL,'0711000004','',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(11,'Mark Ouma','mark.ouma@example.com',NULL,'0711000005','',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(12,'Peter Kip','peterkip@test.com',NULL,'0712345679','$2b$10$KNKllh.R4nM5OhILKvOdMeDi1qcGNYynZIoO6K7kqGxGiX1neFbg.',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-13 16:30:57','2026-03-13 16:30:57'),
(15,'Jane Smith','jdane.smith@example.com',NULL,'+254701234567','$2b$10$uGnjdkPeheX86nsy0j2LIuoYoBVpsshg0CA3EQeD180n8dKTputya',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:07:02','2026-03-16 10:57:03'),
(16,'fvfv bcbj','newdriver@test.com',NULL,'3223232332','$2b$10$WJAQAQD7V5AnGYnGnUzML.7GRF08FFPjW/CJvwJESTtWGSaiMlXie',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:33:19','2026-03-14 18:33:19'),
(17,'Amos Kiprotich','Radio@gmail.com',NULL,'0729326900','$2b$10$zwyOCCZ5EtkwWe6Fq12es.hd4tgWAu90mBmI8ylUERNBSrcDNTLoC',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:35:28','2026-03-14 18:35:28'),
(18,'Amos Kosgei','newdriver@test1.com',NULL,'0712345671','$2b$10$i.D1mDTTWI29XvbB3SWWBeNZOylkY2SB6ZvfqMZgQs.NvlBnXmh6m',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:41:26','2026-03-14 18:41:26'),
(19,'sgg jdjh','Radio1@gmail.com',NULL,'9999999999','$2b$10$upf.YuDap5pOQhfWFPgOy.y9CNS0o3CYnrA05AKpGS2m8O3j98EFq',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:42:01','2026-03-14 18:42:01'),
(20,'Amos Kiprotich','newdrivesr@test1.com',NULL,'8888888888','$2b$10$nE..AzLVsXeXinKKFVWP5utZLgEmnA.LMlHpDODyUcY1nJU2yx71K',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:44:50','2026-03-14 18:44:50'),
(21,'Amos Kiprotich','kipe@gmail.com',NULL,'2323232323','$2b$10$IiS1DU/HHzJtvh6LDC.J4eBiO16X7USoS1pfJIoX30FzIqqMnUlvO',NULL,NULL,'active',NULL,1,NULL,NULL,0,NULL,'2026-03-14 18:49:07','2026-03-14 18:49:07'),
(22,'Amos Kiprtich','kip@gmrrail.com',NULL,'4444444444','$2b$10$0APVUCksAYGaByqJlv5A/OigJ6PlRGKRZnMvd87jcouIY8w76Z6mq',NULL,NULL,'active',NULL,1,NULL,NULL,0,'/uploads/profile_pictures/user_22.svg','2026-03-14 19:59:02','2026-03-16 18:35:40');
/*!40000 ALTER TABLE `passengers` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','released','refunded') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT current_timestamp(),
  `released_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `preferences`
--

DROP TABLE IF EXISTS `preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferences` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `show_phone` tinyint(1) DEFAULT 1,
  `show_email` tinyint(1) DEFAULT 1,
  `receive_notifications` tinyint(1) DEFAULT 1,
  `hide_trips` tinyint(1) DEFAULT 0,
  `private_mode` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferences`
--

LOCK TABLES `preferences` WRITE;
/*!40000 ALTER TABLE `preferences` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `preferences` VALUES
(1,1,1,0,1,0,0);
/*!40000 ALTER TABLE `preferences` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `trip_id` bigint(20) NOT NULL,
  `passenger_id` bigint(20) NOT NULL,
  `driver_id` bigint(20) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `review` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ratings_passenger` (`passenger_id`),
  KEY `fk_ratings_driver` (`driver_id`),
  KEY `fk_ratings_trip` (`trip_id`),
  CONSTRAINT `fk_ratings_driver` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`),
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`passenger_id`) REFERENCES `users` (`id`),
  CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ratings` VALUES
(25,11,7,1,5,'Great ride, very punctual.','2026-03-08 00:04:52'),
(26,11,10,1,4,'Comfortable, nice car.','2026-03-08 00:04:52'),
(27,12,1,1,3,'Average experience.','2026-03-08 00:04:52'),
(28,12,8,1,5,'Very friendly driver.','2026-03-08 00:04:52'),
(29,13,7,1,4,'Smooth trip, on time.','2026-03-08 00:04:52'),
(30,13,11,1,5,'Excellent service, clean car.','2026-03-08 00:04:52'),
(31,11,7,1,5,'Great ride, very punctual.','2026-03-08 00:05:09'),
(32,11,10,1,4,'Comfortable, nice car.','2026-03-08 00:05:09'),
(33,12,1,1,3,'Average experience.','2026-03-08 00:05:09'),
(34,12,8,1,5,'Very friendly driver.','2026-03-08 00:05:09'),
(35,13,7,1,4,'Smooth trip, on time.','2026-03-08 00:05:09'),
(36,13,11,1,5,'Excellent service, clean car.','2026-03-08 00:05:09');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `support_messages`
--

DROP TABLE IF EXISTS `support_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `contact_method` enum('phone','whatsapp','email','facebook','twitter') NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','resolved') DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `support_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_messages`
--

LOCK TABLES `support_messages` WRITE;
/*!40000 ALTER TABLE `support_messages` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `support_messages` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `trip_history`
--

DROP TABLE IF EXISTS `trip_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `driver_id` bigint(20) NOT NULL,
  `start_location` varchar(150) NOT NULL,
  `end_location` varchar(150) NOT NULL,
  `departure_datetime` datetime NOT NULL,
  `price_per_seat` decimal(10,2) DEFAULT NULL,
  `seats_available` int(11) DEFAULT NULL,
  `status` enum('completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT current_timestamp(),
  `total_collected` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_history`
--

LOCK TABLES `trip_history` WRITE;
/*!40000 ALTER TABLE `trip_history` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `trip_history` VALUES
(1,1,'kisii','kaplong','2026-03-02 08:00:00',300.00,13,'completed','2026-03-02 07:40:20','2026-03-03 21:42:14',300.00);
/*!40000 ALTER TABLE `trip_history` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `driver_id` bigint(20) NOT NULL,
  `start_location` varchar(150) NOT NULL,
  `end_location` varchar(150) NOT NULL,
  `departure_datetime` datetime NOT NULL,
  `seats_available` int(11) NOT NULL,
  `price_per_seat` decimal(10,2) NOT NULL,
  `status` enum('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `cancelled_by` enum('driver','system') DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `total_collected` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `trips` VALUES
(11,1,'Kisumu','p','2026-03-03 23:00:00',5,44.00,'completed','2026-03-03 22:11:13',NULL,NULL,0.00),
(12,1,'kisumu','kaplong','2026-03-07 09:09:00',2,123.00,'completed','2026-03-07 06:07:51',NULL,NULL,246.00),
(13,1,'Nairobi','mulundu','2026-03-07 09:00:00',5,55.00,'completed','2026-03-07 06:12:16',NULL,NULL,123.00),
(14,1,'Nairobi','kaplong','2026-03-08 04:00:00',4,888.00,'completed','2026-03-07 22:18:53',NULL,NULL,888.00),
(15,1,'kisumu','kaplong','2026-03-08 04:00:00',15,12.00,'completed','2026-03-07 22:44:29',NULL,NULL,0.00),
(16,2,'Nairobi','kaimosi','2026-03-10 08:00:00',6,700.00,'completed','2026-03-10 07:57:21',NULL,NULL,0.00),
(17,1,'kaimosi','kaplong','2026-03-13 20:01:00',14,49.00,'completed','2026-03-13 19:03:14',NULL,NULL,392.00),
(18,1,'kaimosi','nairobi','2026-03-17 12:00:00',4,444.00,'completed','2026-03-17 09:14:53',NULL,NULL,444.00),
(19,1,'kaimosi','nairobi','2026-03-17 15:00:00',12,600.00,'completed','2026-03-17 12:30:40',NULL,NULL,0.00),
(20,2,'mombasa','Nairobi','2026-03-17 20:00:00',6,600.00,'upcoming','2026-03-17 12:35:39',NULL,NULL,0.00),
(21,1,'Nairobi','Eldoret','2026-03-18 08:00:00',5,100.00,'completed','2026-03-17 21:40:29',NULL,NULL,100.00),
(22,1,'Nairobi','Mombasa','2026-03-16 09:00:00',3,200.00,'completed','2026-03-17 21:40:29',NULL,NULL,0.00),
(23,1,'Kisumu','Nairobi','2026-03-17 14:00:00',4,150.00,'completed','2026-03-17 21:40:29',NULL,NULL,0.00);
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `account_status` enum('unverified','pending','verified','rejected') DEFAULT 'unverified',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'Amos Kiprotich','kip@gmail.com','0729327899',NULL,'$2b$10$/kS12iIq4LjF72Qg/W5bPOzVETaYI7Jwu2V35Xp3EY.UEZr/jrY8i',NULL,NULL,'unverified','2026-02-26 07:46:16','2026-02-26 07:46:16'),
(2,'Amos KIprotich','newdriver@test1.com','0723434657',NULL,'$2b$10$DeLqmtQRpEktLF/L7s987.SFPyOQkqc2fklto/iMeBZOinmP6Sqiy',NULL,NULL,'unverified','2026-03-10 07:49:33','2026-03-10 07:49:33'),
(3,'amos Kiprotich','kip@gmrrail.com','2222222222',NULL,'$2b$10$MtMoxmmWobzFW.G77cuAhuqXJnRrZWGKzHn2ndb7tTKtsLRonSrG2',NULL,NULL,'unverified','2026-03-14 20:16:39','2026-03-14 20:16:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `driver_id` bigint(20) NOT NULL,
  `vehicle_type` enum('car','van','bus','lorry') NOT NULL,
  `plate_number` varchar(50) NOT NULL,
  `status` enum('unverified','pending','verified','rejected') DEFAULT 'unverified',
  `logbook_file` varchar(255) DEFAULT NULL,
  `insurance_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate_number` (`plate_number`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `vehicles` VALUES
(1,1,'car','KAA123A','pending','logbook.pdf','insurance.pdf','2026-03-08 12:03:36');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Final view structure for view `all_trips`
--

/*!50001 DROP VIEW IF EXISTS `all_trips`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `all_trips` AS select `trips`.`id` AS `id`,`trips`.`driver_id` AS `driver_id`,`trips`.`start_location` AS `start_location`,`trips`.`end_location` AS `end_location`,`trips`.`departure_datetime` AS `departure_datetime`,`trips`.`seats_available` AS `seats_available`,`trips`.`price_per_seat` AS `price_per_seat`,'completed' AS `status`,`trips`.`created_at` AS `created_at`,`trips`.`cancelled_by` AS `cancelled_by`,`trips`.`cancelled_at` AS `cancelled_at`,`trips`.`total_collected` AS `total_collected` from `trips` where `trips`.`status` = 'completed' union all select `trip_history`.`id` AS `id`,`trip_history`.`driver_id` AS `driver_id`,`trip_history`.`start_location` AS `start_location`,`trip_history`.`end_location` AS `end_location`,`trip_history`.`departure_datetime` AS `departure_datetime`,`trip_history`.`seats_available` AS `seats_available`,`trip_history`.`price_per_seat` AS `price_per_seat`,'completed' AS `status`,`trip_history`.`created_at` AS `created_at`,NULL AS `cancelled_by`,NULL AS `cancelled_at`,`trip_history`.`total_collected` AS `total_collected` from `trip_history` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-03-20 14:33:28

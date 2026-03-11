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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `bookings` VALUES
(13,NULL,1,1,1,300.00,'mpesa','active',NULL,NULL,'pending',0.00,'2026-03-05 22:10:22'),
(26,NULL,1,7,1,300.00,'mpesa','active',NULL,NULL,'pending',0.00,'2026-03-05 23:15:39'),
(27,NULL,1,8,2,300.00,'cash','active',NULL,NULL,'pending',0.00,'2026-03-05 23:15:39'),
(28,NULL,1,9,3,300.00,'card','active',NULL,NULL,'pending',0.00,'2026-03-05 23:15:39'),
(29,NULL,1,10,4,300.00,'mpesa','cancelled','passenger','2026-03-05 23:15:39','pending',0.00,'2026-03-05 23:15:39'),
(30,NULL,1,11,5,300.00,'cash','cancelled','driver','2026-03-05 23:15:39','pending',0.00,'2026-03-05 23:15:39'),
(31,11,NULL,7,1,44.00,'mpesa','cancelled','driver','2026-03-06 12:07:56','pending',0.00,'2026-03-06 11:48:09'),
(32,11,NULL,1,2,44.00,'mpesa','active',NULL,NULL,'pending',0.00,'2026-03-06 11:48:09'),
(33,11,NULL,8,3,44.00,'mpesa','active',NULL,NULL,'pending',0.00,'2026-03-06 11:48:09'),
(34,11,NULL,9,4,44.00,'mpesa','cancelled','driver','2026-03-06 12:12:25','pending',0.00,'2026-03-06 11:48:09'),
(35,11,NULL,10,5,44.00,'mpesa','cancelled','passenger','2026-03-06 02:15:39','pending',0.00,'2026-03-06 11:48:09'),
(36,11,NULL,11,6,44.00,'mpesa','cancelled','passenger','2026-03-06 02:15:39','pending',0.00,'2026-03-06 11:48:09'),
(37,12,NULL,1,1,123.00,'mpesa','completed',NULL,NULL,'pending',0.00,'2026-03-07 06:10:33'),
(38,12,NULL,7,2,123.00,'mpesa','completed',NULL,NULL,'pending',0.00,'2026-03-07 06:10:33'),
(39,13,NULL,1,1,123.00,'mpesa','completed',NULL,NULL,'pending',0.00,'2026-03-07 06:12:56'),
(41,14,NULL,1,1,888.00,'mpesa','completed',NULL,NULL,'pending',0.00,'2026-03-07 22:25:01');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
  `user_id` bigint(20) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
set autocommit=0;
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
  `phone` varchar(30) NOT NULL,
  `pox_number` varchar(50) DEFAULT NULL,
  `contact_assistance` varchar(100) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passengers`
--

LOCK TABLES `passengers` WRITE;
/*!40000 ALTER TABLE `passengers` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `passengers` VALUES
(1,'Alice Mwangi','alice@example.com','0712345678',NULL,NULL,NULL,'2026-02-26 07:39:07','2026-02-26 07:39:07'),
(7,'John Doe','john.doe@example.com','0711000001',NULL,NULL,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(8,'Jane Smith','jane.smith@example.com','0711000002',NULL,NULL,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(9,'Peter Kip','peter.kip@example.com','0711000003',NULL,NULL,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(10,'Alice Njeri','alice.njeri@example.com','0711000004',NULL,NULL,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14'),
(11,'Mark Ouma','mark.ouma@example.com','0711000005',NULL,NULL,NULL,'2026-03-05 23:07:14','2026-03-05 23:07:14');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
(15,1,'kisumu','kaplong','2026-03-08 04:00:00',15,12.00,'ongoing','2026-03-07 22:44:29',NULL,NULL,0.00),
(16,2,'Nairobi','kaimosi','2026-03-10 08:00:00',6,700.00,'completed','2026-03-10 07:57:21',NULL,NULL,0.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'Amos Kiprotich','kip@gmail.com','0729327899',NULL,'$2b$10$/kS12iIq4LjF72Qg/W5bPOzVETaYI7Jwu2V35Xp3EY.UEZr/jrY8i',NULL,NULL,'unverified','2026-02-26 07:46:16','2026-02-26 07:46:16'),
(2,'Amos KIprotich','newdriver@test1.com','0723434657',NULL,'$2b$10$DeLqmtQRpEktLF/L7s987.SFPyOQkqc2fklto/iMeBZOinmP6Sqiy',NULL,NULL,'unverified','2026-03-10 07:49:33','2026-03-10 07:49:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
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

-- Dump completed on 2026-03-11  0:45:06

-- MySQL dump 10.13  Distrib 8.0.45, for macos10.15 (x86_64)
--
-- Host: 127.0.0.1    Database: he5_db
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('1b6453892473a467d07372d45eb05abc2031647a','i:8;',1788991480),('1b6453892473a467d07372d45eb05abc2031647a:timer','i:1788991480;',1788991480),('5c785c036466adea360111aa28563bfd556b5fba','i:4;',1788993315),('5c785c036466adea360111aa28563bfd556b5fba:timer','i:1788993315;',1788993315),('64e095fe763fc62418378753f9402623bea9e227','i:1;',1788993346),('64e095fe763fc62418378753f9402623bea9e227:timer','i:1788993346;',1788993346),('77de68daecd823babbb58edb1c8e14d7106e83bb','i:2;',1788993322),('77de68daecd823babbb58edb1c8e14d7106e83bb:timer','i:1788993322;',1788993322),('902ba3cda1883801594b6e1b452790cc53948fda','i:1;',1788987742),('902ba3cda1883801594b6e1b452790cc53948fda:timer','i:1788987742;',1788987742),('c1dfd96eea8cc2b62785275bca38ac261256e278','i:1;',1788987666),('c1dfd96eea8cc2b62785275bca38ac261256e278:timer','i:1788987666;',1788987666);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_birth_year` int NOT NULL,
  `max_birth_year` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_player`
--

DROP TABLE IF EXISTS `category_player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_player` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  `season_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_player_category_id_foreign` (`category_id`),
  KEY `category_player_player_id_foreign` (`player_id`),
  KEY `category_player_season_id_foreign` (`season_id`),
  CONSTRAINT `category_player_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `category_player_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `category_player_season_id_foreign` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_player`
--

LOCK TABLES `category_player` WRITE;
/*!40000 ALTER TABLE `category_player` DISABLE KEYS */;
/*!40000 ALTER TABLE `category_player` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_deletion_requests`
--

DROP TABLE IF EXISTS `data_deletion_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_deletion_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `status` enum('pending','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `data_deletion_requests_user_id_foreign` (`user_id`),
  CONSTRAINT `data_deletion_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_deletion_requests`
--

LOCK TABLES `data_deletion_requests` WRITE;
/*!40000 ALTER TABLE `data_deletion_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_deletion_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_transactions`
--

DROP TABLE IF EXISTS `financial_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned DEFAULT NULL,
  `game_id` bigint unsigned DEFAULT NULL,
  `season_id` bigint unsigned DEFAULT NULL,
  `type` enum('charge','top_up','payment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `concept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `platform_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `club_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `developer_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `status` enum('pending','partial','paid','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `stripe_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_arbitration_penalty` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `financial_transactions_user_id_foreign` (`user_id`),
  KEY `financial_transactions_player_id_foreign` (`player_id`),
  KEY `financial_transactions_season_id_foreign` (`season_id`),
  KEY `financial_transactions_game_id_foreign` (`game_id`),
  CONSTRAINT `financial_transactions_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_transactions_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_transactions_season_id_foreign` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_transactions`
--

LOCK TABLES `financial_transactions` WRITE;
/*!40000 ALTER TABLE `financial_transactions` DISABLE KEYS */;
INSERT INTO `financial_transactions` VALUES (1,3,27,NULL,NULL,'charge','Inscripción',1250.00,1250.00,0.00,1250.00,0.00,'2026-01-15','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:54:34'),(2,3,27,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,1000.00,0.00,1000.00,0.00,'2026-02-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:54:30'),(3,3,27,NULL,NULL,'charge','Inscripción Torneo',250.00,250.00,0.00,250.00,0.00,'2026-02-15','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:18'),(4,3,27,NULL,NULL,'charge','Uniformes',2000.00,2000.00,0.00,2000.00,0.00,'2026-01-15','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:54:37'),(5,3,27,NULL,NULL,'charge','Mensualidad Enero',500.00,500.00,0.00,500.00,0.00,'2026-01-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:54:40'),(6,3,27,NULL,NULL,'charge','Mensualidad Febrero',500.00,500.00,0.00,500.00,0.00,'2026-02-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:54:32'),(7,3,27,NULL,NULL,'charge','Mensualidad Marzo',500.00,500.00,0.00,500.00,0.00,'2026-03-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:37'),(8,3,27,NULL,NULL,'charge','Mensualidad Abril',500.00,500.00,0.00,500.00,0.00,'2026-04-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:37'),(9,3,27,NULL,NULL,'charge','Mensualidad Mayo',500.00,500.00,0.00,500.00,0.00,'2026-05-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:37'),(10,3,27,NULL,NULL,'charge','Mensualidad Junio',500.00,500.00,0.00,500.00,0.00,'2026-06-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:37'),(11,3,27,NULL,NULL,'charge','Mensualidad Julio',500.00,500.00,0.00,500.00,0.00,'2026-07-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:37'),(12,3,27,NULL,NULL,'charge','Mensualidad Agosto',500.00,500.00,0.00,500.00,0.00,'2026-08-01','paid',NULL,NULL,0,'2026-08-26 10:44:16','2026-08-26 10:53:37'),(17,3,31,NULL,NULL,'charge','Inscripción',1250.00,1250.00,0.00,1250.00,0.00,'2026-01-15','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:47'),(18,3,31,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,1000.00,0.00,1000.00,0.00,'2026-02-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:39'),(19,3,31,NULL,NULL,'charge','Inscripción Torneo',250.00,0.00,0.00,0.00,0.00,'2026-02-15','pending',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:46:37'),(20,3,31,NULL,NULL,'charge','Uniformes',2000.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:46:37'),(21,3,31,NULL,NULL,'charge','Mensualidad Enero',500.00,500.00,0.00,500.00,0.00,'2026-01-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:50'),(22,3,31,NULL,NULL,'charge','Mensualidad Febrero',500.00,500.00,0.00,500.00,0.00,'2026-02-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:44'),(23,3,31,NULL,NULL,'charge','Mensualidad Marzo',500.00,500.00,0.00,500.00,0.00,'2026-03-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:32'),(24,3,31,NULL,NULL,'charge','Mensualidad Abril',500.00,500.00,0.00,500.00,0.00,'2026-04-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:30'),(25,3,31,NULL,NULL,'charge','Mensualidad Mayo',500.00,500.00,0.00,500.00,0.00,'2026-05-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:28'),(26,3,31,NULL,NULL,'charge','Mensualidad Junio',500.00,500.00,0.00,500.00,0.00,'2026-06-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:26'),(27,3,31,NULL,NULL,'charge','Mensualidad Julio',500.00,500.00,0.00,500.00,0.00,'2026-07-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:49:01'),(28,3,31,NULL,NULL,'charge','Mensualidad Agosto',500.00,500.00,0.00,500.00,0.00,'2026-08-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:47:57'),(29,3,31,NULL,NULL,'charge','Mensualidad Septiembre',500.00,500.00,0.00,500.00,0.00,'2026-09-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:47:53'),(30,3,31,NULL,NULL,'charge','Mensualidad Octubre',500.00,500.00,0.00,500.00,0.00,'2026-10-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:47:51'),(31,3,31,NULL,NULL,'charge','Mensualidad Noviembre',500.00,500.00,0.00,500.00,0.00,'2026-11-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:47:43'),(32,3,31,NULL,NULL,'charge','Mensualidad Diciembre',500.00,500.00,0.00,500.00,0.00,'2026-12-01','paid',NULL,NULL,0,'2026-08-26 10:46:37','2026-08-26 10:47:40'),(33,3,27,NULL,NULL,'charge','Mensualidad Septiembre',500.00,0.00,0.00,0.00,0.00,'2026-08-26','pending',NULL,NULL,0,'2026-08-26 10:54:59','2026-08-26 10:55:13'),(34,3,27,NULL,NULL,'charge','Mensualidad Octubre',500.00,0.00,0.00,0.00,0.00,'2026-08-26','pending',NULL,NULL,0,'2026-08-26 10:55:40','2026-08-26 10:55:40'),(35,3,27,NULL,NULL,'charge','Mensualidad Noviembre',500.00,0.00,0.00,0.00,0.00,'2026-08-26','pending',NULL,NULL,0,'2026-08-26 10:55:51','2026-08-26 10:55:51'),(36,3,27,NULL,NULL,'charge','Mensualidad Diciembre',500.00,0.00,0.00,0.00,0.00,'2026-08-26','pending',NULL,NULL,0,'2026-08-26 10:56:03','2026-08-26 10:56:03'),(37,3,21,NULL,NULL,'charge','Inscripción',1250.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(38,3,21,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(39,3,21,NULL,NULL,'charge','Inscripción Torneo',250.00,0.00,0.00,0.00,0.00,'2026-02-15','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(40,3,21,NULL,NULL,'charge','Uniformes',2000.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(41,3,21,NULL,NULL,'charge','Mensualidad Enero',500.00,0.00,0.00,0.00,0.00,'2026-01-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(42,3,21,NULL,NULL,'charge','Mensualidad Febrero',500.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(43,3,21,NULL,NULL,'charge','Mensualidad Marzo',500.00,0.00,0.00,0.00,0.00,'2026-03-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(44,3,21,NULL,NULL,'charge','Mensualidad Abril',500.00,0.00,0.00,0.00,0.00,'2026-04-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(45,3,21,NULL,NULL,'charge','Mensualidad Mayo',500.00,0.00,0.00,0.00,0.00,'2026-05-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(46,3,21,NULL,NULL,'charge','Mensualidad Junio',500.00,0.00,0.00,0.00,0.00,'2026-06-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(47,3,21,NULL,NULL,'charge','Mensualidad Julio',500.00,0.00,0.00,0.00,0.00,'2026-07-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(48,3,21,NULL,NULL,'charge','Mensualidad Agosto',500.00,0.00,0.00,0.00,0.00,'2026-08-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(49,3,21,NULL,NULL,'charge','Mensualidad Septiembre',500.00,0.00,0.00,0.00,0.00,'2026-09-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(50,3,21,NULL,NULL,'charge','Mensualidad Octubre',500.00,0.00,0.00,0.00,0.00,'2026-10-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(51,3,21,NULL,NULL,'charge','Mensualidad Noviembre',500.00,0.00,0.00,0.00,0.00,'2026-11-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(52,3,21,NULL,NULL,'charge','Mensualidad Diciembre',500.00,0.00,0.00,0.00,0.00,'2026-12-01','pending',NULL,NULL,0,'2026-08-26 11:27:39','2026-08-26 11:27:39'),(53,3,12,NULL,NULL,'charge','Inscripción',1250.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(54,3,12,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(55,3,12,NULL,NULL,'charge','Inscripción Torneo',250.00,0.00,0.00,0.00,0.00,'2026-02-15','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(56,3,12,NULL,NULL,'charge','Uniformes',2000.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(57,3,12,NULL,NULL,'charge','Mensualidad Enero',500.00,0.00,0.00,0.00,0.00,'2026-01-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(58,3,12,NULL,NULL,'charge','Mensualidad Febrero',500.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(59,3,12,NULL,NULL,'charge','Mensualidad Marzo',500.00,0.00,0.00,0.00,0.00,'2026-03-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(60,3,12,NULL,NULL,'charge','Mensualidad Abril',500.00,0.00,0.00,0.00,0.00,'2026-04-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(61,3,12,NULL,NULL,'charge','Mensualidad Mayo',500.00,0.00,0.00,0.00,0.00,'2026-05-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(62,3,12,NULL,NULL,'charge','Mensualidad Junio',500.00,0.00,0.00,0.00,0.00,'2026-06-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(63,3,12,NULL,NULL,'charge','Mensualidad Julio',500.00,0.00,0.00,0.00,0.00,'2026-07-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(64,3,12,NULL,NULL,'charge','Mensualidad Agosto',500.00,0.00,0.00,0.00,0.00,'2026-08-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(65,3,12,NULL,NULL,'charge','Mensualidad Septiembre',500.00,0.00,0.00,0.00,0.00,'2026-09-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(66,3,12,NULL,NULL,'charge','Mensualidad Octubre',500.00,0.00,0.00,0.00,0.00,'2026-10-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(67,3,12,NULL,NULL,'charge','Mensualidad Noviembre',500.00,0.00,0.00,0.00,0.00,'2026-11-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(68,3,12,NULL,NULL,'charge','Mensualidad Diciembre',500.00,0.00,0.00,0.00,0.00,'2026-12-01','pending',NULL,NULL,0,'2026-08-26 11:44:45','2026-08-26 11:44:45'),(85,3,9,NULL,NULL,'charge','Inscripción',1250.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(86,3,9,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(87,3,9,NULL,NULL,'charge','Inscripción Torneo',250.00,0.00,0.00,0.00,0.00,'2026-02-15','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(88,3,9,NULL,NULL,'charge','Uniformes',2000.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(89,3,9,NULL,NULL,'charge','Mensualidad Enero',500.00,0.00,0.00,0.00,0.00,'2026-01-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(90,3,9,NULL,NULL,'charge','Mensualidad Febrero',500.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(91,3,9,NULL,NULL,'charge','Mensualidad Marzo',500.00,0.00,0.00,0.00,0.00,'2026-03-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(92,3,9,NULL,NULL,'charge','Mensualidad Abril',500.00,0.00,0.00,0.00,0.00,'2026-04-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(93,3,9,NULL,NULL,'charge','Mensualidad Mayo',500.00,0.00,0.00,0.00,0.00,'2026-05-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(94,3,9,NULL,NULL,'charge','Mensualidad Junio',500.00,0.00,0.00,0.00,0.00,'2026-06-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(95,3,9,NULL,NULL,'charge','Mensualidad Julio',500.00,0.00,0.00,0.00,0.00,'2026-07-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(96,3,9,NULL,NULL,'charge','Mensualidad Agosto',500.00,0.00,0.00,0.00,0.00,'2026-08-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(97,3,9,NULL,NULL,'charge','Mensualidad Septiembre',500.00,0.00,0.00,0.00,0.00,'2026-09-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(98,3,9,NULL,NULL,'charge','Mensualidad Octubre',500.00,0.00,0.00,0.00,0.00,'2026-10-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(99,3,9,NULL,NULL,'charge','Mensualidad Noviembre',500.00,0.00,0.00,0.00,0.00,'2026-11-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(100,3,9,NULL,NULL,'charge','Mensualidad Diciembre',500.00,0.00,0.00,0.00,0.00,'2026-12-01','pending',NULL,NULL,0,'2026-09-04 04:09:56','2026-09-04 04:09:56'),(101,3,17,NULL,NULL,'charge','Inscripción',1250.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(102,3,17,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(103,3,17,NULL,NULL,'charge','Inscripción Torneo',250.00,0.00,0.00,0.00,0.00,'2026-02-15','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(104,3,17,NULL,NULL,'charge','Uniformes',2000.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(105,3,17,NULL,NULL,'charge','Mensualidad Enero',500.00,0.00,0.00,0.00,0.00,'2026-01-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(106,3,17,NULL,NULL,'charge','Mensualidad Febrero',500.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(107,3,17,NULL,NULL,'charge','Mensualidad Marzo',500.00,0.00,0.00,0.00,0.00,'2026-03-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(108,3,17,NULL,NULL,'charge','Mensualidad Abril',500.00,0.00,0.00,0.00,0.00,'2026-04-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(109,3,17,NULL,NULL,'charge','Mensualidad Mayo',500.00,0.00,0.00,0.00,0.00,'2026-05-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(110,3,17,NULL,NULL,'charge','Mensualidad Junio',500.00,0.00,0.00,0.00,0.00,'2026-06-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(111,3,17,NULL,NULL,'charge','Mensualidad Julio',500.00,0.00,0.00,0.00,0.00,'2026-07-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(112,3,17,NULL,NULL,'charge','Mensualidad Agosto',500.00,0.00,0.00,0.00,0.00,'2026-08-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(113,3,17,NULL,NULL,'charge','Mensualidad Septiembre',500.00,0.00,0.00,0.00,0.00,'2026-09-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(114,3,17,NULL,NULL,'charge','Mensualidad Octubre',500.00,0.00,0.00,0.00,0.00,'2026-10-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(115,3,17,NULL,NULL,'charge','Mensualidad Noviembre',500.00,0.00,0.00,0.00,0.00,'2026-11-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(116,3,17,NULL,NULL,'charge','Mensualidad Diciembre',500.00,0.00,0.00,0.00,0.00,'2026-12-01','pending',NULL,NULL,0,'2026-09-10 02:35:19','2026-09-10 02:35:19'),(117,12,18,NULL,NULL,'charge','Inscripción',1250.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(118,12,18,NULL,NULL,'charge','Apoyo Material Deportivo',1000.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(119,12,18,NULL,NULL,'charge','Inscripción Torneo',250.00,0.00,0.00,0.00,0.00,'2026-02-15','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(120,12,18,NULL,NULL,'charge','Uniformes',2000.00,0.00,0.00,0.00,0.00,'2026-01-15','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(121,12,18,NULL,NULL,'charge','Mensualidad Enero',500.00,0.00,0.00,0.00,0.00,'2026-01-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(122,12,18,NULL,NULL,'charge','Mensualidad Febrero',500.00,0.00,0.00,0.00,0.00,'2026-02-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(123,12,18,NULL,NULL,'charge','Mensualidad Marzo',500.00,0.00,0.00,0.00,0.00,'2026-03-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(124,12,18,NULL,NULL,'charge','Mensualidad Abril',500.00,0.00,0.00,0.00,0.00,'2026-04-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(125,12,18,NULL,NULL,'charge','Mensualidad Mayo',500.00,0.00,0.00,0.00,0.00,'2026-05-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(126,12,18,NULL,NULL,'charge','Mensualidad Junio',500.00,0.00,0.00,0.00,0.00,'2026-06-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(127,12,18,NULL,NULL,'charge','Mensualidad Julio',500.00,0.00,0.00,0.00,0.00,'2026-07-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(128,12,18,NULL,NULL,'charge','Mensualidad Agosto',500.00,0.00,0.00,0.00,0.00,'2026-08-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(129,12,18,NULL,NULL,'charge','Mensualidad Septiembre',500.00,0.00,0.00,0.00,0.00,'2026-09-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(130,12,18,NULL,NULL,'charge','Mensualidad Octubre',500.00,0.00,0.00,0.00,0.00,'2026-10-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(131,12,18,NULL,NULL,'charge','Mensualidad Noviembre',500.00,0.00,0.00,0.00,0.00,'2026-11-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00'),(132,12,18,NULL,NULL,'charge','Mensualidad Diciembre',500.00,0.00,0.00,0.00,0.00,'2026-12-01','pending',NULL,NULL,0,'2026-09-10 03:42:00','2026-09-10 03:42:00');
/*!40000 ALTER TABLE `financial_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `game_goals`
--

DROP TABLE IF EXISTS `game_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_goals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `game_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  `goals` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `game_goals_game_id_foreign` (`game_id`),
  KEY `game_goals_player_id_foreign` (`player_id`),
  CONSTRAINT `game_goals_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `game_goals_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_goals`
--

LOCK TABLES `game_goals` WRITE;
/*!40000 ALTER TABLE `game_goals` DISABLE KEYS */;
INSERT INTO `game_goals` VALUES (1,1,31,1,'2026-09-01 00:53:56','2026-09-01 00:53:56'),(2,1,39,1,'2026-09-01 00:53:56','2026-09-01 00:53:56'),(3,1,28,1,'2026-09-01 00:53:56','2026-09-01 00:53:56'),(4,2,39,2,'2026-09-01 00:56:44','2026-09-01 00:56:44'),(5,2,30,4,'2026-09-01 00:56:44','2026-09-01 00:56:44'),(6,3,31,5,'2026-09-01 00:59:03','2026-09-01 00:59:03'),(7,3,39,1,'2026-09-01 00:59:03','2026-09-01 00:59:03'),(8,3,38,1,'2026-09-01 00:59:03','2026-09-01 00:59:03'),(9,4,31,1,'2026-09-01 00:59:58','2026-09-01 00:59:58'),(10,5,31,2,'2026-09-01 01:00:56','2026-09-01 01:00:56'),(12,7,3,3,'2026-09-01 01:03:42','2026-09-01 01:03:42'),(14,6,3,2,'2026-09-01 01:07:02','2026-09-01 01:07:02'),(18,9,17,1,'2026-09-01 01:09:02','2026-09-01 01:09:02'),(19,9,23,1,'2026-09-01 01:09:02','2026-09-01 01:09:02'),(20,9,3,3,'2026-09-01 01:09:02','2026-09-01 01:09:02'),(21,8,3,3,'2026-09-01 01:09:27','2026-09-01 01:09:27'),(22,10,17,1,'2026-09-01 01:17:47','2026-09-01 01:17:47'),(23,10,3,3,'2026-09-01 01:17:47','2026-09-01 01:17:47'),(24,10,6,2,'2026-09-01 01:17:47','2026-09-01 01:17:47'),(25,10,5,1,'2026-09-01 01:17:47','2026-09-01 01:17:47'),(29,12,39,1,'2026-09-01 01:20:32','2026-09-01 01:20:32'),(30,12,35,1,'2026-09-01 01:20:32','2026-09-01 01:20:32'),(32,11,3,3,'2026-09-02 01:26:48','2026-09-02 01:26:48'),(33,14,3,1,'2026-09-10 03:45:46','2026-09-10 03:45:46'),(34,15,3,3,'2026-09-10 03:46:01','2026-09-10 03:46:01'),(35,16,39,1,'2026-09-10 03:47:50','2026-09-10 03:47:50'),(36,16,37,1,'2026-09-10 03:47:50','2026-09-10 03:47:50'),(37,16,35,1,'2026-09-10 03:47:50','2026-09-10 03:47:50');
/*!40000 ALTER TABLE `game_goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `opponent` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uniform_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `score_us` int DEFAULT NULL,
  `score_them` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,'Borreguitos','2026-07-04 08:00:00','Campo 2 Unidad Norte','Pony','Local (Rojo)',3,1,'2026-09-01 00:48:05','2026-09-01 00:53:56'),(2,'Gladiadores','2026-07-11 08:00:00','Alma Obrera','Pony','Visitante (Negro)',6,1,'2026-09-01 00:55:39','2026-09-01 00:56:44'),(3,'Orgullosamente Tu51tos','2026-08-15 08:00:00','Campo 5 UDBJ','Pony','Local (Rojo)',7,0,'2026-09-01 00:57:32','2026-09-01 00:59:03'),(4,'Parceritos F.C.','2026-08-15 10:30:00','Campo 5 UDBJ','Pony','Local (Rojo)',1,0,'2026-09-01 00:59:32','2026-09-01 00:59:58'),(5,'Cefor Mineros Sub 09','2026-08-22 10:30:00','Campo 5 UDBJ','Pony','Visitante (Negro)',2,2,'2026-09-01 01:00:33','2026-09-01 01:00:56'),(6,'Rayados Union Jerez','2026-07-04 10:30:00','Campo 2 Infantil UDBJ','Diente de Leche','Local (Rojo)',2,7,'2026-09-01 01:02:15','2026-09-01 01:07:02'),(7,'Academicos','2026-07-11 10:30:00','Unidad Deportiva Colinas del Padre','Diente de Leche','Visitante (Negro)',3,0,'2026-09-01 01:03:27','2026-09-01 01:03:42'),(8,'Fuerzas Basicas UAZ A.R.O','2026-08-15 10:30:00','Cancha Mecanicos','Diente de Leche','Local (Rojo)',3,3,'2026-09-01 01:04:27','2026-09-01 01:06:14'),(9,'Academia Leon Trancoso','2026-08-22 10:30:00','Cancha Mecanicos','Diente de Leche','Visitante (Negro)',5,2,'2026-09-01 01:08:18','2026-09-01 01:09:02'),(10,'Barrio Soccer','2026-08-29 09:00:00','GPI Infantil Incufidez','Diente de Leche','Visitante (Negro)',7,0,'2026-09-01 01:16:43','2026-09-01 01:17:47'),(11,'Gallos Negros F.C.','2026-08-29 11:00:00','GPI Infantil Incufidez','Diente de Leche','Visitante (Negro)',3,0,'2026-09-01 01:18:27','2026-09-02 01:27:35'),(12,'Leon 400','2026-08-29 14:15:00','Campo 3 Unidad Norte','Pony','Visitante (Negro)',2,3,'2026-09-01 01:19:31','2026-09-01 01:20:10'),(14,'Necaxa Zacatecas','2026-09-03 17:00:00','Colinas del Padre','Diente de Leche','Visitante (Negro)',1,4,'2026-09-10 03:44:14','2026-09-10 03:45:46'),(15,'Real Zacatecas','2026-09-05 10:00:00','Cancha Mecanicos','Diente de Leche','Local (Rojo)',3,0,'2026-09-10 03:45:19','2026-09-10 03:46:01'),(16,'Cefor Mineros Sub 10','2026-09-05 13:00:00','Unidad Norte Campo 1','Pony','Local (Rojo)',3,1,'2026-09-10 03:47:18','2026-09-10 03:47:50');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_07_08_000010_create_seasons_table',1),(5,'2026_07_08_000020_create_categories_table',1),(6,'2026_07_08_000030_create_players_table',1),(7,'2026_07_08_000040_create_category_player_table',1),(8,'2026_07_08_000050_create_player_stats_table',1),(9,'2026_07_08_000060_create_financial_transactions_table',1),(10,'2026_07_09_013410_add_category_to_players_table',1),(11,'2026_08_26_002226_add_commissions_to_financial_transactions_table',1),(12,'2026_08_26_002226_create_player_user_table',1),(13,'2026_08_26_002226_create_transaction_payments_table',1),(14,'2026_08_26_002226_update_players_table_for_curp_and_jersey',1),(15,'2026_08_26_025413_add_status_to_players_table',2),(16,'2026_08_26_041046_add_secondary_category_to_players_table',3),(17,'2026_08_26_050754_create_games_table',4),(18,'2026_08_26_050755_create_game_goals_table',5),(19,'2026_08_26_051419_add_game_id_to_financial_transactions_table',6),(20,'2026_08_26_053731_create_settings_table',7),(21,'2026_08_26_143200_add_phone_to_users_table',8),(22,'2026_08_26_210054_add_parent_profile_fields_to_users_table',9),(23,'2026_08_26_211318_add_accepted_data_consent_at_to_users_table',10),(24,'2026_09_01_193350_create_data_deletion_requests_table',11);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_stats`
--

DROP TABLE IF EXISTS `player_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_stats` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `player_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `season_id` bigint unsigned NOT NULL,
  `goals` int NOT NULL DEFAULT '0',
  `matches_played` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player_stats_player_id_foreign` (`player_id`),
  KEY `player_stats_category_id_foreign` (`category_id`),
  KEY `player_stats_season_id_foreign` (`season_id`),
  CONSTRAINT `player_stats_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_stats_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_stats_season_id_foreign` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_stats`
--

LOCK TABLES `player_stats` WRITE;
/*!40000 ALTER TABLE `player_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_user`
--

DROP TABLE IF EXISTS `player_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `player_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player_user_player_id_foreign` (`player_id`),
  KEY `player_user_user_id_foreign` (`user_id`),
  CONSTRAINT `player_user_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `player_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_user`
--

LOCK TABLES `player_user` WRITE;
/*!40000 ALTER TABLE `player_user` DISABLE KEYS */;
INSERT INTO `player_user` VALUES (2,17,5,NULL,NULL),(3,1,6,NULL,NULL),(4,1,7,NULL,NULL),(5,7,8,NULL,NULL),(6,7,9,NULL,NULL),(7,2,10,NULL,NULL),(8,2,11,NULL,NULL),(9,18,12,NULL,NULL),(10,6,13,NULL,NULL),(11,6,14,NULL,NULL),(12,13,15,NULL,NULL),(13,13,16,NULL,NULL),(14,14,17,NULL,NULL),(15,15,18,NULL,NULL),(16,24,19,NULL,NULL),(17,24,20,NULL,NULL),(18,20,21,NULL,NULL),(19,21,22,NULL,NULL),(20,11,23,NULL,NULL),(21,3,24,NULL,NULL),(22,10,25,NULL,NULL),(23,8,25,NULL,NULL),(24,9,26,NULL,NULL),(25,19,27,NULL,NULL),(26,42,28,NULL,NULL),(27,29,11,NULL,NULL),(28,29,10,NULL,NULL),(29,40,29,NULL,NULL),(30,40,30,NULL,NULL),(31,26,31,NULL,NULL),(32,41,32,NULL,NULL),(33,28,33,NULL,NULL),(34,32,34,NULL,NULL),(35,32,35,NULL,NULL),(36,43,36,NULL,NULL),(37,44,37,NULL,NULL),(38,38,38,NULL,NULL),(39,36,39,NULL,NULL),(40,36,40,NULL,NULL),(41,37,23,NULL,NULL),(42,5,41,NULL,NULL),(43,25,42,NULL,NULL),(44,25,43,NULL,NULL),(45,39,44,NULL,NULL),(46,39,45,NULL,NULL),(47,34,46,NULL,NULL),(48,34,47,NULL,NULL),(49,22,48,NULL,NULL);
/*!40000 ALTER TABLE `player_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `curp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `position` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jersey_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scholarship_type` enum('regular','sibling_discount','full_scholarship','custom_support') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'regular',
  `scholarship_value` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `players_parent_id_foreign` (`parent_id`),
  CONSTRAINT `players_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,NULL,'Helena','Soto Urista',NULL,'2017-01-15','Diente de Leche',NULL,'active',NULL,'25','photos/player_6a95bef177793.jpeg',NULL,'regular',NULL,'2026-08-26 08:24:12','2026-08-31 23:59:59',NULL),(2,NULL,'Dante Zahid','Estrello Gonzalez',NULL,'2019-09-21','Diente de Leche',NULL,'active',NULL,'30','photos/player_6a95becc1909e.jpeg',NULL,'regular',NULL,'2026-08-26 08:25:13','2026-08-31 23:59:13',NULL),(3,NULL,'Leonardo','Leetoy Barajas',NULL,'2017-02-26','Diente de Leche',NULL,'active',NULL,'10','photos/player_6a95bf3178da0.jpeg',NULL,'regular',NULL,'2026-08-26 08:26:39','2026-08-31 23:51:45',NULL),(4,NULL,'Santino','Montenegro Nava',NULL,'2019-03-23','Diente de Leche',NULL,'active',NULL,'12','photos/player_6a95bf60264b9.jpeg',NULL,'regular',NULL,'2026-08-26 08:27:44','2026-09-01 00:01:16',NULL),(5,NULL,'Dorian Omar','Aldana Barrera',NULL,'2017-09-02','Diente de Leche',NULL,'active',NULL,'27','photos/player_6a95bed4386c3.jpeg',NULL,'regular',NULL,'2026-08-26 08:28:53','2026-08-31 23:59:22',NULL),(6,NULL,'Joan Andre','Campos Candelas',NULL,'2018-03-24','Diente de Leche','Pony','active',NULL,'7','photos/player_6a95be4f3b989.jpeg',NULL,'regular',NULL,'2026-08-26 08:38:39','2026-08-31 23:57:42',NULL),(7,NULL,'Julio Ronaldo','Alvarez Felix',NULL,'2017-12-18','Diente de Leche',NULL,'active',NULL,'21','photos/player_6a95bf2a02f78.jpeg',NULL,'regular',NULL,'2026-08-26 08:47:42','2026-09-01 00:00:46',NULL),(8,NULL,'Omar','Renteria Rodriguez',NULL,'2021-02-03','Diente de Leche',NULL,'active',NULL,'4','photos/player_6a95bf4cc5301.jpeg',NULL,'regular',NULL,'2026-08-26 08:49:46','2026-09-01 00:03:00',NULL),(9,NULL,'Carlos Emilio','Gonzalez Garcia',NULL,'2017-08-17','Diente de Leche',NULL,'active',NULL,'18','photos/player_6a95bec29b9fa.jpeg',NULL,'regular',NULL,'2026-08-26 08:50:17','2026-08-31 23:59:05',NULL),(10,NULL,'Juan Jose','Renteria Rodriguez',NULL,'2019-04-18','Diente de Leche',NULL,'active',NULL,'33','photos/player_6a95bf1fdf371.jpeg',NULL,'regular',NULL,'2026-08-26 08:52:53','2026-09-01 00:04:07',NULL),(11,NULL,'Miguel Angel','Garcia Rodarte',NULL,'2017-06-21','Diente de Leche','Pony','active',NULL,'2','photos/player_6a95be8546225.jpeg',NULL,'regular',NULL,'2026-08-26 09:04:30','2026-08-31 23:58:01',NULL),(12,NULL,'Carlo Manuel','de Alba Magaña',NULL,'2020-06-29','Diente de Leche',NULL,'active',NULL,NULL,NULL,NULL,'regular',NULL,'2026-08-26 09:14:17','2026-08-26 09:16:08',NULL),(13,NULL,'Matias Luciano','de Leon Castillo',NULL,'2017-09-15','Diente de Leche',NULL,'active',NULL,'36','photos/player_6a95bf42f1c3b.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-01 00:01:05',NULL),(14,NULL,'Hector Matias','Reinoso Hernandez',NULL,'2019-09-14','Diente de Leche',NULL,'active',NULL,'5','photos/player_6a97227d237d0.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-10 03:38:43',NULL),(15,NULL,'Iker Alberto','Elias Carreon',NULL,'2017-08-13','Diente de Leche',NULL,'active',NULL,'28','photos/player_6a95befc3c194.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-01 00:00:10',NULL),(16,NULL,'Ethan Ruben','Oliva Garcia',NULL,'2020-06-20','Diente de Leche',NULL,'active',NULL,NULL,'photos/player_6a95bee39f151.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-08-31 23:50:27',NULL),(17,NULL,'Josue Alexander','Solis Legaspi',NULL,'2017-08-26','Diente de Leche','Pony','active',NULL,'17','photos/player_6a95be5d7dfba.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-08-31 23:56:22',NULL),(18,NULL,'Pablo Leonardo','Gaeta Montano',NULL,'2020-06-19','Diente de Leche',NULL,'active',NULL,'15','photos/player_6a9722b708c5f.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-02 01:08:39',NULL),(19,NULL,'Jose Alberto Emiliano','Aguayo Sanchez',NULL,'2017-06-30','Diente de Leche',NULL,'active',NULL,'13','photos/player_6a95bf1017b78.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-01 00:00:31',NULL),(20,NULL,'Rafael','Castillo Soto',NULL,'2017-01-09','Diente de Leche',NULL,'active',NULL,'39','photos/player_6a95bf57b9709.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-08-31 23:52:23',NULL),(21,NULL,'Cristobal','Robles Carmona',NULL,'2018-05-10','Diente de Leche','Pony','active',NULL,'22','photos/player_6a95be13bbeac.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-08-31 23:55:54',NULL),(22,NULL,'Jassiel Arturo','Jimenez Robles',NULL,'2018-03-02','Diente de Leche',NULL,'active',NULL,'8','photos/player_6a95bf08242ad.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-01 00:00:21',NULL),(23,NULL,'Matias','Gutierrez Contreras',NULL,'2017-12-20','Diente de Leche',NULL,'active',NULL,'3','photos/player_6a95bf3a347c4.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-09-01 00:00:55',NULL),(24,NULL,'Emilio','Guzman de la Torre',NULL,'2018-11-08','Diente de Leche',NULL,'active',NULL,'6','photos/player_6a95bedbc54e2.jpeg',NULL,'regular',NULL,'2026-08-26 09:28:47','2026-08-31 23:59:28',NULL),(25,NULL,'Roberto Julian','Cortes Sanchez',NULL,'2016-05-16','Pony',NULL,'active',NULL,'37','photos/player_6a95be99d3b6f.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:56:58',NULL),(26,NULL,'Jesus Alberto','Hernandez Garcia',NULL,'2015-09-26','Pony',NULL,'active',NULL,'32','photos/player_6a95be443a33e.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:54:21',NULL),(27,NULL,'Alejandro','Huizar Valdez',NULL,'2016-04-12','Pony',NULL,'active',NULL,'50','photos/player_6a95bd8331196.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:56:50',NULL),(28,NULL,'Matias','Romo Valdez',NULL,'2015-05-28','Pony',NULL,'active',NULL,'58','photos/player_6a95be7d1c10d.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:54:09',NULL),(29,NULL,'Leonardo Jose','Estrello Gonzalez',NULL,'2016-10-10','Pony',NULL,'active',NULL,'59','photos/player_6a95be724c272.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:56:44',NULL),(30,NULL,'Sebastian','Ibarra de los Santos',NULL,'2015-08-18','Pony',NULL,'active',NULL,'47','photos/player_6a95bea2e826a.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:53:42',NULL),(31,NULL,'Axel Adrian','Ramos Muñoz',NULL,'2016-09-26','Pony',NULL,'active',NULL,'9','photos/player_6a95bdd632f1f.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:56:29',NULL),(32,NULL,'Ian Leon','Ramirez Duarte',NULL,'2015-06-23','Pony',NULL,'active',NULL,'54','photos/player_6a95be2d215bc.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:53:54',NULL),(33,NULL,'Ulises Castiel','Alvarez Castruita',NULL,'2015-10-29','Pony',NULL,'active',NULL,'1','photos/player_6a95beaaf3bc2.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:53:32',NULL),(34,NULL,'Dylan Alejandro','Rueda Medina',NULL,'2015-05-28','Pony',NULL,'active',NULL,'53','photos/player_6a95be249c99e.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:56:02',NULL),(35,NULL,'Noah Joaquin','Ramos R.',NULL,'2015-04-05','Pony',NULL,'active',NULL,'64','photos/player_6a95be901b5f1.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:55:48',NULL),(36,NULL,'Axel Santiago','Dominguez Gomez',NULL,'2015-11-09','Pony',NULL,'active',NULL,'23','photos/player_6a95be017d6ef.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:55:22',NULL),(37,NULL,'Juan Pablo','Garcia Rodarte',NULL,'2015-06-20','Pony',NULL,'active',NULL,'34','photos/player_6a95be6743f9c.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:58:34',NULL),(38,NULL,'Iker Santiago','España Sanchez',NULL,'2015-07-05','Pony',NULL,'active',NULL,NULL,'photos/player_6a95be37cd64a.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:47:35',NULL),(39,NULL,'Christian Raul','Vanegas Escobedo',NULL,'2015-07-17','Pony',NULL,'active',NULL,'48','photos/player_6a95be0ba9816.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-09-10 03:54:59',NULL),(40,NULL,'Dante Tadeo','Garcia Barrgan',NULL,'2015-10-28','Pony',NULL,'active',NULL,'19','photos/player_6a95be1cdbd7d.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:54:49',NULL),(41,NULL,'Jose Emiliano','Valdez Villalobos',NULL,'2015-08-09','Pony',NULL,'active',NULL,'49','photos/player_6a95be56cf442.jpeg',NULL,'regular',NULL,'2026-08-26 09:56:03','2026-08-31 23:54:35',NULL),(42,NULL,'Axel Adrian','Saucedo Acevedo','SAAA170923HZSCCXA5','2017-09-23','Diente de Leche',NULL,'active',NULL,'29','photos/player_6aa1d7a10d24f.jpeg',NULL,'regular',NULL,'2026-09-10 03:13:57','2026-09-10 04:03:13',NULL),(43,NULL,'Jose Angel','Hernandez Dorado',NULL,'2016-08-02','Pony',NULL,'active',NULL,NULL,NULL,NULL,'regular',NULL,'2026-09-10 03:26:06','2026-09-10 03:26:06',NULL),(44,NULL,'Victor Hugo','Garcia Garcia',NULL,'2016-06-20','Pony',NULL,'active',NULL,'26',NULL,NULL,'regular',NULL,'2026-09-10 03:26:06','2026-09-10 03:36:25',NULL);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('VM3emRiO9OpPQIhOXSif3FeAC9B9nWzH2PwJ57mD',NULL,'127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiSk53N0JiT1dadHBnZjJTc2ViYVYyQ1dpVlJNcThTNEpaVTVFOHNwYyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1788991454),('zL6A4nIMiq8G4d1Anjo26wgjNjJjfINndAx43m5a',48,'127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','ZXlKcGRpSTZJbWg1VUZOYVkzRnhjbmQ1U0dOTlprOVVTSGhqUzFFOVBTSXNJblpoYkhWbElqb2lVelI2YzBodVVraG9aWEE1V1ZOMGJtaEdOazVFVTFVNVJGQlJjMUp4ZEVGR1owOVdOVXBvVjJGaVMwTkNOSE56UWxSNFVEUk5lalpKUVhKWVoybzNUM2xZTTB3MVNtVjJMMFJ0V1ZsSGFERmxOamRpWWtkc1ZWRlBSMkpoYzNwU1VrNUJNRmhPVDI5clpHUjNRV0Z6V2pNM2EzbHVOMWwzTUVWalpESm9SSE5KY0ZwUk9YRXlWRmxZUmpKU1FVUjRTMnhDT1VGMFdUZHRWa2h2WkhoeVZYazNjV3RvZEhoMGQwcFVjekJKWlRWcFYzaDFSa3hvWm5SU1NrOUJNa28zVkVRNVZFSm1UR0ZuUjBsc1RubG1UMlpUVTNndlVsQnhMMjR4ZW5GaVRsVnhVSEIzY0VaSllrTkxiblozTmprM1oxUnRaazFzVDBsdGJIcEZVR1ZYVEVaM1pHVldkazl1YTNSdlYwZFlNVEI0TUdwVllsVXliRFZJV21aTVR6Um9WRzEzUWtKSFpVVjVjbmRzWWxOUFJrRlpNbVZyUzFGdGFVNXJOMVJEYlhSclVVNVdSbE00U0hsMFZHOVBVbFY2Y2twWFVtdFpRa2Q0U25RemN6aHJUV2xqTUdaNVpFMWxjbFZCUFNJc0ltMWhZeUk2SW1RNFltUTNNbUV6TURRNVpEaGtOR1k1TkRRMFpEZ3pPV1U0T1dGa056STFZMk5qWmpNMk9HRmxaVGN3TWpJMk5UZGxNalJtT0RZek0yRm1ORFU1WlRZaUxDSjBZV2NpT2lJaWZRPT0=',1788993286);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'cost_inscripcion','Inscripción','1250','number','2026-08-26 11:37:52','2026-08-26 11:37:52'),(2,'cost_material','Apoyo Material Deportivo','1000','number','2026-08-26 11:37:52','2026-08-26 11:37:52'),(3,'cost_torneo','Inscripción Torneo','250','number','2026-08-26 11:37:52','2026-08-26 11:37:52'),(4,'cost_mensualidad','Mensualidad','500','number','2026-08-26 11:37:52','2026-08-26 11:37:52'),(5,'cost_uniformes','Uniformes','2000','number','2026-08-26 11:37:52','2026-08-26 11:37:52'),(6,'cost_arbitraje','Arbitrajes','50','number','2026-08-26 11:37:52','2026-08-26 11:37:52');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_payments`
--

DROP TABLE IF EXISTS `transaction_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `financial_transaction_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'card',
  `stripe_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_payments_financial_transaction_id_foreign` (`financial_transaction_id`),
  KEY `transaction_payments_user_id_foreign` (`user_id`),
  CONSTRAINT `transaction_payments_financial_transaction_id_foreign` FOREIGN KEY (`financial_transaction_id`) REFERENCES `financial_transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_payments`
--

LOCK TABLES `transaction_payments` WRITE;
/*!40000 ALTER TABLE `transaction_payments` DISABLE KEYS */;
INSERT INTO `transaction_payments` VALUES (1,32,3,500.00,'cash',NULL,'2026-08-26 10:47:40','2026-08-26 10:47:40'),(2,31,3,500.00,'cash',NULL,'2026-08-26 10:47:43','2026-08-26 10:47:43'),(3,30,3,500.00,'cash',NULL,'2026-08-26 10:47:51','2026-08-26 10:47:51'),(4,29,3,500.00,'cash',NULL,'2026-08-26 10:47:53','2026-08-26 10:47:53'),(5,28,3,500.00,'cash',NULL,'2026-08-26 10:47:57','2026-08-26 10:47:57'),(6,27,3,500.00,'cash',NULL,'2026-08-26 10:49:01','2026-08-26 10:49:01'),(7,26,3,500.00,'cash',NULL,'2026-08-26 10:49:26','2026-08-26 10:49:26'),(8,25,3,500.00,'cash',NULL,'2026-08-26 10:49:28','2026-08-26 10:49:28'),(9,24,3,500.00,'cash',NULL,'2026-08-26 10:49:30','2026-08-26 10:49:30'),(10,23,3,500.00,'cash',NULL,'2026-08-26 10:49:32','2026-08-26 10:49:32'),(11,18,3,1000.00,'cash',NULL,'2026-08-26 10:49:39','2026-08-26 10:49:39'),(12,22,3,500.00,'cash',NULL,'2026-08-26 10:49:44','2026-08-26 10:49:44'),(13,17,3,1250.00,'cash',NULL,'2026-08-26 10:49:47','2026-08-26 10:49:47'),(14,21,3,500.00,'cash',NULL,'2026-08-26 10:49:50','2026-08-26 10:49:50'),(19,12,3,500.00,'cash',NULL,'2026-08-26 10:53:02','2026-08-26 10:53:02'),(20,11,3,500.00,'cash',NULL,'2026-08-26 10:53:04','2026-08-26 10:53:04'),(21,10,3,500.00,'cash',NULL,'2026-08-26 10:53:05','2026-08-26 10:53:05'),(22,9,3,500.00,'cash',NULL,'2026-08-26 10:53:07','2026-08-26 10:53:07'),(23,8,3,500.00,'cash',NULL,'2026-08-26 10:53:10','2026-08-26 10:53:10'),(24,7,3,500.00,'cash',NULL,'2026-08-26 10:53:11','2026-08-26 10:53:11'),(25,3,3,250.00,'cash',NULL,'2026-08-26 10:53:18','2026-08-26 10:53:18'),(26,2,3,1000.00,'cash',NULL,'2026-08-26 10:54:30','2026-08-26 10:54:30'),(27,6,3,500.00,'cash',NULL,'2026-08-26 10:54:32','2026-08-26 10:54:32'),(28,1,3,1250.00,'cash',NULL,'2026-08-26 10:54:34','2026-08-26 10:54:34'),(29,4,3,2000.00,'cash',NULL,'2026-08-26 10:54:37','2026-08-26 10:54:37'),(30,5,3,500.00,'cash',NULL,'2026-08-26 10:54:40','2026-08-26 10:54:40');
/*!40000 ALTER TABLE `transaction_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo_path` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','parent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'parent',
  `saldo_disponible` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stripe_account_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accepted_data_consent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Hector Esparza','hector','hector@admin.com',NULL,NULL,NULL,'2026-08-26 06:34:43','$2y$12$Jm0zA2zC9CWFkcEJ6qGk.eN9Yf7gLTwjZlQn7e524gCtxDlcmeheG','admin',0.00,NULL,'xomoledECG',NULL,'2026-08-26 06:34:43','2026-08-26 06:36:23'),(2,'Josceline Esparza','josceline','josceline@admin.com',NULL,NULL,NULL,'2026-08-26 06:34:43','$2y$12$iVklVW0shroNiwy0wcdC1Or.ZogH4JAQh8YaWHaa2SaSc.s.ryFr6','admin',0.00,NULL,'FJ96BhvKoS',NULL,'2026-08-26 06:34:43','2026-08-26 06:36:24'),(3,'Christian Esparza','christian','christian@admin.com',NULL,NULL,NULL,'2026-08-26 06:34:43','$2y$12$Rx2uu.VVCmpGVYGkI785N.4C3fXuoXt/1od0HN7yGkebyk93NR8IS','admin',0.00,NULL,'zwfFwXP2X4LHlLGsNKxngVP2h6VsgDx1VsJ46nMa8YPTMN8NskAluqxyTQrF',NULL,'2026-08-26 06:34:43','2026-08-26 06:36:24'),(5,'Diana Legaspi','d.legaspi',NULL,NULL,NULL,NULL,NULL,'$2y$12$cKAnDPqG8M0y89dhjGSZU.8nmKpjG90WmPsfk6fzlKgFQIFho8pfO','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:37:07','2026-09-10 02:37:07'),(6,'Cesar Soto','c.soto',NULL,NULL,NULL,NULL,NULL,'$2y$12$r0cMB2vcBH8X6KuCoSOrM.tq698CjfRvRXOr/t8O5ELUhmVGkUjsG','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:39:39','2026-09-10 02:39:39'),(7,'Claudia Urista','c.urista',NULL,NULL,NULL,NULL,NULL,'$2y$12$l5sX4hvyaffqR6dOZOrqUeFyMGfFqS1f/lZ9krjDnAKGGcymHWKYG','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:42:02','2026-09-10 02:42:02'),(8,'Norma Felix','n.felix',NULL,NULL,NULL,NULL,NULL,'$2y$12$D1SAxhcvHN2DniyIC09vD.9sPh8WWmW/f2uqa0P6EXHWOFpYGQ24y','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:43:36','2026-09-10 02:43:36'),(9,'Julio Alvarez','j.alvarez',NULL,NULL,NULL,NULL,NULL,'$2y$12$tUURbd7BWNc0609O2BHrI.PDOR5kZgmA7J619FHyF5F24lo9bnXvC','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:44:06','2026-09-10 02:44:06'),(10,'Jose Gerardo Estrello','g.estrello',NULL,NULL,NULL,NULL,NULL,'$2y$12$Z0MfcNzYB7IKCFPJV6wdvOXFSHSyOzZL7cEqXKDQY/2U9JCbFKZhy','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:45:28','2026-09-10 02:45:28'),(11,'Cecilia Gonzalez','c.gonzalez',NULL,NULL,NULL,NULL,NULL,'$2y$12$IySpRdKSuHFa/LFibInEw.Ee1/wQsYoMszbfAaYDVvSzsm5fFJRs2','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:45:52','2026-09-10 02:45:52'),(12,'Karla Montano','k.montano',NULL,NULL,NULL,NULL,NULL,'$2y$12$WSXGdpnaSlOGRiYovhq6Pu6DNF0rIwJJLt0dpvWuO7scmaJ7jXT.a','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:46:53','2026-09-10 02:46:53'),(13,'Jesus Campos','j.campos',NULL,NULL,NULL,NULL,NULL,'$2y$12$C7O2a4QFhlPlPo2z6gp36uBxi5.1Y5g.laGuVNV3T9M9X.wIbPyo6','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:48:07','2026-09-10 02:48:07'),(14,'Daniela Candelas','d.candelas',NULL,NULL,NULL,NULL,NULL,'$2y$12$bAWisGxOyiqndk75A8mgyuJ3CtHuvhCO7wo4Aaa2h22RzIXR2C96.','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:48:37','2026-09-10 02:48:37'),(15,'Francisco de Leon','f.leon',NULL,NULL,NULL,NULL,NULL,'$2y$12$JZTNXJ7SpFxfkr3h4FALoO07AsD9aMPpEfOB1U5KTb5RH8D2drTBS','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:49:57','2026-09-10 02:49:57'),(16,'Sarai Castillo','s.castillo',NULL,NULL,NULL,NULL,NULL,'$2y$12$UYjiKtiyb7UjN8pkitDMtuO.bX1F2vwtA0KA13cVmvVIl3.v.264K','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:50:25','2026-09-10 02:50:25'),(17,'Alicia Hernandez','a.hernandez',NULL,NULL,NULL,NULL,NULL,'$2y$12$4WiLa/a9dFw0h1q7IkO1PuI3w/DaoqG4Rk6iWO8iY6RbpIoxoqs/e','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:51:17','2026-09-10 02:51:17'),(18,'Caludia Carreon','c.carreon',NULL,NULL,NULL,NULL,NULL,'$2y$12$PMcuwRsDZvxVwQSd.C1d9.ZH9yTKd7IT8PtuE79mZoz.4ZRvKUkVi','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:52:00','2026-09-10 02:52:00'),(19,'Nelson Guzman','n.guzman',NULL,NULL,NULL,NULL,NULL,'$2y$12$32dKOJohVx9KefsrS6h8auqiZn710UnABGeNPyYGUCHOyKXUOA90m','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:53:15','2026-09-10 02:53:15'),(20,'Nohemi de la Torre','n.torre',NULL,NULL,NULL,NULL,NULL,'$2y$12$3LEciGMCOhIgwunew779c..TC4XqDvYXxOUuuaUocWFL6pbGXnFRS','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:53:38','2026-09-10 02:53:38'),(21,'Maria Soto','m.soto',NULL,NULL,NULL,NULL,NULL,'$2y$12$w6CY2aYBunc9hU9t/nWhq.OPpWMaD/K2rEW.teFgsT6T3r0mK2tbq','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:54:21','2026-09-10 02:54:21'),(22,'Karla Carmona','k.carmona',NULL,NULL,NULL,NULL,NULL,'$2y$12$8SA/spO2BRbqiIJF69mZt.lbuB8dVXhqK5NOCv1I3kmZQYa3vuYM.','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:55:07','2026-09-10 02:55:07'),(23,'Maria Rodarte','m.rodarte',NULL,NULL,NULL,NULL,NULL,'$2y$12$oOlPjl7PSgVGuInvPdQRGuZUygdcQUYN46UmHgn/7DORGaUbB7jba','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:56:01','2026-09-10 02:56:01'),(24,'Gerardo Leetoy','g.leetoy',NULL,NULL,NULL,NULL,NULL,'$2y$12$4dopasEFdsDebgF3O2hdAOnStGHr6s9S/mX1TOZJE/j1AuNW/wrfm','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:57:04','2026-09-10 02:57:04'),(25,'Jaqueline Rodriguez','j.rodriguez',NULL,NULL,NULL,NULL,NULL,'$2y$12$9kBpK0EEiAtuhxX5txFjy.IqEvFbJfX0gFSUTL8MudK07EcE4W3SS','parent',0.00,NULL,NULL,NULL,'2026-09-10 02:58:21','2026-09-10 02:58:21'),(26,'Carlos Adrian Gonzalez Martinez','a.gonzalez',NULL,NULL,NULL,NULL,NULL,'$2y$12$lToAqI.StoN3/FevjeQas.pXZtQGLJROJ0pz1TYTP.Cydhs9FOzzK','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:06:00','2026-09-10 03:06:00'),(27,'Yareli Irazema Sanchez','y.sanchez',NULL,NULL,NULL,NULL,NULL,'$2y$12$1d0ClAORkOJIjNv/SUC1a.UsKwtz5Pd0io0zC0p.Axqk4qmd9CEbO','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:07:38','2026-09-10 03:07:38'),(28,'Paulina Acevedo','p.acevedo',NULL,NULL,NULL,NULL,NULL,'$2y$12$CMZCWMv.GFf010bxLXamNOaGDaLE/EdGMKIQLMHn4tOPTQiydAc9q','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:14:37','2026-09-10 03:14:37'),(29,'Griselda Barragan','g.barragan',NULL,NULL,NULL,NULL,NULL,'$2y$12$g2n5cF0zlgkeuFyV2QbCSuT01lZQUhzktbJz6W85yDlMvz/sUsENu','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:18:30','2026-09-10 03:18:30'),(30,'Dante Garcia','d.garcia',NULL,NULL,NULL,NULL,NULL,'$2y$12$xvS6eGXVyTiiu4FtC5qMu.Pm6Y8x6HculKWkwhORkK77lRW2QSZaS','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:19:28','2026-09-10 03:19:28'),(31,'David Rodriguez','d.rodriguez',NULL,NULL,NULL,NULL,NULL,'$2y$12$6bclhHzcLLJlt3.RlgF.c.x/rO.kmkrAlQV/13l93hPAZ5pZKVPta','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:20:45','2026-09-10 03:20:45'),(32,'Jose Valdez','j.valdez',NULL,NULL,NULL,NULL,NULL,'$2y$12$xGy3vmKvyld0gLdP9wA4LO5pywP3knh2YMtQ0mS43lhvKB0P9kJn6','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:21:23','2026-09-10 03:21:23'),(33,'Ricardo Romo','r.romo',NULL,NULL,NULL,NULL,NULL,'$2y$12$dfOn.732MnPeaTF1nduIl.AinlR8zlp/DHC73hDvW/YsxPRpitOjW','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:22:04','2026-09-10 03:22:04'),(34,'Cristina Duarte','c.duarte',NULL,NULL,NULL,NULL,NULL,'$2y$12$4/09UPq.vRn8EIgxJTxyaOSoYSVukqcgsuYTQATmMSlpd0iB/I9C2','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:23:06','2026-09-10 03:23:06'),(35,'Jose Ramirez','j.ramirez',NULL,NULL,NULL,NULL,NULL,'$2y$12$cpLz9I8p27QuK5vOtzuorOokirXyArkhv.Z1MoobvNm93Yt22mPW.','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:23:29','2026-09-10 03:23:29'),(36,'Juan Hernandez','j.hernandez',NULL,NULL,NULL,NULL,NULL,'$2y$12$t6EMCklJoZ.G1Dm4QbEJYuhCKWzRZ7vGwFpmCses4Ue4DAljKd5dW','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:27:41','2026-09-10 03:27:41'),(37,'Eunice Garcia','e.garcia',NULL,NULL,NULL,NULL,NULL,'$2y$12$aeT7ij9eHJXyJycmeGuAfu3WVwdkXK/zVp/ztYWxvU7TWz6/vQXAC','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:28:58','2026-09-10 03:28:58'),(38,'Ana Sanchez','a.sanchez',NULL,NULL,NULL,NULL,NULL,'$2y$12$W538zwB.xNEZluaP1OIviOnyXttg4xWZLShyCBiYvGoMCCdkgZoMK','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:30:20','2026-09-10 03:30:20'),(39,'Carlos Dominguez','c.dominguez',NULL,NULL,NULL,NULL,NULL,'$2y$12$j8trHicbBESFLaSgmgnWq.gCFD3mOihyf43kpdvltU54zNE/yRjVy','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:31:56','2026-09-10 03:31:56'),(40,'Adriana Gomez','a.gomez',NULL,NULL,NULL,NULL,NULL,'$2y$12$j5iYRgGh5yTYFqLviTs3I.mAuHMYurTpgx6l0jyQiGibbf5vXkbfW','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:32:25','2026-09-10 03:32:25'),(41,'Diana Rocio Barrera Hernandez','d.barrera',NULL,NULL,NULL,NULL,NULL,'$2y$12$CV247BNEh0l197HjjQNLQ.xfDLVSCT028fsjZtevaKy6NXAseU5Y2','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:41:01','2026-09-10 03:41:01'),(42,'Claudia Iliana Cortés Saucedo','c.cortes',NULL,NULL,NULL,NULL,NULL,'$2y$12$WkzcTQg.kcTSZfQ.PgfqnOrCG5I7Z3WmCjrRKbx/Yp8OWl6//76bC','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:50:36','2026-09-10 03:50:36'),(43,'José Roberto Sanchez Jauregui','r.sanchez',NULL,NULL,NULL,NULL,NULL,'$2y$12$9YZcy5gh0TlBNstdeKCz2O2TmoIDDZzW3XAOa/OBeV7yqHzVS5Dhm','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:51:18','2026-09-10 03:51:18'),(44,'Raúl Vanegas','r.vanegas',NULL,NULL,NULL,NULL,NULL,'$2y$12$BlYElkRnm6pUDFYkQBV6aOWTqhnaGkuKeU9hYfqctx2M51Of1wv4C','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:54:47','2026-09-10 03:54:47'),(45,'Patricia Escobedo','p.escobedo',NULL,NULL,NULL,NULL,NULL,'$2y$12$zD6tULR8bhsD8Ghu7nkVQOLJCm/45Es59x2rgE2mmtkclI/A8WRVa','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:55:30','2026-09-10 03:55:30'),(46,'Pedro Ivan Rueda de la Torre','p.rueda',NULL,NULL,NULL,NULL,NULL,'$2y$12$UKb.0d63bhuJkiGTnHZQE.eYdqlYS8eNiIwICCgprf4KKmJZ5CDCm','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:56:01','2026-09-10 03:56:01'),(47,'Daniela Medina Zúñiga','d.medina',NULL,NULL,NULL,NULL,NULL,'$2y$12$UF16jQeXbmzQLkSH6wBY4umid.UZEIbB3DCecF.jHY8vNeVNn/c3C','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:56:28','2026-09-10 03:56:28'),(48,'Beatriz Adriana Raudales Tavares','b.raudales',NULL,NULL,NULL,NULL,NULL,'$2y$12$9MnXznwyOrRs875aUme8W.tRPPIAyao5vReWaxoBiK.aOS.759tIu','parent',0.00,NULL,NULL,NULL,'2026-09-10 03:58:41','2026-09-10 03:58:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'he5_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-09 16:59:55

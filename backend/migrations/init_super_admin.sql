-- SQL Script to initialize super_admin_db
CREATE DATABASE IF NOT EXISTS `super_admin_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `super_admin_db`;

-- 1. admins table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_name` VARCHAR(255) NOT NULL, -- Represents the Clinic Name
  `database_name` VARCHAR(100) UNIQUE DEFAULT NULL, -- NULL for super_admin
  `owner_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin'
  `status` VARCHAR(50) DEFAULT 'Active',
  `patient_prefix` VARCHAR(50) DEFAULT 'P',
  `logo_url` TEXT DEFAULT NULL,
  `theme_color` VARCHAR(50) DEFAULT '#CA6180',
  `clinic_address` TEXT DEFAULT NULL,
  `clinic_phone` VARCHAR(50) DEFAULT NULL,
  `clinic_details` TEXT DEFAULT NULL,
  `logo_width` INT DEFAULT 120,
  `logo_height` INT DEFAULT 120,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  INDEX `idx_admins_status` (`status`),
  INDEX `idx_admins_role` (`role`)
) ENGINE=InnoDB;

-- 2. medicine_master table
CREATE TABLE IF NOT EXISTS `medicine_master` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `medicine_name` VARCHAR(255) NOT NULL,
  `generic_name` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL
) ENGINE=InnoDB;

-- 3. disease_types table
CREATE TABLE IF NOT EXISTS `disease_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) UNIQUE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL
) ENGINE=InnoDB;

-- 4. doctor_specializations table
CREATE TABLE IF NOT EXISTS `doctor_specializations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `specialization_name` VARCHAR(255) UNIQUE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL
) ENGINE=InnoDB;


-- SEED SYSTEM MASTER LOOKUP TABLES
-- Diseases
INSERT IGNORE INTO `disease_types` (name, description) VALUES
('Migraine', 'Severe headache, usually on one side, accompanied by nausea or sensitivity to light'),
('Chronic Asthma', 'Long-term respiratory disease causing breathing difficulty'),
('Allergic Rhinitis', 'Irritation and inflammation of the mucous membrane inside the nose'),
('Eczema', 'Patches of skin become rough and inflamed, with itching and bleeding'),
('Irritable Bowel Syndrome (IBS)', 'Common disorder that affects the large intestine'),
('Rheumatoid Arthritis', 'Chronic inflammatory disorder affecting joints'),
('Insomnia', 'Habitual sleeplessness; inability to sleep'),
('Alopecia Areata', 'Sudden hair loss that starts with one or more circular patches'),
('Psoriasis', 'Skin disease that causes itchy or sore patches of thick, red skin with silvery scales'),
('Anxiety Disorder', 'Excessive worry or fear that interferes with daily activities');

-- Homeopathic Medicines seeding moved to programmatic seeding in initDatabases.js


-- Doctor Specializations
INSERT IGNORE INTO `doctor_specializations` (specialization_name) VALUES
('Homeopathic Consultant'),
('Classical Homeopathy Expert'),
('Pediatric Homeopath'),
('Dermatological Homeopath'),
('Chronic Disease Specialist');

-- SQL Script template to initialize a new Admin Clinic database
-- Note: The database name will be specified dynamically (e.g. USE `admin_0001`)

-- 1. doctors table
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `specialization_id` INT DEFAULT NULL, -- REFERENCES super_admin_db.doctor_specializations.id
  `mobile` VARCHAR(20) DEFAULT NULL,
  `fees` INT DEFAULT 0,
  `image` VARCHAR(255) DEFAULT NULL,
  `username` VARCHAR(255) UNIQUE DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `availability` TEXT DEFAULT NULL, -- JSON availability schedule
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  INDEX `idx_doctors_status` (`status`)
) ENGINE=InnoDB;

-- 2. doctor_shifts table
CREATE TABLE IF NOT EXISTS `doctor_shifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `doctor_id` INT NOT NULL,
  `shift_name` VARCHAR(100) NOT NULL, -- Morning Shift, Evening Shift
  `start_time` VARCHAR(50) NOT NULL,
  `end_time` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. staff_members table
CREATE TABLE IF NOT EXISTS `staff_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) NOT NULL, -- Nurse, Pharmacist, Receptionist
  `mobile` VARCHAR(20) DEFAULT NULL,
  `username` VARCHAR(255) UNIQUE DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL
) ENGINE=InnoDB;

-- 4. patients table
CREATE TABLE IF NOT EXISTS `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` VARCHAR(50) UNIQUE NOT NULL, -- Format: P-XXXX
  `name` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `disease_type_id` INT DEFAULT NULL, -- REFERENCES super_admin_db.disease_types.id
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  INDEX `idx_patients_mobile` (`mobile`),
  INDEX `idx_patients_status` (`status`)
) ENGINE=InnoDB;

-- 5. health_records table
CREATE TABLE IF NOT EXISTS `health_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` VARCHAR(50) NOT NULL, -- REFERENCES local patients.patient_id
  `blood_pressure` VARCHAR(50) DEFAULT NULL,
  `weight` VARCHAR(20) DEFAULT NULL,
  `current_condition` VARCHAR(255) DEFAULT NULL,
  `follow_up_date` DATE DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  INDEX `idx_health_records_patient` (`patient_id`)
) ENGINE=InnoDB;

-- 6. appointments table
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) UNIQUE NOT NULL, -- BKXXX
  `patient_id` VARCHAR(50) NOT NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `doctor_id` INT NOT NULL,
  `shift_id` INT DEFAULT NULL, -- REFERENCES doctor_shifts.id
  `date` DATE NOT NULL,
  `appointment_time` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Completed
  `patient_diseases` VARCHAR(255) DEFAULT NULL,
  `status_comment` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shift_id`) REFERENCES `doctor_shifts` (`id`) ON DELETE SET NULL,
  INDEX `idx_appointments_date` (`date`),
  INDEX `idx_appointments_patient` (`patient_id`),
  INDEX `idx_appointments_status` (`status`)
) ENGINE=InnoDB;

-- 7. prescriptions table
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` VARCHAR(50) NOT NULL,
  `doctor_id` INT NOT NULL,
  `medicine_id` INT DEFAULT NULL, -- REFERENCES super_admin_db.medicine_master.id
  `medicines` TEXT DEFAULT NULL,
  `dosage` VARCHAR(255) DEFAULT NULL,
  `instructions` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `chief_complaints` TEXT DEFAULT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `examination_notes` TEXT DEFAULT NULL,
  `observations` TEXT DEFAULT NULL,
  `advice` TEXT DEFAULT NULL,
  `follow_up_date` DATE DEFAULT NULL,
  `follow_up_notes` TEXT DEFAULT NULL,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `category` VARCHAR(100) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `next_of_kin` VARCHAR(100) DEFAULT NULL,
  `visit_type` VARCHAR(100) DEFAULT NULL,
  `referred_by` VARCHAR(100) DEFAULT NULL,
  `occupation` VARCHAR(100) DEFAULT NULL,
  `visit_validity` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  INDEX `idx_prescriptions_patient` (`patient_id`),
  INDEX `idx_prescriptions_doctor` (`doctor_id`)
) ENGINE=InnoDB;

-- 8. doctor_leaves table
CREATE TABLE IF NOT EXISTS `doctor_leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `doctor_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  INDEX `idx_doctor_leaves_dates` (`start_date`, `end_date`),
  INDEX `idx_doctor_leaves_doc` (`doctor_id`)
) ENGINE=InnoDB;


const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const { runSystemMigrations, runTenantMigrations } = require("./migrationRunner");
const db = require("./dbConnectionManager");

/**
 * Initializes all databases, runs migrations, and seeds default records
 */
const initDatabases = async () => {
  console.log("[Database Initialization] Starting SaaS 2-Tier Multi-Tenant initialization...");

  try {
    // 1. Run super_admin_db migrations
    await runSystemMigrations();

    // Drop the unique constraint index on medicine_name to allow different admins to add duplicate medicine names
    await new Promise((resDrop) => {
      db.superAdminDb.query("SHOW INDEX FROM medicine_master WHERE Key_name = 'medicine_name'", (err, results) => {
        if (!err && results && results.length > 0) {
          db.superAdminDb.query("ALTER TABLE medicine_master DROP INDEX medicine_name", (err2) => {
            if (err2) {
              console.warn("[Database Initialization] Warning: Failed to drop unique index 'medicine_name':", err2.message);
            } else {
              console.log("[Database Initialization] Dropped unique index 'medicine_name' to allow tenant-scoped duplicate names.");
            }
            resDrop();
          });
        } else {
          resDrop();
        }
      });
    });

    // 1b. Seed default homeopathic medicines programmatically if not already present
    const defaultMedicines = [
      { name: "Arnica Montana 30C", generic: "Arnica Montana", desc: "Excellent for bruising, muscle soreness, and physical trauma" },
      { name: "Nux Vomica 30C", generic: "Nux Vomica", desc: "Indicated for digestive issues, hangover, and stress-related irritability" },
      { name: "Arsenicum Album 30C", generic: "Arsenicum Album", desc: "Used for anxiety, food poisoning, and burning digestive pain" },
      { name: "Belladonna 30C", generic: "Belladonna", desc: "Indicated for sudden onset high fever, throbbing headaches, and inflammation" },
      { name: "Rhus Toxicodendron 30C", generic: "Rhus Toxicodendron", desc: "Excellent for joint stiffness, arthritis, and skin rashes that improve with warmth" },
      { name: "Apis Mellifica 30C", generic: "Apis Mellifica", desc: "For insect bites, stings, and hives with swelling and burning pain" },
      { name: "Gelsemium 30C", generic: "Gelsemium Sempervirens", desc: "For flu-like symptoms, heavy fatigue, and stage fright/anxiety" },
      { name: "Lycopodium 30C", generic: "Lycopodium Clavatum", desc: "For bloating, gas, digestive weakness, and lack of self-confidence" },
      { name: "Pulsatilla 30C", generic: "Pulsatilla Pratensis", desc: "For weeping/emotional states, colds with thick yellow discharge, and joint pain" },
      { name: "Sulphur 30C", generic: "Sulphur", desc: "For hot, itchy skin conditions, eczema, and lethargy" },
      { name: "Paracetamol 650mg", generic: "Paracetamol", desc: "Common analgesic and antipyretic for pain and fever relief" }
    ];

    for (const med of defaultMedicines) {
      await new Promise((resSeed) => {
        db.superAdminDb.query(
          "SELECT COUNT(*) as count FROM medicine_master WHERE medicine_name = ? AND created_by IS NULL",
          [med.name],
          (errCount, resultsCount) => {
            if (!errCount && resultsCount[0].count === 0) {
              db.superAdminDb.query(
                "INSERT INTO medicine_master (medicine_name, generic_name, description, status, created_by) VALUES (?, ?, ?, 'Active', NULL)",
                [med.name, med.generic, med.desc],
                (errIns) => {
                  if (errIns) {
                    console.error(`[Database Initialization] Failed seeding medicine: ${med.name}`, errIns.message);
                  } else {
                    console.log(`[Database Initialization] Programmatically seeded default medicine: ${med.name}`);
                  }
                  resSeed();
                }
              );
            } else {
              resSeed();
            }
          }
        );
      });
    }

    // 1c. Ensure additional columns exist in admins table
    const addColumnsQueries = [
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) DEFAULT '#CA6180'",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS clinic_address TEXT DEFAULT NULL",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS clinic_phone VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS clinic_details TEXT DEFAULT NULL",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS logo_width INT DEFAULT 120",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS logo_height INT DEFAULT 120",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS patient_prefix VARCHAR(50) DEFAULT 'P'",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT NULL",
      "ALTER TABLE admins ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT NULL"
    ];

    for (const q of addColumnsQueries) {
      await new Promise((resCol, rejCol) => {
        db.superAdminDb.query(q, (err) => {
          if (err && err.code !== "ER_DUP_FIELDNAME" && err.code !== "ER_PARSE_ERROR") {
            // If IF NOT EXISTS is not supported, run without it and ignore ER_DUP_FIELDNAME
            const fallbackQuery = q.replace(" ADD COLUMN IF NOT EXISTS ", " ADD COLUMN ");
            db.superAdminDb.query(fallbackQuery, (err2) => {
              if (err2 && err2.code !== "ER_DUP_FIELDNAME") {
                return rejCol(err2);
              }
              resCol();
            });
          } else {
            resCol();
          }
        });
      });
    }

    // 2. Seed default superadmin in super_admin_db.admins if empty
    await new Promise((resolve, reject) => {
      db.superAdminDb.query("SELECT COUNT(*) as count FROM admins WHERE role = 'super_admin'", (err, results) => {
        if (err) return reject(err);
        if (results[0].count === 0) {
          const hashedSaPassword = bcrypt.hashSync("superadmin", 10);
          db.superAdminDb.query(
            `INSERT INTO admins (admin_name, database_name, owner_name, email, password, role, status) 
             VALUES ('Platform Administrator', NULL, 'Super Admin', 'superadmin', ?, 'super_admin', 'Active')`,
            [hashedSaPassword],
            (insertErr) => {
              if (insertErr) return reject(insertErr);
              console.log("[Database Initialization] Seeded default superadmin ('superadmin' / 'superadmin').");
              resolve();
            }
          );
        } else {
          resolve();
        }
      });
    });

    // 3. Seed default Sumitra Clinic (admin_0001) in super_admin_db.admins if empty
    await new Promise((resolve, reject) => {
      db.superAdminDb.query("SELECT COUNT(*) as count FROM admins WHERE role = 'admin'", (err, results) => {
        if (err) return reject(err);
        if (results[0].count === 0) {
          const hashedAdminPassword = bcrypt.hashSync("admin", 10);
          
          // Insert clinic 1 info
          db.superAdminDb.query(
            `INSERT INTO admins (admin_name, database_name, owner_name, email, password, role, status) 
             VALUES ('Sumitra Homeopathy Clinic', 'admin_0001', 'Dr. Sumitra', 'admin', ?, 'admin', 'Active')`,
            [hashedAdminPassword],
            async (insertErr, result) => {
              if (insertErr) return reject(insertErr);
              
              try {
                // Initialize admin_0001 database and tables
                await runTenantMigrations("admin_0001");
                console.log("[Database Initialization] Seeded default Sumitra Homeopathy Clinic (admin_0001) and admin user ('admin' / 'admin').");
                resolve();
              } catch (migErr) {
                reject(migErr);
              }
            }
          );
        } else {
          resolve();
        }
      });
    });

    // 3b. Ensure Sumitra Clinic coordinates and styles are updated
    await new Promise((resolve) => {
      db.superAdminDb.query(
        `UPDATE admins 
         SET latitude = 23.2128, longitude = 77.4442, 
             clinic_address = '301, Near 11 No Stop, E-7, Arera Colony, Bhopal',
             clinic_phone = 'contact@homeopathy-world.com',
             clinic_details = 'Mon - Sat : 5:30 PM - 9:00 PM',
             admin_name = 'Sumitra Homeopathy Clinic',
             theme_color = '#14B8A6'
         WHERE database_name = 'admin_0001'`,
        (err) => {
          if (err) console.warn("Failed updating Sumitra coordinates: ", err.message);
          resolve();
        }
      );
    });

    // 3c. Seed default Aranya Clinic (admin_0002) in super_admin_db.admins if empty
    await new Promise((resolve) => {
      db.superAdminDb.query("SELECT COUNT(*) as count FROM admins WHERE database_name = 'admin_0002'", (err, results) => {
        if (!err && results && results[0] && results[0].count === 0) {
          const hashedAdminPassword = bcrypt.hashSync("admin", 10);
          db.superAdminDb.query(
            `INSERT INTO admins (admin_name, database_name, owner_name, email, password, role, status, theme_color, latitude, longitude, clinic_address, clinic_phone, clinic_details) 
             VALUES ('Aranya Wellness Center', 'admin_0002', 'Dr. Aranya', 'admin2', ?, 'admin', 'Active', '#00b0ff', 23.2323, 77.4300, 'Plot No. 42, MP Nagar Zone II, Near Manohar Dairy, Bhopal, MP', 'info@aranyawellness.com', 'Mon - Sat : 9:00 AM - 1:00 PM, 4:00 PM - 8:00 PM')`,
            [hashedAdminPassword],
            async (insertErr) => {
              if (insertErr) {
                console.warn("Failed seeding second clinic admins: ", insertErr.message);
                resolve();
              } else {
                try {
                  await runTenantMigrations("admin_0002");
                  console.log("[Database Initialization] Seeded default Aranya Clinic (admin_0002) and database migrations completed.");
                  resolve();
                } catch (migErr) {
                  console.warn("Failed running tenant migrations for admin_0002: ", migErr.message);
                  resolve();
                }
              }
            }
          );
        } else {
          // If already exists, ensure we update coordinates anyway
          db.superAdminDb.query(
            `UPDATE admins 
             SET latitude = 23.2323, longitude = 77.4300, 
                 clinic_address = 'Plot No. 42, MP Nagar Zone II, Near Manohar Dairy, Bhopal, MP',
                 clinic_phone = 'info@aranyawellness.com',
                 clinic_details = 'Mon - Sat : 9:00 AM - 1:00 PM, 4:00 PM - 8:00 PM',
                 admin_name = 'Aranya Wellness Center',
                 theme_color = '#00b0ff'
             WHERE database_name = 'admin_0002'`,
            (err) => {
              if (err) console.warn("Failed updating Aranya coordinates: ", err.message);
              resolve();
            }
          );
        }
      });
    });

    // 4. Run tenant migrations on all active tenant databases to keep them updated
    const activeClinics = await new Promise((resolve, reject) => {
      db.superAdminDb.query(
        "SELECT database_name FROM admins WHERE deleted_at IS NULL AND status = 'Active' AND database_name IS NOT NULL",
        (err, results) => {
          if (err) return reject(err);
          resolve(results.map(r => r.database_name));
        }
      );
    });

    console.log(`[Database Initialization] Syncing schemas for ${activeClinics.length} active clinic databases...`);
    for (const dbName of activeClinics) {
      try {
        await runTenantMigrations(dbName);
      } catch (err) {
        console.warn(`[Database Initialization] Warning: Failed to run migrations for tenant database '${dbName}': ${err.message}. Ensure it is pre-created in cPanel/Control Panel.`);
      }
    }

    console.log("[Database Initialization] SaaS multi-tenant databases initialized successfully.");
  } catch (error) {
    console.error("[Database Initialization] Critical failure during database startup setup:", error);
    throw error;
  }
};

module.exports = initDatabases;

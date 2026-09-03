const db = require("../database/dbConnectionManager");
const bcrypt = require("bcryptjs");
const { runTenantMigrations } = require("../database/migrationRunner");

/**
 * Registers a new Admin (represents a Clinic):
 * 1. Inserts the Admin profile into super_admin_db.admins
 * 2. Generates a unique database name based on the insert ID: admin_XXXX
 * 3. Updates the Admin record with the database name
 * 4. Provision the database and execute migration SQL to create tables
 * 
 * @param {object} adminData - Registry details
 */
const registerClinic = async (adminData) => {
  const { 
    admin_name, 
    owner_name, 
    email, 
    password,
    logo_url,
    theme_color,
    clinic_address,
    clinic_phone,
    clinic_details,
    logo_width,
    logo_height,
    patient_prefix,
    latitude,
    longitude
  } = adminData;

  if (!admin_name || !owner_name || !email || !password) {
    throw new Error("Missing required registration fields: admin_name, owner_name, email, password");
  }

  return new Promise((resolve, reject) => {
    // 1. Insert admin record
    const insertAdminQuery = `
      INSERT INTO admins (
        admin_name, database_name, owner_name, email, password, role, status,
        logo_url, theme_color, clinic_address, clinic_phone, clinic_details, logo_width, logo_height, patient_prefix,
        latitude, longitude
      )
      VALUES (?, 'temp_db', ?, ?, ?, 'admin', 'Active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.superAdminDb.query(
      insertAdminQuery,
      [
        admin_name.trim(), 
        owner_name.trim(), 
        email.trim(), 
        hashedPassword,
        logo_url || null,
        theme_color || "#CA6180",
        clinic_address || null,
        clinic_phone || null,
        clinic_details || null,
        logo_width || 120,
        logo_height || 120,
        patient_prefix || "P",
        latitude || 23.2128,
        longitude || 77.4442
      ],
      async (err, result) => {
        if (err) {
          console.error("[Registration Service] Failed to register admin:", err);
          return reject(err);
        }

        const adminId = result.insertId;

        // Query the highest database name to determine the next sequential name
        db.superAdminDb.query(
          "SELECT database_name FROM admins WHERE database_name LIKE 'admin_%' ORDER BY database_name DESC LIMIT 1",
          async (seqErr, seqResults) => {
            if (seqErr) {
              console.error("[Registration Service] Failed to query sequential database name:", seqErr);
              db.superAdminDb.query("DELETE FROM admins WHERE id = ?", [adminId]);
              return reject(seqErr);
            }

            let nextNum = 1;
            if (seqResults && seqResults.length > 0) {
              const lastDbName = seqResults[0].database_name;
              const match = lastDbName.match(/admin_(\d+)/);
              if (match) {
                nextNum = parseInt(match[1]) + 1;
              }
            }
            const dbName = `admin_${String(nextNum).padStart(4, "0")}`;

            try {
              // 2. Update database name in super_admin_db.admins
              await new Promise((resUpdate, rejUpdate) => {
                db.superAdminDb.query(
                  "UPDATE admins SET database_name = ? WHERE id = ?",
                  [dbName, adminId],
                  (updateErr) => {
                    if (updateErr) return rejUpdate(updateErr);
                    resUpdate();
                  }
                );
              });

              // 3. Provision database and run migrations
              await runTenantMigrations(dbName);

              console.log(`[Registration Service] Admin/Clinic '${admin_name}' registered successfully with database '${dbName}'`);
              resolve({
                success: true,
                adminId,
                databaseName: dbName,
                message: "Admin registered and clinic database provisioned successfully."
              });
            } catch (subErr) {
              console.error(`[Registration Service] Rollback required for admin id ${adminId} due to:`, subErr);
              // Clean up the invalid admin row
              db.superAdminDb.query("DELETE FROM admins WHERE id = ?", [adminId]);
              reject(subErr);
            }
          }
        );
      }
    );
  });
};

module.exports = {
  registerClinic
};

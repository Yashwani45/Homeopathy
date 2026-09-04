// const db = require("../database/dbConnectionManager");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { registerClinic } = require("../services/registrationService");
// const tenantMiddleware = require("../middleware/tenantMiddleware");

// const SECRET = process.env.JWT_SECRET || "hospital_secret";

// /**
//  * Verifies a password against hash or plain text (for backward compatibility)
//  */
// const verifyPassword = (inputPassword, storedPassword) => {
//   if (!storedPassword) return false;
//   if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
//     try {
//       return bcrypt.compareSync(inputPassword, storedPassword);
//     } catch (e) {
//       return false;
//     }
//   }
//   return inputPassword === storedPassword;
// };

// /**
//  * Handles login across all roles in the 2-tier SaaS model.
//  * 1. Admin/Super Admin are authenticated via super_admin_db.admins.
//  * 2. Doctor/Patient/Staff are authenticated via their local clinic tables inside the active tenant database.
//  */
// const login = (req, res) => {
//   const { username, password, patient_id, adminId } = req.body;
//   const loginIdentifier = (username || patient_id || "").trim();

//   if (!loginIdentifier || !password) {
//     return res.status(400).json({ error: "Username/Email/Patient ID and password are required." });
//   }

//   // A. Check if the login belongs to an Admin or Super Admin (lookup in super_admin_db.admins)
//   db.superAdminDb.query(
//     "SELECT * FROM admins WHERE (email = ? OR owner_name = ?) AND deleted_at IS NULL",
//     [loginIdentifier, loginIdentifier],
//     (err, results) => {
//       if (err) {
//         console.error("[Auth Controller] Super Admin db query error:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       if (results.length > 0) {
//         const admin = results[0];
//         if (admin.status === "Inactive") {
//           return res.status(403).json({ error: "Your account is deactivated. Please contact Super Admin." });
//         }
//         const isPassValid = verifyPassword(password, admin.password);
//         if (!isPassValid) {
//           return res.status(401).json({ error: "Invalid email or password" });
//         }

//         const token = jwt.sign(
//           {
//             id: admin.id,
//             username: admin.owner_name,
//             role: admin.role,
//             adminId: admin.id,
//             databaseName: admin.database_name || "super_admin_db"
//           },
//           SECRET,
//           { expiresIn: "8h" }
//         );

//         return res.json({
//           success: true,
//           token,
//           role: admin.role || "admin",
//           id: admin.id,
//           username: admin.email || admin.owner_name,
//           clinic_name: admin.admin_name || null,
//           logo_url: admin.logo_url || null,
//           theme_color: admin.theme_color || null
//         });
//       }

//       // B. If not found in central admin table, must be a Doctor, Patient, or Staff inside a specific clinic DB
//       // We require the client to supply which clinic adminId they are connecting to.
//       const targetAdminId = adminId || req.headers["x-tenant-id"] || req.query.adminId || req.body?.admin_id;
//       if (!targetAdminId) {
//         return res.status(400).json({ error: "Clinic Admin ID is required for doctor/patient/staff authentication." });
//       }

//       // Look up target database name
//       db.superAdminDb.query(
//         "SELECT * FROM admins WHERE id = ? AND deleted_at IS NULL",
//         [parseInt(targetAdminId)],
//         (dbErr, adminResults) => {
//           if (dbErr || adminResults.length === 0) {
//             return res.status(400).json({ error: "Clinic not found or deactivated." });
//           }

//           const targetAdmin = adminResults[0];
//           if (targetAdmin.status === "Inactive") {
//             return res.status(403).json({ error: "This clinic is deactivated. Access denied." });
//           }
//           const dbName = targetAdmin.database_name;
//           const tenantPool = db.getTenantConnection(dbName);

//           // Execute query inside the target tenant database context
//           db.asyncLocalStorage.run({ connection: tenantPool, dbName, adminId: targetAdmin.id }, () => {

//             // 1. Check Doctors table
//             db.query("SELECT * FROM doctors WHERE username = ? AND deleted_at IS NULL", [loginIdentifier], (docErr, docs) => {
//               if (!docErr && docs.length > 0) {
//                 const doctor = docs[0];
//                 if (doctor.status === "Inactive") {
//                   return res.status(403).json({ error: "Your doctor account is deactivated. Please contact your clinic admin." });
//                 }
//                 const isDocPassValid = verifyPassword(password, doctor.password);
//                 if (!isDocPassValid) return res.status(401).json({ error: "Invalid doctor credentials." });

//                 const token = jwt.sign(
//                   { id: doctor.id, username: doctor.name, role: "doctor", adminId: targetAdmin.id, databaseName: dbName },
//                   SECRET,
//                   { expiresIn: "8h" }
//                 );

//                 return res.json({
//                   success: true,
//                   token,
//                   role: "doctor",
//                   id: doctor.id,
//                   adminId: targetAdmin.id,
//                   doctorId: doctor.id,
//                   doctorName: doctor.name,
//                   username: doctor.username,
//                   clinic_name: targetAdmin.admin_name
//                 });
//               }

//               // 2. Check Patients table
//               db.query("SELECT * FROM patients WHERE patient_id = ? AND deleted_at IS NULL", [loginIdentifier], (patErr, pats) => {
//                 if (!patErr && pats.length > 0) {
//                   const patient = pats[0];
//                   if (patient.status === "Inactive") {
//                     return res.status(403).json({ error: "Your patient account is deactivated. Please contact the clinic." });
//                   }
//                   // In this SaaS model, patient credentials can be looked up in superadmin or verified against custom logins.
//                   // For patient credentials, let's verify if password matches or matches default mobile.
//                   const isPatPassValid = verifyPassword(password, patient.password) || password === patient.mobile;
//                   if (!isPatPassValid) return res.status(401).json({ error: "Invalid patient credentials." });

//                   const token = jwt.sign(
//                     { id: patient.id, username: patient.name, role: "patient", adminId: targetAdmin.id, databaseName: dbName, referenceId: patient.patient_id },
//                     SECRET,
//                     { expiresIn: "8h" }
//                   );

//                   return res.json({
//                     success: true,
//                     token,
//                     role: "patient",
//                     id: patient.id,
//                     adminId: targetAdmin.id,
//                     patientId: patient.patient_id,
//                     patientName: patient.name,
//                     username: patient.name,
//                     clinic_name: targetAdmin.admin_name
//                   });
//                 }

//                 // 3. Check Staff Members table
//                 db.query("SELECT * FROM staff_members WHERE username = ? AND deleted_at IS NULL", [loginIdentifier], (staffErr, staff) => {
//                   if (!staffErr && staff.length > 0) {
//                     const member = staff[0];
//                     if (member.status === "Inactive") {
//                       return res.status(403).json({ error: "Your staff account is deactivated. Please contact your clinic admin." });
//                     }
//                     const isStaffPassValid = verifyPassword(password, member.password);
//                     if (!isStaffPassValid) return res.status(401).json({ error: "Invalid staff credentials." });

//                     const token = jwt.sign(
//                       { id: member.id, username: member.name, role: "staff", adminId: targetAdmin.id, databaseName: dbName },
//                       SECRET,
//                       { expiresIn: "8h" }
//                     );

//                     return res.json({
//                       success: true,
//                       token,
//                       role: "staff",
//                       id: member.id,
//                       adminId: targetAdmin.id,
//                       staffId: member.id,
//                       username: member.username,
//                       clinic_name: targetAdmin.admin_name
//                     });
//                   }

//                   // Not found anywhere
//                   return res.status(401).json({ error: "Invalid credentials" });
//                 });
//               });
//             });
//           });
//         }
//       );
//     }
//   );
// };
// //

// const getAdmins = (req, res) => {
//   if (req.user.role !== "super_admin") {
//     return res.status(403).json({ error: "Access denied. Super Admin role required." });
//   }

//   db.superAdminDb.query(
//     "SELECT id, email AS username, role, status, admin_name, admin_name AS clinic_name, owner_name, logo_url, theme_color, clinic_address, clinic_phone, clinic_details, logo_width, logo_height, patient_prefix FROM admins WHERE deleted_at IS NULL",
//     (err, admins) => {
//       if (err) {
//         console.error("Error fetching admins: ", err);
//         return res.status(500).json({ error: err.message });
//       }
//       res.json(admins);
//     }
//   );
// };

// /**
//  * Provisions a new clinic admin and dynamic database (Super Admin only)
//  */

// const addAdmin = async (req, res) => {
//   if (req.user.role !== "super_admin") {
//     return res.status(403).json({ error: "Access denied. Super Admin role required." });
//   }

//   const {
//     username,
//     password,
//     clinic_name,
//     owner_name,
//     email,
//     logo_url,
//     theme_color,
//     clinic_address,
//     clinic_phone,
//     clinic_details,
//     logo_width,
//     logo_height,
//     patient_prefix,
//     latitude,
//     longitude
//   } = req.body;

//   const adminEmail = email || username;
//   const resolvedClinicName = clinic_name || (username ? `${username.charAt(0).toUpperCase() + username.slice(1)} Clinic` : "Default Clinic");
//   const resolvedOwnerName = owner_name || (username ? `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}` : "Clinic Owner");

//   if (!adminEmail || !password) {
//     return res.status(400).json({ error: "Username/Email and password are required." });
//   }

//   try {
//     const result = await registerClinic({
//       admin_name: resolvedClinicName.trim(),
//       owner_name: resolvedOwnerName.trim(),
//       email: adminEmail.trim(),
//       password,
//       logo_url: logo_url || null,
//       theme_color: theme_color || "#CA6180",
//       clinic_address: clinic_address || null,
//       clinic_phone: clinic_phone || null,
//       clinic_details: clinic_details || null,
//       logo_width: logo_width || 120,
//       logo_height: logo_height || 120,
//       patient_prefix: patient_prefix || "P",
//       latitude: latitude ? parseFloat(latitude) : null,
//       longitude: longitude ? parseFloat(longitude) : null
//     });

//     res.json({
//       success: true,
//       message: "Clinic Admin registered and database provisioned successfully",
//       result
//     });
//   } catch (err) {
//     console.error("[Auth Controller] Registration failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Updates clinic admin profile
//  */
// const updateAdmin = (req, res) => {
//   if (req.user.role !== "super_admin") {
//     return res.status(403).json({ error: "Access denied. Super Admin role required." });
//   }

//   const {
//     username,
//     email,
//     password,
//     clinic_name,
//     admin_name,
//     owner_name,
//     patient_prefix,
//     logo_url,
//     theme_color,
//     clinic_address,
//     clinic_phone,
//     clinic_details,
//     logo_width,
//     logo_height
//   } = req.body;

//   const targetId = req.params.id;
//   const adminEmail = (email || username || "").trim();
//   const resolvedClinicName = (clinic_name || admin_name || "").trim();

//   const updateFields = [
//     "email = ?",
//     "owner_name = ?",
//     "admin_name = ?",
//     "logo_url = ?",
//     "theme_color = ?",
//     "clinic_address = ?",
//     "clinic_phone = ?",
//     "clinic_details = ?",
//     "logo_width = ?",
//     "logo_height = ?",
//     "patient_prefix = ?"
//   ];

//   const updateParams = [
//     adminEmail,
//     (owner_name || "").trim(),
//     resolvedClinicName,
//     logo_url || null,
//     theme_color || "#CA6180",
//     clinic_address || null,
//     clinic_phone || null,
//     clinic_details || null,
//     logo_width || 120,
//     logo_height || 120,
//     patient_prefix || "P"
//   ];

//   if (password) {
//     const hashedPassword = bcrypt.hashSync(password, 10);
//     updateFields.push("password = ?");
//     updateParams.push(hashedPassword);
//   }

//   updateParams.push(targetId);

//   db.superAdminDb.query(
//     `UPDATE admins SET ${updateFields.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
//     updateParams,
//     (err) => {
//       if (err) {
//         console.error("Error updating admin details:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       res.send("Admin details updated successfully");
//     }
//   );
// };

// /**
//  * Toggles clinic admin status between Active and Inactive
//  */
// const toggleAdminStatus = (req, res) => {
//   if (req.user.role !== "super_admin") {
//     return res.status(403).json({ error: "Access denied. Super Admin role required." });
//   }

//   const targetId = req.params.id;

//   if (String(req.user.id) === String(targetId)) {
//     return res.status(400).json({ error: "Cannot change status of your own account." });
//   }

//   db.superAdminDb.query(
//     "SELECT status FROM admins WHERE id = ? AND deleted_at IS NULL",
//     [targetId],
//     (err, results) => {
//       if (err) {
//         console.error("Error fetching admin status:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       if (results.length === 0) {
//         return res.status(404).json({ error: "Admin not found" });
//       }

//       const currentStatus = results[0].status;
//       const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

//       db.superAdminDb.query(
//         "UPDATE admins SET status = ? WHERE id = ?",
//         [newStatus, targetId],
//         (updateErr) => {
//           if (updateErr) {
//             console.error("Error updating admin status:", updateErr);
//             return res.status(500).json({ error: updateErr.message });
//           }

//           // Clear the tenant database name cache
//           if (tenantMiddleware && tenantMiddleware.clearDbCache) {
//             tenantMiddleware.clearDbCache(targetId);
//           }

//           res.json({
//             success: true,
//             message: `Admin account has been ${newStatus === "Active" ? "activated" : "deactivated"} successfully.`,
//             status: newStatus
//           });
//         }
//       );
//     }
//   );
// };

// /**
//  * Fetches branding configurations (logo and theme) for clinic portals
//  */
// const getBranding = (req, res) => {
//   const adminId = req.params.adminId;
//   if (!adminId) {
//     return res.status(400).json({ error: "adminId is required" });
//   }

//   db.superAdminDb.query(
//     "SELECT admin_name AS clinic_name, logo_url, theme_color, clinic_address, clinic_phone, clinic_details, logo_width, logo_height, patient_prefix, status, deleted_at FROM admins WHERE id = ?",
//     [adminId],
//     (err, result) => {
//       if (err) {
//         console.error("getBranding error:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       if (!result || result.length === 0 || result[0].deleted_at !== null || result[0].status !== "Active") {
//         return res.status(404).json({ error: "Clinic not found or inactive" });
//       }
//       return res.json({ success: true, branding: result[0] });
//     }
//   );
// };

// const updateBranding = (req, res) => {
//   if (!req.user || (req.user.role !== "admin" && req.user.role !== "super_admin")) {
//     return res.status(403).json({ error: "Access denied." });
//   }

//   const adminId = req.user.id;
//   const {
//     clinic_name,
//     logo_url,
//     theme_color,
//     clinic_address,
//     clinic_phone,
//     clinic_details,
//     logo_width,
//     logo_height,
//     patient_prefix
//   } = req.body;

//   db.superAdminDb.query(
//     `UPDATE admins SET 
//       admin_name = ?, 
//       logo_url = ?, 
//       theme_color = ?, 
//       clinic_address = ?, 
//       clinic_phone = ?, 
//       clinic_details = ?, 
//       logo_width = ?, 
//       logo_height = ?,
//       patient_prefix = ?
//     WHERE id = ?`,
//     [
//       clinic_name ? clinic_name.trim() : null,
//       logo_url ? logo_url.trim() : null,
//       theme_color ? theme_color.trim() : null,
//       clinic_address ? clinic_address.trim() : null,
//       clinic_phone ? clinic_phone.trim() : null,
//       clinic_details ? clinic_details.trim() : null,
//       parseInt(logo_width) || 120,
//       parseInt(logo_height) || 120,
//       patient_prefix ? patient_prefix.trim().toUpperCase().replace(/[^A-Z]/g, "") : "P",
//       adminId
//     ],
//     (err) => {
//       if (err) {
//         console.error("updateBranding error:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       return res.json({ success: true, message: "Branding and profile updated successfully" });
//     }
//   );
// };

// // GET /api/auth/public-clinics — public list of clinics
// const getPublicClinics = (req, res) => {
//   db.superAdminDb.query(
//     "SELECT id, email AS username, admin_name AS clinic_name, latitude, longitude, clinic_address, clinic_phone, clinic_details, logo_url, theme_color FROM admins WHERE role = 'admin' AND deleted_at IS NULL AND status = 'Active'",
//     (err, result) => {
//       if (err) {
//         console.error("getPublicClinics error:", err);
//         return res.status(500).json({ error: err.message });
//       }
//       return res.json({ success: true, clinics: result });
//     }
//   );
// };

// module.exports = {
//   login,
//   getAdmins,
//   addAdmin,
//   updateAdmin,
//   toggleAdminStatus,
//   getBranding,
//   updateBranding,
//   getPublicClinics
// };
const db = require("../database/dbConnectionManager");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerClinic } = require("../services/registrationService");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const SECRET = process.env.JWT_SECRET || "hospital_secret";

/**
 * Verifies a password against hash or plain text
 * for backward compatibility.
 */
const verifyPassword = (inputPassword, storedPassword) => {
  if (!storedPassword) return false;

  if (
    storedPassword.startsWith("$2a$") ||
    storedPassword.startsWith("$2b$") ||
    storedPassword.startsWith("$2y$")
  ) {
    try {
      return bcrypt.compareSync(inputPassword, storedPassword);
    } catch (e) {
      console.error("[Auth] Password verification error:", e);
      return false;
    }
  }

  return inputPassword === storedPassword;
};

/**
 * Handles login across all roles.
 *
 * Admin / Super Admin:
 *   central admins table -> db.superAdminDb
 *
 * Doctor / Patient / Staff:
 *   tenant database -> db.getTenantConnection()
 */
const login = (req, res) => {
  const { username, password, patient_id, adminId } = req.body;

  const loginIdentifier = (username || patient_id || "").trim();

  if (!loginIdentifier || !password) {
    return res.status(400).json({
      error: "Username/Email/Patient ID and password are required.",
    });
  }

  console.log(
    `[Auth Controller] Login attempt for: ${loginIdentifier}`
  );

  // =========================================================
  // A. ADMIN / SUPER ADMIN LOGIN
  // =========================================================

  db.superAdminDb.query(
    `SELECT *
     FROM admins
     WHERE (email = ? OR owner_name = ?)
     AND deleted_at IS NULL`,
    [loginIdentifier, loginIdentifier],
    (err, results) => {
      if (err) {
        console.error(
          "[Auth Controller] Super Admin db query error:",
          err
        );

        return res.status(500).json({
          error: "Database connection error while authenticating admin.",
          details:
            process.env.NODE_ENV === "production"
              ? undefined
              : err.message,
        });
      }

      // =====================================================
      // ADMIN FOUND
      // =====================================================

      if (results.length > 0) {
        const admin = results[0];

        if (admin.status === "Inactive") {
          return res.status(403).json({
            error:
              "Your account is deactivated. Please contact Super Admin.",
          });
        }

        const isPassValid = verifyPassword(
          password,
          admin.password
        );

        if (!isPassValid) {
          return res.status(401).json({
            error: "Invalid email or password",
          });
        }

        const token = jwt.sign(
          {
            id: admin.id,
            username: admin.owner_name,
            role: admin.role,
            adminId: admin.id,
            databaseName:
              admin.database_name || "super_admin_db",
          },
          SECRET,
          {
            expiresIn: "8h",
          }
        );

        console.log(
          `[Auth Controller] Admin login successful: ${admin.email}`
        );

        return res.json({
          success: true,
          token,
          role: admin.role || "admin",
          id: admin.id,
          username: admin.email || admin.owner_name,
          clinic_name: admin.admin_name || null,
          logo_url: admin.logo_url || null,
          theme_color: admin.theme_color || null,
        });
      }

      // =====================================================
      // B. DOCTOR / PATIENT / STAFF LOGIN
      // =====================================================

      const targetAdminId =
        adminId ||
        req.headers["x-tenant-id"] ||
        req.query.adminId ||
        req.body?.admin_id;

      if (!targetAdminId) {
        return res.status(400).json({
          error:
            "Clinic Admin ID is required for doctor/patient/staff authentication.",
        });
      }

      const parsedAdminId = parseInt(targetAdminId, 10);

      if (Number.isNaN(parsedAdminId)) {
        return res.status(400).json({
          error: "Invalid Clinic Admin ID.",
        });
      }

      // =====================================================
      // FIND CLINIC
      // =====================================================

      db.superAdminDb.query(
        `SELECT *
         FROM admins
         WHERE id = ?
         AND deleted_at IS NULL`,
        [parsedAdminId],
        (dbErr, adminResults) => {
          if (dbErr) {
            console.error(
              "[Auth Controller] Clinic lookup error:",
              dbErr
            );

            return res.status(500).json({
              error: "Database error while finding clinic.",
            });
          }

          if (!adminResults || adminResults.length === 0) {
            return res.status(400).json({
              error: "Clinic not found or deactivated.",
            });
          }

          const targetAdmin = adminResults[0];

          if (targetAdmin.status === "Inactive") {
            return res.status(403).json({
              error:
                "This clinic is deactivated. Access denied.",
            });
          }

          const dbName = targetAdmin.database_name;

          if (!dbName) {
            return res.status(500).json({
              error:
                "Clinic database configuration is missing.",
            });
          }

          let tenantPool;

          try {
            tenantPool = db.getTenantConnection(dbName);
          } catch (tenantErr) {
            console.error(
              "[Auth Controller] Tenant connection error:",
              tenantErr
            );

            return res.status(500).json({
              error:
                "Unable to connect to clinic database.",
            });
          }

          // =================================================
          // TENANT CONTEXT
          // =================================================

          db.asyncLocalStorage.run(
            {
              connection: tenantPool,
              dbName,
              adminId: targetAdmin.id,
            },
            () => {
              // =============================================
              // 1. DOCTOR
              // =============================================

              db.query(
                `SELECT *
                 FROM doctors
                 WHERE username = ?
                 AND deleted_at IS NULL`,
                [loginIdentifier],
                (docErr, docs) => {
                  if (!docErr && docs.length > 0) {
                    const doctor = docs[0];

                    if (doctor.status === "Inactive") {
                      return res.status(403).json({
                        error:
                          "Your doctor account is deactivated. Please contact your clinic admin.",
                      });
                    }

                    const isDocPassValid =
                      verifyPassword(
                        password,
                        doctor.password
                      );

                    if (!isDocPassValid) {
                      return res.status(401).json({
                        error:
                          "Invalid doctor credentials.",
                      });
                    }

                    const token = jwt.sign(
                      {
                        id: doctor.id,
                        username: doctor.name,
                        role: "doctor",
                        adminId: targetAdmin.id,
                        databaseName: dbName,
                      },
                      SECRET,
                      {
                        expiresIn: "8h",
                      }
                    );

                    return res.json({
                      success: true,
                      token,
                      role: "doctor",
                      id: doctor.id,
                      adminId: targetAdmin.id,
                      doctorId: doctor.id,
                      doctorName: doctor.name,
                      username: doctor.username,
                      clinic_name:
                        targetAdmin.admin_name,
                    });
                  }

                  // =========================================
                  // 2. PATIENT
                  // =========================================

                  db.query(
                    `SELECT *
                     FROM patients
                     WHERE patient_id = ?
                     AND deleted_at IS NULL`,
                    [loginIdentifier],
                    (patErr, pats) => {
                      if (!patErr && pats.length > 0) {
                        const patient = pats[0];

                        if (patient.status === "Inactive") {
                          return res.status(403).json({
                            error:
                              "Your patient account is deactivated. Please contact the clinic.",
                          });
                        }

                        const isPatPassValid =
                          verifyPassword(
                            password,
                            patient.password
                          ) ||
                          password === patient.mobile;

                        if (!isPatPassValid) {
                          return res.status(401).json({
                            error:
                              "Invalid patient credentials.",
                          });
                        }

                        const token = jwt.sign(
                          {
                            id: patient.id,
                            username: patient.name,
                            role: "patient",
                            adminId: targetAdmin.id,
                            databaseName: dbName,
                            referenceId:
                              patient.patient_id,
                          },
                          SECRET,
                          {
                            expiresIn: "8h",
                          }
                        );

                        return res.json({
                          success: true,
                          token,
                          role: "patient",
                          id: patient.id,
                          adminId: targetAdmin.id,
                          patientId:
                            patient.patient_id,
                          patientName: patient.name,
                          username: patient.name,
                          clinic_name:
                            targetAdmin.admin_name,
                        });
                      }

                      // =======================================
                      // 3. STAFF
                      // =======================================

                      db.query(
                        `SELECT *
                         FROM staff_members
                         WHERE username = ?
                         AND deleted_at IS NULL`,
                        [loginIdentifier],
                        (staffErr, staff) => {
                          if (
                            !staffErr &&
                            staff.length > 0
                          ) {
                            const member = staff[0];

                            if (
                              member.status === "Inactive"
                            ) {
                              return res.status(403).json({
                                error:
                                  "Your staff account is deactivated. Please contact your clinic admin.",
                              });
                            }

                            const isStaffPassValid =
                              verifyPassword(
                                password,
                                member.password
                              );

                            if (!isStaffPassValid) {
                              return res.status(401).json({
                                error:
                                  "Invalid staff credentials.",
                              });
                            }

                            const token = jwt.sign(
                              {
                                id: member.id,
                                username: member.name,
                                role: "staff",
                                adminId: targetAdmin.id,
                                databaseName: dbName,
                              },
                              SECRET,
                              {
                                expiresIn: "8h",
                              }
                            );

                            return res.json({
                              success: true,
                              token,
                              role: "staff",
                              id: member.id,
                              adminId: targetAdmin.id,
                              staffId: member.id,
                              username: member.username,
                              clinic_name:
                                targetAdmin.admin_name,
                            });
                          }

                          return res.status(401).json({
                            error: "Invalid credentials",
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// =========================================================
// GET ADMINS
// =========================================================

const getAdmins = (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error:
        "Access denied. Super Admin role required.",
    });
  }

  db.superAdminDb.query(
    `SELECT
      id,
      email AS username,
      role,
      status,
      admin_name,
      admin_name AS clinic_name,
      owner_name,
      logo_url,
      theme_color,
      clinic_address,
      clinic_phone,
      clinic_details,
      logo_width,
      logo_height,
      patient_prefix
     FROM admins
     WHERE deleted_at IS NULL`,
    (err, admins) => {
      if (err) {
        console.error(
          "[Auth Controller] Error fetching admins:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(admins);
    }
  );
};

// =========================================================
// ADD ADMIN
// =========================================================

const addAdmin = async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error:
        "Access denied. Super Admin role required.",
    });
  }

  const {
    username,
    password,
    clinic_name,
    owner_name,
    email,
    logo_url,
    theme_color,
    clinic_address,
    clinic_phone,
    clinic_details,
    logo_width,
    logo_height,
    patient_prefix,
    latitude,
    longitude,
  } = req.body;

  const adminEmail = email || username;

  const resolvedClinicName =
    clinic_name ||
    (username
      ? `${username.charAt(0).toUpperCase()}${username.slice(
          1
        )} Clinic`
      : "Default Clinic");

  const resolvedOwnerName =
    owner_name ||
    (username
      ? `Dr. ${username.charAt(0).toUpperCase()}${username.slice(
          1
        )}`
      : "Clinic Owner");

  if (!adminEmail || !password) {
    return res.status(400).json({
      error: "Username/Email and password are required.",
    });
  }

  try {
    const result = await registerClinic({
      admin_name: resolvedClinicName.trim(),
      owner_name: resolvedOwnerName.trim(),
      email: adminEmail.trim(),
      password,
      logo_url: logo_url || null,
      theme_color: theme_color || "#CA6180",
      clinic_address: clinic_address || null,
      clinic_phone: clinic_phone || null,
      clinic_details: clinic_details || null,
      logo_width: logo_width || 120,
      logo_height: logo_height || 120,
      patient_prefix: patient_prefix || "P",
      latitude:
        latitude !== undefined && latitude !== null
          ? parseFloat(latitude)
          : null,
      longitude:
        longitude !== undefined && longitude !== null
          ? parseFloat(longitude)
          : null,
    });

    return res.json({
      success: true,
      message:
        "Clinic Admin registered and database provisioned successfully",
      result,
    });
  } catch (err) {
    console.error(
      "[Auth Controller] Registration failed:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
  }
};

// =========================================================
// UPDATE ADMIN
// =========================================================

const updateAdmin = (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error:
        "Access denied. Super Admin role required.",
    });
  }

  const {
    username,
    email,
    password,
    clinic_name,
    admin_name,
    owner_name,
    patient_prefix,
    logo_url,
    theme_color,
    clinic_address,
    clinic_phone,
    clinic_details,
    logo_width,
    logo_height,
  } = req.body;

  const targetId = req.params.id;

  const adminEmail = (
    email ||
    username ||
    ""
  ).trim();

  const resolvedClinicName = (
    clinic_name ||
    admin_name ||
    ""
  ).trim();

  const updateFields = [
    "email = ?",
    "owner_name = ?",
    "admin_name = ?",
    "logo_url = ?",
    "theme_color = ?",
    "clinic_address = ?",
    "clinic_phone = ?",
    "clinic_details = ?",
    "logo_width = ?",
    "logo_height = ?",
    "patient_prefix = ?",
  ];

  const updateParams = [
    adminEmail,
    (owner_name || "").trim(),
    resolvedClinicName,
    logo_url || null,
    theme_color || "#CA6180",
    clinic_address || null,
    clinic_phone || null,
    clinic_details || null,
    logo_width || 120,
    logo_height || 120,
    patient_prefix || "P",
  ];

  if (password) {
    const hashedPassword = bcrypt.hashSync(
      password,
      10
    );

    updateFields.push("password = ?");
    updateParams.push(hashedPassword);
  }

  updateParams.push(targetId);

  db.superAdminDb.query(
    `UPDATE admins
     SET ${updateFields.join(", ")}
     WHERE id = ?
     AND deleted_at IS NULL`,
    updateParams,
    (err) => {
      if (err) {
        console.error(
          "[Auth Controller] Error updating admin:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      res.send(
        "Admin details updated successfully"
      );
    }
  );
};

// =========================================================
// TOGGLE ADMIN STATUS
// =========================================================

const toggleAdminStatus = (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error:
        "Access denied. Super Admin role required.",
    });
  }

  const targetId = req.params.id;

  if (
    String(req.user.id) ===
    String(targetId)
  ) {
    return res.status(400).json({
      error:
        "Cannot change status of your own account.",
    });
  }

  db.superAdminDb.query(
    `SELECT status
     FROM admins
     WHERE id = ?
     AND deleted_at IS NULL`,
    [targetId],
    (err, results) => {
      if (err) {
        console.error(
          "[Auth Controller] Error fetching admin status:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: "Admin not found",
        });
      }

      const currentStatus = results[0].status;

      const newStatus =
        currentStatus === "Active"
          ? "Inactive"
          : "Active";

      db.superAdminDb.query(
        `UPDATE admins
         SET status = ?
         WHERE id = ?`,
        [newStatus, targetId],
        (updateErr) => {
          if (updateErr) {
            console.error(
              "[Auth Controller] Error updating admin status:",
              updateErr
            );

            return res.status(500).json({
              error: updateErr.message,
            });
          }

          if (
            tenantMiddleware &&
            tenantMiddleware.clearDbCache
          ) {
            tenantMiddleware.clearDbCache(
              targetId
            );
          }

          return res.json({
            success: true,
            message: `Admin account has been ${
              newStatus === "Active"
                ? "activated"
                : "deactivated"
            } successfully.`,
            status: newStatus,
          });
        }
      );
    }
  );
};

// =========================================================
// GET BRANDING
// =========================================================

const getBranding = (req, res) => {
  const adminId = req.params.adminId;

  if (!adminId) {
    return res.status(400).json({
      error: "adminId is required",
    });
  }

  db.superAdminDb.query(
    `SELECT
      admin_name AS clinic_name,
      logo_url,
      theme_color,
      clinic_address,
      clinic_phone,
      clinic_details,
      logo_width,
      logo_height,
      patient_prefix,
      status,
      deleted_at
     FROM admins
     WHERE id = ?`,
    [adminId],
    (err, result) => {
      if (err) {
        console.error(
          "[Auth Controller] getBranding error:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      if (
        !result ||
        result.length === 0 ||
        result[0].deleted_at !== null ||
        result[0].status !== "Active"
      ) {
        return res.status(404).json({
          error:
            "Clinic not found or inactive",
        });
      }

      return res.json({
        success: true,
        branding: result[0],
      });
    }
  );
};

// =========================================================
// UPDATE BRANDING
// =========================================================

const updateBranding = (req, res) => {
  if (
    !req.user ||
    (req.user.role !== "admin" &&
      req.user.role !== "super_admin")
  ) {
    return res.status(403).json({
      error: "Access denied.",
    });
  }

  const adminId = req.user.id;

  const {
    clinic_name,
    logo_url,
    theme_color,
    clinic_address,
    clinic_phone,
    clinic_details,
    logo_width,
    logo_height,
    patient_prefix,
  } = req.body;

  db.superAdminDb.query(
    `UPDATE admins
     SET
       admin_name = ?,
       logo_url = ?,
       theme_color = ?,
       clinic_address = ?,
       clinic_phone = ?,
       clinic_details = ?,
       logo_width = ?,
       logo_height = ?,
       patient_prefix = ?
     WHERE id = ?`,
    [
      clinic_name
        ? clinic_name.trim()
        : null,

      logo_url
        ? logo_url.trim()
        : null,

      theme_color
        ? theme_color.trim()
        : null,

      clinic_address
        ? clinic_address.trim()
        : null,

      clinic_phone
        ? clinic_phone.trim()
        : null,

      clinic_details
        ? clinic_details.trim()
        : null,

      parseInt(logo_width) || 120,
      parseInt(logo_height) || 120,

      patient_prefix
        ? patient_prefix
            .trim()
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
        : "P",

      adminId,
    ],
    (err) => {
      if (err) {
        console.error(
          "[Auth Controller] updateBranding error:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      return res.json({
        success: true,
        message:
          "Branding and profile updated successfully",
      });
    }
  );
};

// =========================================================
// PUBLIC CLINICS
// =========================================================

const getPublicClinics = (req, res) => {
  db.superAdminDb.query(
    `SELECT
      id,
      email AS username,
      admin_name AS clinic_name,
      latitude,
      longitude,
      clinic_address,
      clinic_phone,
      clinic_details,
      logo_url,
      theme_color
     FROM admins
     WHERE role = 'admin'
     AND deleted_at IS NULL
     AND status = 'Active'`,
    (err, result) => {
      if (err) {
        console.error(
          "[Auth Controller] getPublicClinics error:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      return res.json({
        success: true,
        clinics: result,
      });
    }
  );
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  login,
  getAdmins,
  addAdmin,
  updateAdmin,
  toggleAdminStatus,
  getBranding,
  updateBranding,
  getPublicClinics,
};
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaTimes,
  FaSignOutAlt,
  FaMobileAlt,
  FaUser,
  FaLock,
  FaEdit,
  FaUsers,
  FaHospitalUser,
  FaUserMd,
  FaCalendarCheck,
  FaDna,
  FaStethoscope,
  FaSearch,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";

const DOCTOR_SPECIALIZATION_OPTIONS = [
  "Fever",
  "Cold & Flu",
  "Skin Disease",
  "Digestive Issues",
  "Joint Pain",
  "Allergies",
  "Anxiety & Stress",
  "Sleep Disorders",
  "Hair Loss",
  "Migraine",
  "Diabetes Support",
  "Hypertension"
];

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const role = localStorage.getItem("role") || "";
  const [selectedClinicId, setSelectedClinicId] = useState("all");

  // Guard: Redirect if not Super Admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/super-admin/login";
      return;
    }
    if (role !== "super_admin") {
      window.location.href = "/admin/dashboard";
      return;
    }

    fetchAdmins();
  }, [role]);

  // General State Datasets
  const [admins, setAdmins] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Form States (Admins)
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPatientPrefix, setAdminPatientPrefix] = useState("");
  const [adminClinicName, setAdminClinicName] = useState("");
  const [adminOwnerName, setAdminOwnerName] = useState("");
  const [adminThemeColor, setAdminThemeColor] = useState("#CA6180");
  const [adminLogoUrl, setAdminLogoUrl] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [adminDetails, setAdminDetails] = useState("");
  const [adminLogoWidth, setAdminLogoWidth] = useState(120);
  const [adminLogoHeight, setAdminLogoHeight] = useState(120);
  const [logoUploading, setLogoUploading] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);

  // Form States (Doctors)
  const [docName, setDocName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [shift, setShift] = useState("Morning");
  const [fees, setFees] = useState("");
  const [docUsername, setDocUsername] = useState("");
  const [docPassword, setDocPassword] = useState("");
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isDoctorEditModalOpen, setIsDoctorEditModalOpen] = useState(false);

  // Form States (Diseases)
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [editingDiseaseId, setEditingDiseaseId] = useState(null);
  const [editingDiseaseName, setEditingDiseaseName] = useState("");

  // Form States (Staff)
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Receptionist");
  const [staffMobile, setStaffMobile] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [isStaffEditModalOpen, setIsStaffEditModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form States (Shifts)
  const [newShiftName, setNewShiftName] = useState("Morning");
  const [newShiftTime, setNewShiftTime] = useState("10:00 AM - 01:00 PM");

  // Search & Patient Profile States
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Refresh lists on clinic scoping or active tab change
  useEffect(() => {
    fetchClinicData();
  }, [selectedClinicId]);

  const fetchAdmins = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setAdmins([]);
    }
  };

  const fetchClinicData = async () => {
    const token = localStorage.getItem("token");
    const adminParam = selectedClinicId === "all" ? "" : `?adminId=${selectedClinicId}`;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const docsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors${adminParam}`, config);
      setDoctors(Array.isArray(docsRes.data) ? docsRes.data : []);

      const bksRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings${adminParam}`, config);
      setBookings(Array.isArray(bksRes.data) ? bksRes.data : []);

      const disRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases${adminParam}`, config);
      setDiseases(Array.isArray(disRes.data) ? disRes.data : []);

      const patsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients${adminParam}`, config);
      setPatients(Array.isArray(patsRes.data) ? patsRes.data : []);

      const shiftsRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/shifts${adminParam}`, config);
      setShifts(Array.isArray(shiftsRes.data) ? shiftsRes.data : []);

      const staffRes = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff${adminParam}`, config);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
    } catch (err) {
      console.error("Error fetching operational data:", err);
    }
  };

  const getClinicName = (adminId) => {
    const clinic = admins.find(a => String(a.id) === String(adminId));
    return clinic ? clinic.username : `Clinic #${adminId}`;
  };

  // ================= ADMIN CONTROLS =================
  const handleLogoUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (isEdit) {
        setEditingAdmin(prev => ({ ...prev, logo_url: res.data.url }));
      } else {
        setAdminLogoUrl(res.data.url);
      }
      alert("Logo uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Logo upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      alert("Please fill all required fields (Username, Password)");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admins/add`, {
        username: adminUsername.trim(),
        password: adminPassword,
        patient_prefix: adminPatientPrefix,
        clinic_name: adminClinicName.trim() || adminUsername.trim(),
        owner_name: adminOwnerName.trim() || "Clinic Owner",
        theme_color: adminThemeColor || "#CA6180",
        logo_url: adminLogoUrl.trim() || null,
        clinic_phone: adminPhone.trim() || null,
        clinic_address: adminAddress.trim() || null,
        clinic_details: adminDetails.trim() || null,
        logo_width: parseInt(adminLogoWidth) || 120,
        logo_height: parseInt(adminLogoHeight) || 120
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Admin Account & Clinic Created Successfully!");
      setAdminUsername("");
      setAdminPassword("");
      setAdminPatientPrefix("");
      setAdminClinicName("");
      setAdminOwnerName("");
      setAdminThemeColor("#CA6180");
      setAdminLogoUrl("");
      setAdminPhone("");
      setAdminAddress("");
      setAdminDetails("");
      setAdminLogoWidth(120);
      setAdminLogoHeight(120);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to add admin: " + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleAdminStatus = async (id, currentStatus) => {
    const action = currentStatus === "Active" ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this Admin Account?`)) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admins/status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Admin Account ${currentStatus === "Active" ? "Deactivated" : "Activated"} Successfully`);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    }
  };

  const openEditAdminModal = (adm) => {
    setEditingAdminId(adm.id);
    setEditingAdmin({
      username: adm.username || "",
      password: "",
      clinic_name: adm.clinic_name || adm.admin_name || "",
      owner_name: adm.owner_name || "",
      patient_prefix: adm.patient_prefix || "",
      theme_color: adm.theme_color || "#CA6180",
      logo_url: adm.logo_url || "",
      clinic_address: adm.clinic_address || "",
      clinic_phone: adm.clinic_phone || "",
      clinic_details: adm.clinic_details || "",
      logo_width: adm.logo_width || 120,
      logo_height: adm.logo_height || 120
    });
    setIsAdminEditModalOpen(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin.username) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admins/update/${editingAdminId}`, {
        username: editingAdmin.username.trim(),
        password: editingAdmin.password || null,
        clinic_name: editingAdmin.clinic_name.trim(),
        owner_name: editingAdmin.owner_name.trim(),
        patient_prefix: editingAdmin.patient_prefix,
        theme_color: editingAdmin.theme_color,
        logo_url: editingAdmin.logo_url,
        clinic_address: editingAdmin.clinic_address,
        clinic_phone: editingAdmin.clinic_phone,
        clinic_details: editingAdmin.clinic_details,
        logo_width: parseInt(editingAdmin.logo_width) || 120,
        logo_height: parseInt(editingAdmin.logo_height) || 120
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Admin Account Updated Successfully");
      setIsAdminEditModalOpen(false);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to update admin: " + (err.response?.data?.error || err.message));
    }
  };

  // ================= DOCTOR CONTROLS =================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImageUrl(res.data.url);
      alert("Image uploaded successfully");
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (selectedClinicId === "all") {
      alert("Please select a specific clinic from the dropdown at the top to add records.");
      return;
    }
    if (!docName || !specialization || !mobile || selectedDiseases.length === 0 || !fees || !docUsername || !docPassword) {
      alert("Please fill all required fields, select specializations and enter login credentials");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/add`, {
        name: docName.trim().startsWith("Dr. ") ? docName.trim() : "Dr. " + docName.trim(),
        specialization,
        mobile,
        disease: selectedDiseases.join(", "),
        specializations: selectedDiseases,
        shift,
        fees: parseInt(fees),
        image: imageUrl || null,
        username: docUsername.trim(),
        password: docPassword,
        adminId: selectedClinicId
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Doctor Added Successfully");
      setDocName("");
      setSpecialization("");
      setMobile("");
      setSelectedDiseases([]);
      setImageUrl("");
      setShift("Morning");
      setFees("");
      setDocUsername("");
      setDocPassword("");
      fetchClinicData();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding doctor");
    }
  };

  const openEditDoctorModal = (doc) => {
    setEditingDoctorId(doc.id);
    setEditingDoctor(doc);
    setDocName(doc.name.replace("Dr. ", ""));
    setSpecialization(doc.specialization || "");
    setMobile(doc.mobile || "");
    setFees(doc.fees || "");
    setShift(doc.shift || "Morning");
    setImageUrl(doc.image || "");
    setDocUsername(doc.username || "");
    setDocPassword("");
    setSelectedDiseases(Array.isArray(doc.specializations) ? doc.specializations : (doc.disease || "").split(",").map(d => d.trim()).filter(Boolean));
    setIsDoctorEditModalOpen(true);
  };

  const handleUpdateDoctorSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const updatePayload = {
        name: docName.trim().startsWith("Dr. ") ? docName.trim() : "Dr. " + docName.trim(),
        mobile: mobile.trim(),
        specialization,
        disease: selectedDiseases.join(", "),
        specializations: selectedDiseases,
        shift,
        fees: parseInt(fees),
        image: imageUrl || null,
        username: docUsername.trim()
      };
      if (docPassword.trim()) {
        updatePayload.password = docPassword;
      }
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/update/${editingDoctorId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Doctor Updated Successfully");
      setIsDoctorEditModalOpen(false);
      fetchClinicData();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating doctor");
    }
  };

  const handleToggleDoctorStatus = async (id) => {
    if (!window.confirm("Are you sure you want to change this doctor's status?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Doctor status updated successfully");
      fetchClinicData();
    } catch (err) {
      alert("Error changing doctor status");
    }
  };

  // ================= DISEASE CONTROLS =================
  const handleAddDisease = async (e) => {
    e.preventDefault();
    if (!newDiseaseName) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases/add`, {
        name: newDiseaseName,
        adminId: selectedClinicId
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Disease added successfully");
      setNewDiseaseName("");
      fetchClinicData();
    } catch (err) {
      alert("Error adding disease");
    }
  };

  const handleEditDisease = async (e) => {
    e.preventDefault();
    if (!editingDiseaseName) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases/update/${editingDiseaseId}`, {
        name: editingDiseaseName
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Disease updated successfully");
      setEditingDiseaseId(null);
      setEditingDiseaseName("");
      fetchClinicData();
    } catch (err) {
      alert("Error updating disease: " + (err.response?.data?.error || err.message));
    }
  };

  const startEditDisease = (d) => {
    setEditingDiseaseId(d.id);
    setEditingDiseaseName(d.name);
  };

  const cancelEditDisease = () => {
    setEditingDiseaseId(null);
    setEditingDiseaseName("");
  };

  // ================= STAFF CONTROLS =================
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (selectedClinicId === "all") {
      alert("Please select a specific clinic from the dropdown at the top to add records.");
      return;
    }
    if (!staffName || !staffRole || !staffMobile) {
      alert("Please fill name, role, and mobile");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff/add`, {
        name: staffName.trim(),
        role: staffRole,
        mobile: staffMobile.trim(),
        username: staffUsername.trim() || null,
        password: staffPassword || null,
        adminId: selectedClinicId
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Staff Member Added Successfully");
      setStaffName("");
      setStaffRole("Receptionist");
      setStaffMobile("");
      setStaffUsername("");
      setStaffPassword("");
      fetchClinicData();
    } catch (err) {
      alert("Failed to add staff member: " + (err.response?.data?.error || err.message));
    }
  };

  const openEditStaffModal = (member) => {
    setEditingStaffId(member.id);
    setEditingStaff({
      name: member.name,
      role: member.role,
      mobile: member.mobile || "",
      username: member.username || "",
      password: ""
    });
    setIsStaffEditModalOpen(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff/update/${editingStaffId}`, {
        name: editingStaff.name.trim(),
        role: editingStaff.role,
        mobile: editingStaff.mobile.trim(),
        username: editingStaff.username.trim() || null,
        password: editingStaff.password || null
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Staff Member Updated Successfully");
      setIsStaffEditModalOpen(false);
      fetchClinicData();
    } catch (err) {
      alert("Failed to update staff member");
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Staff Member Deleted Successfully");
      fetchClinicData();
    } catch (err) {
      alert("Failed to delete staff member");
    }
  };

  // ================= SHIFTS / SCHEDULE CONTROLS =================
  const handleAddShift = async (e) => {
    e.preventDefault();
    if (selectedClinicId === "all") {
      alert("Please select a specific clinic from the dropdown at the top to add records.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/shifts/add`, {
        shift_name: newShiftName,
        shift_time: newShiftTime,
        adminId: selectedClinicId
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Shift added successfully");
      fetchClinicData();
    } catch (err) {
      alert("Error adding shift");
    }
  };

  // ================= PATIENT DETAILS LOADER =================
  const loadPatientFileDetails = async (patId) => {
    setLoadingHistory(true);
    setSelectedPatientProfile(patId);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/profile/${patId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        setSelectedPatientHistory(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Pending" ? "Approved" : currentStatus === "Approved" ? "Completed" : "Pending";
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/status/${id}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClinicData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectBooking = async (id) => {
    if (!window.confirm("Are you sure you want to reject this appointment booking?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/status/${id}`, { status: "Rejected" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClinicData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/super-admin/login";
  };

  // ================= ANALYTICS COMPUTATIONS =================
  const totalPatients = patients.length;
  const approvedBookings = bookings.filter((b) => b.status === "Approved");
  const todayStr = new Date().toISOString().split("T")[0];
  const dailyAppointments = bookings.filter((b) => {
    const bDate = new Date(b.date).toISOString().split("T")[0];
    return bDate === todayStr;
  }).length;
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);

  const filteredPatients = patients.filter((pat) => {
    const query = patientSearchQuery.toLowerCase();
    return (
      pat.name.toLowerCase().includes(query) ||
      pat.patient_id.toLowerCase().includes(query) ||
      pat.mobile.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col xl:flex-row antialiased text-[#3E4A56]">
      
      {/* SIDE NAVIGATION (Light Pastel Blue #9ED3DC Base Theme) */}
      <aside className="w-full xl:w-72 bg-[#9ED3DC] text-[#244349] flex flex-col justify-between shrink-0 p-6 shadow-md border-r border-[#86BCC5]">
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-3.5 mb-8 pb-4 border-b border-white/20">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl font-bold text-lg text-[#CA6180] shadow-xs">
              HW
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-tight text-[#163035]">Homeopathy World</h1>
              <p className="text-[10px] text-[#3D696F] font-bold uppercase tracking-wider mt-0.5">Super Cluster Registry</p>
            </div>
          </div>

          {/* CLINIC SCOPE SELECTOR */}
          <div className="mb-8 p-3.5 bg-white/40 rounded-2xl border border-white/20">
            <label className="text-[10px] font-bold text-[#3D696F] uppercase block mb-1.5 tracking-wider">Scope Context Node</label>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full bg-white border border-[#86BCC5] focus:border-[#CA6180] rounded-xl px-3 py-2 text-xs font-semibold outline-none text-[#163035] transition-all cursor-pointer shadow-xs"
            >
              <option value="all">🌐 Global (All Node Verticals)</option>
              {admins.filter(a => a.role === 'admin').map((adm) => (
                <option key={adm.id} value={adm.id} className="bg-white">🏥 {adm.username}</option>
              ))}
            </select>
          </div>

          {/* MENUS (Muted Colors Matching #9ED3DC & #CA6180) */}
          <nav className="space-y-1 font-bold text-xs">
            {[
              { id: "dashboard", label: "System Overview", icon: <FaUserMd /> },
              { id: "admins", label: "Admin Accounts", icon: <FaHospitalUser /> },
              { id: "doctors", label: "Doctor Master", icon: <FaStethoscope /> },
              { id: "schedules", label: "Schedules & Shifts", icon: <FaCalendarCheck /> },
              { id: "patients", label: "Patient Directory", icon: <FaHospitalUser /> },
              { id: "diseases", label: "Disease Master", icon: <FaDna /> },
              { id: "staff", label: "Staff Registry", icon: <FaUsers /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 border transform hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === tab.id
                    ? "bg-[#CA6180] text-white shadow-md border-transparent font-extrabold"
                    : "text-[#3D696F] border-transparent hover:bg-white/40 hover:text-[#163035]"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* LOGOUT BLOCK */}
        <div className="mt-8 space-y-2">
          <a
            href="/"
            className="w-full bg-white/60 hover:bg-white text-[#163035] font-bold py-2.5 rounded-xl text-center block text-xs border border-[#86BCC5] transition-all shadow-xs"
          >
            Leave Master Terminal
          </a>
          <button
            onClick={handleLogout}
            className="w-full bg-[#CA6180]/80 hover:bg-[#CA6180] text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <FaSignOutAlt /> Log Out Terminal
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT TERMINAL */}
      <div className="flex-grow flex flex-col min-w-0">
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          
          {/* ================= TAB 1: SYSTEM OVERVIEW ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Pastel Sky Blue Header Section Banner */}
              <div className="bg-gradient-to-r from-[#e3f4f7] to-[#d2eff3] border border-[#c1e2e7] text-[#1D444A] p-6 sm:p-8 rounded-[28px] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight relative z-10">
                  Cluster Registry Node: {selectedClinicId === "all" ? "All Global Tenants Mapped" : `Scoped Branch: ${getClinicName(selectedClinicId)}`}
                </h2>
                <p className="text-[#3D696F] text-xs sm:text-sm mt-1 max-w-xl font-bold relative z-10 leading-relaxed">
                  Monitoring operational health indices, client treatment channels, staff node logs, and multi-tenant resource variables.
                </p>
              </div>

              {/* DYNAMIC PASTEL DATA CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  { label: "Total Network Profiles", val: totalPatients, type: "Patients Mapped", pastel: "bg-[#FCB7C7]/20 border-[#FCB7C7] text-[#CA6180]" },
                  { label: "Active Operational Slots", val: dailyAppointments, type: "Slots Today", pastel: "bg-[#9ED3DC]/20 border-[#9ED3DC] text-[#244349]" },
                  { label: "Aggregated Gross Revenue", val: `₹${totalRevenue}`, type: "INR Processed", pastel: "bg-[#FEFD99]/40 border-[#EBE77D] text-[#787518]" },
                  { label: "Active Tenant Managers", val: admins.filter(a => a.role === 'admin').length, type: "Clinics", pastel: "bg-[#E2E8F0] border-[#CBD5E1] text-[#475569]" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-350 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-2xl font-black text-[#1F2937] tracking-tight">{stat.val}</span>
                      <span className={`text-[9px] font-extrabold border px-2.5 py-1 rounded-md uppercase ${stat.pastel}`}>{stat.type}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* APPOINTMENT FLUID STREAM */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-4">Incoming Patient Entry Streams</h3>
                {bookings.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium text-xs">No transaction records tracked inside this stream scope.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <th className="pb-2">Booking ID</th>
                          {selectedClinicId === "all" && <th className="pb-2">Clinic Cluster</th>}
                          <th className="pb-2">Patient Details</th>
                          <th className="pb-2">Assigned Practitioner</th>
                          <th className="pb-2">Timeline Schedule</th>
                          <th className="pb-2">Symptomatic Cause</th>
                          <th className="pb-2">State</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                        {bookings.map((bk) => (
                          <tr key={bk.id} className="hover:bg-[#F7FAFC] transition-colors">
                            <td className="py-3 text-slate-400">#{bk.booking_id}</td>
                            {selectedClinicId === "all" && (
                              <td className="py-3 text-[#CA6180]">{getClinicName(bk.admin_id)}</td>
                            )}
                            <td className="py-3">
                              <span className="block text-slate-800 font-bold">{bk.patient_name}</span>
                              <span className="block text-slate-400 text-[10px] mt-0.5">{bk.mobile}</span>
                            </td>
                            <td className="py-3 text-slate-700">{bk.doctor_name || "Unassigned"}</td>
                            <td className="py-3">
                              <span className="block font-bold">{new Date(bk.date).toLocaleDateString()}</span>
                              <span className="block text-slate-400 text-[10px] mt-0.5">{bk.appointment_time}</span>
                            </td>
                            <td className="py-3 text-slate-500 max-w-[150px] truncate">{bk.patient_diseases}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                                bk.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                bk.status === "Approved" ? "bg-[#9ED3DC]/20 text-[#244349] border border-[#9ED3DC]" :
                                bk.status === "Completed" ? "bg-primary-50 text-primary-700 border border-primary-200" :
                                "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {bk.status}
                              </span>
                            </td>
                            <td className="py-3 text-right font-normal">
                              <div className="flex justify-end gap-1.5">
                                {bk.status !== "Rejected" && bk.status !== "Completed" && (
                                  <button
                                    onClick={() => handleUpdateStatus(bk.id, bk.status)}
                                    className="bg-[#9ED3DC]/30 hover:bg-[#9ED3DC]/60 border border-[#9ED3DC] text-[#1D444A] text-[11px] font-bold py-1 px-2.5 rounded-xl transition-colors"
                                  >
                                    {bk.status === "Pending" ? "Authorize" : "Mark Done"}
                                  </button>
                                )}
                                {bk.status === "Pending" && (
                                  <button
                                    onClick={() => handleRejectBooking(bk.id)}
                                    className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 text-[11px] font-bold py-1 px-2.5 rounded-xl transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: ADMIN ACCOUNTS ================= */}
          {activeTab === "admins" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm h-fit">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-[#CA6180] text-xs" /> Create Admin Terminal
                </h3>
                <form onSubmit={handleAddAdmin} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Terminal ID Handle Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaUser className="text-xs"/></span>
                      <input
                        type="text"
                        placeholder="e.g. city_clinic"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Access Pass Crypt Token *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaLock className="text-xs"/></span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Patient ID Prefix (Optional)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaPlus className="text-xs"/></span>
                      <input
                        type="text"
                        placeholder="e.g. GHF (Auto-generated if empty)"
                        maxLength={5}
                        value={adminPatientPrefix}
                        onChange={(e) => setAdminPatientPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition"
                      />
                    </div>
                  </div>
                      {/* ─── Clinic Branding Section ─── */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Clinic Profile & Branding</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Clinic Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Sharma Homeopathy"
                          value={adminClinicName}
                          onChange={(e) => setAdminClinicName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Owner Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Sharma"
                          value={adminOwnerName}
                          onChange={(e) => setAdminOwnerName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Clinic Phone</label>
                          <input
                            type="text"
                            placeholder="+91..."
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Clinic Address</label>
                          <input
                            type="text"
                            placeholder="Address"
                            value={adminAddress}
                            onChange={(e) => setAdminAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Clinic Details (Bio/Services)</label>
                        <textarea
                          placeholder="Short description of the clinic..."
                          value={adminDetails}
                          onChange={(e) => setAdminDetails(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Brand Color</label>
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                            <input
                              type="color"
                              value={adminThemeColor}
                              onChange={(e) => setAdminThemeColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <span className="text-xs font-bold text-slate-600">{adminThemeColor}</span>
                          </div>
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 mt-4"
                          style={{ backgroundColor: adminThemeColor }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Clinic Logo</label>
                        <div className="space-y-2">
                          <input
                            type="url"
                            placeholder="Logo Image URL (Optional)"
                            value={adminLogoUrl}
                            onChange={(e) => setAdminLogoUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 rounded-xl py-2 cursor-pointer transition text-xs font-bold">
                              <span>{logoUploading ? "Uploading logo..." : "Upload Logo Image"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e, false)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {adminLogoUrl && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Logo Resizing Constraints</p>
                          <div className="space-y-2 mb-3">
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                                <span>Logo Width:</span>
                                <span className="font-bold text-[#CA6180]">{adminLogoWidth}px</span>
                              </div>
                              <input
                                type="range"
                                min="40"
                                max="300"
                                value={adminLogoWidth}
                                onChange={(e) => setAdminLogoWidth(parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#CA6180]"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                                <span>Logo Height:</span>
                                <span className="font-bold text-[#CA6180]">{adminLogoHeight}px</span>
                              </div>
                              <input
                                type="range"
                                min="40"
                                max="300"
                                value={adminLogoHeight}
                                onChange={(e) => setAdminLogoHeight(parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#CA6180]"
                              />
                            </div>
                          </div>
                          
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Live Preview</p>
                          <div className="w-full flex items-center justify-center p-4 bg-white border border-slate-150 rounded-xl min-h-[140px]">
                            <img
                              src={adminLogoUrl}
                              alt="Logo Preview"
                              className="object-contain border border-dashed border-slate-200 rounded-lg shadow-sm"
                              style={{ width: `${adminLogoWidth}px`, height: `${adminLogoHeight}px` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus className="text-[10px]" /> Create Clinic Node
                  </button>
                </form>
              </div>

              <div className="xl:col-span-2 bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Online Clinic Verticals</h3>
                {admins.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 text-xs">No registries operational.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Login Handle</th>
                          <th className="pb-2">Clinic Name</th>
                          <th className="pb-2">Prefix</th>
                          <th className="pb-2">Role</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {admins.map((adm, index) => (
                          <tr key={adm.id} className="hover:bg-[#F7FAFC] transition-colors">
                            <td className="py-2.5 text-slate-400">#N-{index + 1}</td>
                            <td className="py-2.5 text-slate-800 font-bold">{adm.username}</td>
                            <td className="py-2.5">
                              <div className="flex items-start gap-1 flex-col">
                                <div className="flex items-center gap-1.5">
                                  {adm.theme_color && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white shadow-sm"
                                      style={{ backgroundColor: adm.theme_color }}
                                    />
                                  )}
                                  <span className="text-slate-800 font-bold">{adm.clinic_name || <span className="text-slate-300 italic">Not set</span>}</span>
                                </div>
                                {(adm.clinic_address || adm.clinic_phone) && (
                                  <div className="text-[10px] text-slate-400 font-medium pl-4 mt-0.5 space-y-0.5">
                                    {adm.clinic_phone && <p className="flex items-center gap-1"><span>📞</span> {adm.clinic_phone}</p>}
                                    {adm.clinic_address && <p className="flex items-center gap-1"><span>📍</span> {adm.clinic_address}</p>}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 text-primary-800 font-bold">{adm.patient_prefix || "N/A"}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                                adm.role === "super_admin" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-[#9ED3DC]/10 text-[#244349] border-[#9ED3DC]/40"
                              }`}>
                                {adm.role === "super_admin" ? "Root Owner" : "Clinic Node"}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                                adm.status === "Inactive" ? "bg-red-50 text-red-700 border-red-100" : "bg-primary-50 text-primary-700 border-primary-100"
                              }`}>
                                {adm.status || "Active"}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-normal">
                              <div className="flex justify-end gap-1 text-sm">
                                <button
                                  onClick={() => openEditAdminModal(adm)}
                                  className="text-[#CA6180] hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <FaEdit />
                                </button>
                                {adm.id !== parseInt(localStorage.getItem("adminId")) ? (
                                  <button
                                    onClick={() => handleToggleAdminStatus(adm.id, adm.status || "Active")}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      adm.status === "Inactive"
                                        ? "text-primary-500 hover:text-primary-700 hover:bg-primary-50"
                                        : "text-red-400 hover:text-red-600 hover:bg-red-50"
                                    }`}
                                    title={adm.status === "Inactive" ? "Activate Clinic" : "Deactivate Clinic"}
                                  >
                                    {adm.status === "Inactive" ? <FaToggleOff className="text-lg" /> : <FaToggleOn className="text-lg" />}
                                  </button>
                                ) : (
                                  <span className="text-slate-300 p-1.5 italic text-[10px] font-bold">Active Module</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: DOCTOR MASTER ================= */}
          {activeTab === "doctors" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm h-fit">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-[#CA6180] text-xs" /> Map Practitioner File
                </h3>

                {selectedClinicId === "all" ? (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-4 rounded-xl font-bold border border-amber-100 leading-relaxed">
                    ⚠️ Select a distinct active branch node via the sidebar routing selector to onboard physician data blocks.
                  </p>
                ) : (
                  <form onSubmit={handleAddDoctor} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Doctor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sumitra"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Core Department Tracker</label>
                      <input
                        type="text"
                        placeholder="e.g. Hair Specialist"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Mobile Reference Line</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>

                    <div className="p-3 bg-[#FAFDFB] border border-[#CBD6E2] rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-[#CA6180] block uppercase tracking-wide">Verification Portals Access</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="User Key"
                          value={docUsername}
                          onChange={(e) => setDocUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-[#9ED3DC] rounded-lg text-[10px] outline-none transition"
                        />
                        <input
                          type="password"
                          placeholder="Secure Crypt"
                          value={docPassword}
                          onChange={(e) => setDocPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-[#9ED3DC] rounded-lg text-[10px] outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Symptom Specialties Map</label>
                      {diseases.length === 0 ? (
                        <p className="text-[11px] text-amber-600 font-bold py-1">No configured specialties recorded.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 border border-slate-200 bg-slate-50/50 p-2 rounded-xl max-h-24 overflow-y-auto">
                          {diseases.map((d) => {
                            const isChecked = selectedDiseases.includes(d.name);
                            return (
                              <label key={d.id} className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 cursor-pointer hover:text-slate-800">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedDiseases(selectedDiseases.filter((name) => name !== d.name));
                                    } else {
                                      setSelectedDiseases([...selectedDiseases, d.name]);
                                    }
                                  }}
                                  className="rounded text-[#CA6180] focus:ring-[#CA6180] h-3 w-3"
                                />
                                {d.name}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Photo Identity File</label>
                      <div className="relative border border-dashed border-slate-300 bg-slate-50 p-2 rounded-xl flex flex-col items-center justify-center hover:bg-slate-100/50 transition cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold">{uploading ? "Mounting File..." : "Select Profile Photo File"}</span>
                        {imageUrl && <span className="text-[9px] text-[#CA6180] font-bold mt-0.5">Asset Verified ✓</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Shift Track</label>
                        <select
                          value={shift}
                          onChange={(e) => setShift(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs font-semibold cursor-pointer outline-none"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="Full Day">Full Day</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Fees (INR) *</label>
                        <input
                          type="number"
                          placeholder="INR"
                          value={fees}
                          onChange={(e) => setFees(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm mt-1"
                    >
                      Commit Profile Mappings
                    </button>
                  </form>
                )}
              </div>

              <div className="xl:col-span-2 bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Medical Specialist Active Directories</h3>
                {doctors.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 text-xs">No active nodes framed inside cluster nodes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                          <th className="pb-2">Physician Identity</th>
                          {selectedClinicId === "all" && <th className="pb-2">Clinic branch</th>}
                          <th className="pb-2">Department Node</th>
                          <th className="pb-2">Fees Rate</th>
                          <th className="pb-2">Symptom Track Map</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {doctors.map((doc) => (
                          <tr key={doc.id} className="hover:bg-[#FAFDFB] transition-colors">
                            <td className="py-2 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#9ED3DC]/20 text-[#244349] flex-shrink-0 flex items-center justify-center font-bold text-[10px] border border-[#9ED3DC]/40">
                                {doc.image ? (
                                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                ) : (
                                  doc.name.replace("Dr. ", "").substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className="block text-slate-800 font-bold">{doc.name}</span>
                                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{doc.mobile}</span>
                              </div>
                            </td>
                            {selectedClinicId === "all" && (
                              <td className="py-2 text-[#CA6180] font-bold">{getClinicName(doc.admin_id)}</td>
                            )}
                            <td className="py-2 text-slate-700">{doc.specialization}</td>
                            <td className="py-2 text-slate-800 font-bold">₹{doc.fees}</td>
                            <td className="py-2 text-slate-400 max-w-[140px] truncate">{doc.disease}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                doc.status === "Inactive"
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-primary-50 text-primary-600 border border-primary-100"
                              }`}>
                                {doc.status === "Inactive" ? "Deactivated" : "Active"}
                              </span>
                            </td>
                            <td className="py-2 text-right text-sm font-normal">
                              <div className="flex justify-end gap-0.5">
                                <button
                                  onClick={() => openEditDoctorModal(doc)}
                                  className="text-[#CA6180] hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleToggleDoctorStatus(doc.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    doc.status === "Inactive"
                                      ? "text-red-400 hover:bg-red-50"
                                      : "text-primary-500 hover:bg-primary-50"
                                  }`}
                                  title={doc.status === "Inactive" ? "Activate Doctor" : "Deactivate Doctor"}
                                >
                                  {doc.status === "Inactive" ? <FaToggleOff /> : <FaToggleOn />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: SCHEDULES ================= */}
          {activeTab === "schedules" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm h-fit">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-[#CA6180] text-xs" /> Build Shift Framework
                </h3>
                {selectedClinicId === "all" ? (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-3.5 rounded-xl font-bold border border-amber-100 leading-relaxed">
                    ⚠️ Select an explicit workspace target inside context workspace scopes prior to timeline modification routing.
                  </p>
                ) : (
                  <form onSubmit={handleAddShift} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Shift Name Custom *</label>
                      <input
                        type="text"
                        required
                        value={newShiftName}
                        onChange={(e) => setNewShiftName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition"
                        placeholder="Morning / Evening Shift"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Timeline Parameter Window *</label>
                      <input
                        type="text"
                        required
                        value={newShiftTime}
                        onChange={(e) => setNewShiftTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition"
                        placeholder="e.g. 10:00 AM - 01:00 PM"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
                    >
                      Save Timetable Matrix
                    </button>
                  </form>
                )}
              </div>

              <div className="xl:col-span-2 bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Clinic Framework Timelines Shifts</h3>
                {shifts.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 text-xs">No active segments running inside this parameter window.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {shifts.map((sh) => (
                      <div key={sh.id} className="border border-[#FCB7C7] p-4 rounded-xl bg-[#FCB7C7]/10 hover:bg-[#FCB7C7]/20 transition-all shadow-xs">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 text-xs tracking-tight">{sh.shift_name}</h4>
                          <span className="text-[8px] bg-white text-[#CA6180] border border-[#FCB7C7] px-2 py-0.5 rounded font-bold uppercase shadow-xs tracking-wider">
                            {getClinicName(sh.admin_id)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-extrabold mt-1">{sh.shift_time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 5: PATIENTS ================= */}
          {activeTab === "patients" && (
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Unified Patient Intake Dossiers Directory</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">High-fidelity core portal interfaces pipeline for browsing case vector profiles logs summaries.</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaSearch className="text-xs"/></span>
                  <input
                    type="text"
                    placeholder="Search queries parameters by ID Token, Handle..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none transition"
                  />
                </div>
              </div>

              {filteredPatients.length === 0 ? (
                <p className="text-slate-400 text-center py-10 text-xs">No dossier files map successfully within requested bounds.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                        <th className="pb-2">Secure Dossier ID</th>
                        {selectedClinicId === "all" && <th className="pb-2">Clinic Node</th>}
                        <th className="pb-2">Subject Full Name</th>
                        <th className="pb-2">Contact Vector Link</th>
                        <th className="pb-2 text-center">Age / Gender Profile</th>
                        <th className="pb-2 text-center">Encounter Index</th>
                        <th className="pb-2 text-right">Archival Files Matrix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {filteredPatients.map((pat) => (
                        <tr key={pat.id} className="hover:bg-[#FAFDFB] transition-colors">
                          <td className="py-3 text-[#CA6180] font-black">#{pat.patient_id}</td>
                          {selectedClinicId === "all" && (
                            <td className="py-3 text-slate-700">{getClinicName(pat.admin_id)}</td>
                          )}
                          <td className="py-3 text-slate-800 font-bold text-xs">{pat.name}</td>
                          <td className="py-3 text-slate-400 font-medium">{pat.mobile}</td>
                          <td className="py-3 text-center text-slate-600">{pat.age || "N/A"} Yrs / {pat.gender || "N/A"}</td>
                          <td className="py-3 text-center">
                            <span className="bg-[#9ED3DC]/20 text-[#244349] px-2 py-0.5 rounded text-[10px] font-bold border border-[#9ED3DC]/40 shadow-xs">
                              {pat.total_appointments || 0} visits
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => loadPatientFileDetails(pat.patient_id)}
                              className="bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold px-3 py-1 rounded-xl transition text-[11px]"
                            >
                              Browse dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: DISEASES ================= */}
          {activeTab === "diseases" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm h-fit">
                {editingDiseaseId ? (
                  <>
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaEdit className="text-[#CA6180]" /> Edit pathology track
                    </h3>
                    <form onSubmit={handleEditDisease} className="space-y-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Pathology Specialty Label *</label>
                        <input
                          type="text"
                          required
                          value={editingDiseaseName}
                          onChange={(e) => setEditingDiseaseName(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                          placeholder="e.g. Chronic Dermatitis"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
                        >
                          Update Track
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditDisease}
                          className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaPlus className="text-[#CA6180]" /> Add pathological core
                    </h3>
                    <form onSubmit={handleAddDisease} className="space-y-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Pathology Specialty Label *</label>
                        <input
                          type="text"
                          required
                          value={newDiseaseName}
                          onChange={(e) => setNewDiseaseName(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                          placeholder="e.g. Chronic Dermatitis"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
                      >
                        Save Pathology Track
                      </button>
                    </form>
                  </>
                )}
              </div>

              <div className="xl:col-span-2 bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Pathological Disease Framework Arrays</h3>
                {diseases.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 text-xs">No disease indexes recorded.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {diseases.map((d) => (
                      <div key={d.id} className="flex justify-between items-center border border-[#9ED3DC] p-3 rounded-xl bg-[#9ED3DC]/10 shadow-xs transition font-semibold text-xs text-slate-700">
                        <div className="min-w-0 flex-1 pr-1">
                          <span className="block text-slate-800 font-bold truncate">{d.name}</span>
                        </div>
                        <button
                          onClick={() => startEditDisease(d)}
                          className="text-[#CA6180] hover:text-[#B54A6B] p-1.5 rounded-lg transition-colors shrink-0"
                          title="Edit Disease"
                        >
                          <FaEdit className="text-xs"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 7: STAFF REGISTRY ================= */}
          {activeTab === "staff" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm h-fit">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-[#CA6180]" /> Enlist Staff Node Unit
                </h3>
                {selectedClinicId === "all" ? (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-4 rounded-xl font-bold border border-amber-100 leading-relaxed">
                    ⚠️ Frame an active cluster terminal location profile prior to managing staff mapping components.
                  </p>
                ) : (
                  <form onSubmit={handleAddStaff} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Personnel Legal Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        required
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Role Domain Placement *</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Receptionist">Receptionist</option>
                        <option value="Peon">Peon</option>
                        <option value="Employee">Employee (General)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-0.5">Communication Mobile Vector *</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        required
                        value={staffMobile}
                        onChange={(e) => setStaffMobile(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <p className="text-[10px] font-bold text-[#CA6180] mb-1.5 uppercase tracking-wide">Workspace System Auth Keys</p>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Username Crypt Handle"
                          value={staffUsername}
                          onChange={(e) => setStaffUsername(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs outline-none transition font-semibold"
                        />
                        <input
                          type="password"
                          placeholder="Password secure Token link"
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs outline-none transition font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm mt-1"
                    >
                      Enroll Staff Node File
                    </button>
                  </form>
                )}
              </div>

              <div className="xl:col-span-2 bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Personnel Registry Folders</h3>
                {staff.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 text-xs">No human resource profiles compiled inside scope window.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                          <th className="pb-2">Name Identity</th>
                          {selectedClinicId === "all" && <th className="pb-2">Clinic Location Node</th>}
                          <th className="pb-2">Role Sector</th>
                          <th className="pb-2">Phone Link Reference</th>
                          <th className="pb-2">System Auth Handle</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {staff.map((member) => (
                          <tr key={member.id} className="hover:bg-[#FAFDFB] transition-colors">
                            <td className="py-2.5 text-slate-800 font-bold">{member.name}</td>
                            {selectedClinicId === "all" && (
                              <td className="py-2.5 text-[#CA6180] font-bold">{getClinicName(member.admin_id)}</td>
                            )}
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                member.role === "Receptionist" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                member.role === "Peon" ? "bg-orange-50 text-orange-700 border-orange-100" :
                                "bg-blue-50 text-blue-700 border-blue-100"
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-500 font-medium">{member.mobile}</td>
                            <td className="py-2.5 text-slate-400 text-[11px] font-medium">{member.username || <span className="text-slate-300 italic font-normal">No Auth Crypt</span>}</td>
                            <td className="py-2.5 text-right text-sm font-normal">
                              <div className="flex justify-end gap-0.5">
                                <button
                                  onClick={() => openEditStaffModal(member)}
                                  className="text-[#CA6180] hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(member.id)}
                                  className="text-red-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODALS LAYER (Soft Pastel Matching Window Layer) ================= */}

      {/* EDIT ADMIN NODE ACCESS */}
      {isAdminEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl relative border border-[#CBD6E2]">
            <button
              onClick={() => {
                setIsAdminEditModalOpen(false);
                setEditingAdminId(null);
                setEditingAdmin(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-full transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaEdit className="text-[#CA6180]" /> Modify Node Matrix Core & Clinic Details
            </h3>
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Administrative Username Node *</label>
                  <input
                    type="text"
                    required
                    value={editingAdmin.username}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Overwrite Crypt Secure Key</label>
                  <input
                    type="password"
                    placeholder="Leave clear to protect legacy setup"
                    value={editingAdmin.password || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Clinic Display Name *</label>
                  <input
                    type="text"
                    required
                    value={editingAdmin.clinic_name || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, clinic_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editingAdmin.owner_name || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, owner_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Patient ID Prefix</label>
                  <input
                    type="text"
                    value={editingAdmin.patient_prefix || ""}
                    maxLength={5}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, patient_prefix: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Clinic Phone</label>
                  <input
                    type="text"
                    value={editingAdmin.clinic_phone || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, clinic_phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Clinic Address</label>
                <input
                  type="text"
                  value={editingAdmin.clinic_address || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, clinic_address: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Clinic Details (Bio/Services)</label>
                <textarea
                  value={editingAdmin.clinic_details || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, clinic_details: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Brand Color</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <input
                      type="color"
                      value={editingAdmin.theme_color || "#CA6180"}
                      onChange={(e) => setEditingAdmin({ ...editingAdmin, theme_color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-bold text-slate-650">{editingAdmin.theme_color}</span>
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 mt-4"
                  style={{ backgroundColor: editingAdmin.theme_color || "#CA6180" }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Clinic Logo</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Logo Image URL"
                    value={editingAdmin.logo_url || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, logo_url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 rounded-xl py-2 cursor-pointer transition text-xs font-bold">
                      <span>{logoUploading ? "Uploading logo..." : "Upload Logo Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {editingAdmin.logo_url && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Logo Resizing Constraints</p>
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                        <span>Logo Width:</span>
                        <span className="font-bold text-[#CA6180]">{editingAdmin.logo_width || 120}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="300"
                        value={editingAdmin.logo_width || 120}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, logo_width: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#CA6180]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                        <span>Logo Height:</span>
                        <span className="font-bold text-[#CA6180]">{editingAdmin.logo_height || 120}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="300"
                        value={editingAdmin.logo_height || 120}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, logo_height: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#CA6180]"
                      />
                    </div>
                  </div>
                  
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Live Preview</p>
                  <div className="w-full flex items-center justify-center p-4 bg-white border border-slate-150 rounded-xl min-h-[140px]">
                    <img
                      src={editingAdmin.logo_url}
                      alt="Logo Preview"
                      className="object-contain border border-dashed border-slate-200 rounded-lg shadow-sm"
                      style={{ width: `${editingAdmin.logo_width || 120}px`, height: `${editingAdmin.logo_height || 120}px` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm mt-2"
              >
                Save Structural Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCTOR RECORD MODAL */}
      {isDoctorEditModalOpen && editingDoctor && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl relative border border-[#CBD6E2]">
            <button
              onClick={() => {
                setIsDoctorEditModalOpen(false);
                setEditingDoctorId(null);
                setEditingDoctor(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-full transition"
            >
              <FaTimes className="text-sm" />
            </button>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaEdit className="text-[#CA6180]" /> Modify Practitioner Directory Profile
            </h3>
            <form onSubmit={handleUpdateDoctorSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Doctor Full Label Name *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Department Specialty</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Mobile Vector Line *</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Consult Rate Fee *</label>
                  <input
                    type="number"
                    required
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Shift Window</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Verification Portal User Key *</label>
                <input
                  type="text"
                  required
                  value={docUsername}
                  onChange={(e) => setDocUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Rewrite Secure Pass Key</label>
                <input
                  type="password"
                  placeholder="Leave clear to protect running keys"
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm mt-2"
              >
                Save Modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF REGISTRY MODAL */}
      {isStaffEditModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg relative border border-[#CBD6E2]">
            <button
              onClick={() => {
                setIsStaffEditModalOpen(false);
                setEditingStaffId(null);
                setEditingStaff(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-full transition"
            >
              <FaTimes className="text-sm" />
            </button>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaEdit className="text-[#CA6180]" /> Modify Personnel File
            </h3>
            <form onSubmit={handleUpdateStaff} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Full Name Identity *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Role Domain Placement *</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Receptionist">Receptionist</option>
                  <option value="Peon">Peon</option>
                  <option value="Employee">Employee (General)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Mobile Contact Vector *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.mobile}
                  onChange={(e) => setEditingStaff({ ...editingStaff, mobile: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                />
              </div>
              <div className="border-t border-slate-100 pt-2">
                <p className="text-[9px] font-bold text-[#CA6180] mb-1.5 uppercase tracking-wide">Login System Settings</p>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={editingStaff.username}
                    onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                    placeholder="Username Key"
                  />
                  <input
                    type="password"
                    value={editingStaff.password}
                    onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#9ED3DC] focus:bg-white rounded-xl text-xs font-semibold outline-none"
                    placeholder="New Secure Password (or blank)"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-2 rounded-xl text-xs transition shadow-sm mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PATIENT ARCHIVAL FILE DISCOVERY MODAL */}
      {selectedPatientProfile && selectedPatientHistory && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl relative border border-[#D9E2EC]">
            <button
              onClick={() => {
                setSelectedPatientProfile(null);
                setSelectedPatientHistory(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-full transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>

            {loadingHistory ? (
              <p className="text-center py-16 font-bold text-slate-400 text-xs tracking-widest">Compiling Encrypted File System Logs Matrix...</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Clinical Case Summary</h3>
                  <p className="text-slate-400 text-[11px] font-bold mt-0.5">Secure Node Tracking ID: <span className="text-[#CA6180]">#{selectedPatientHistory.profile?.patient_id}</span></p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#9ED3DC]/10 rounded-xl border border-[#9ED3DC]/40 font-bold text-xs text-slate-600 shadow-inner">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5 uppercase tracking-wider">Patient Full Name</span>
                    <span className="text-slate-800 font-bold text-sm">{selectedPatientHistory.profile?.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5 uppercase tracking-wider">Phone Link</span>
                    <span className="text-slate-700 font-bold">{selectedPatientHistory.profile?.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5 uppercase tracking-wider">Age / Gender Profile</span>
                    <span className="text-slate-800 font-bold">{selectedPatientHistory.profile?.age || "N/A"} Yrs / {selectedPatientHistory.profile?.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5 uppercase tracking-wider">Host Node Domain</span>
                    <span className="text-[#CA6180] font-bold">{getClinicName(selectedPatientHistory.profile?.admin_id)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
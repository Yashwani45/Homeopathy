import React, { useState, useEffect } from "react";
import { useBranding } from "../../context/BrandingContext";
import axios from "axios";
import {
  FaUserMd,
  FaCalendarCheck,
  FaHeartbeat,
  FaPlus,
  FaTrash,
  FaTimes,
  FaSignOutAlt,
  FaMobileAlt,
  FaUser,
  FaStethoscope,
  FaRupeeSign,
  FaFileImage,
  FaSearch,
  FaClipboardList,
  FaHospitalUser,
  FaLock,
  FaDna,
  FaRegFolderOpen,
  FaBookMedical,
  FaFolderOpen,
  FaEdit,
  FaUsers,
  FaToggleOn,
  FaToggleOff,
  FaPrescriptionBottle
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

const formatMedicinesForDisplay = (medsJson) => {
  if (!medsJson) return "None";
  try {
    const parsed = JSON.parse(medsJson);
    if (Array.isArray(parsed)) {
      return (
        <ul className="list-disc pl-5 space-y-1 mt-1">
          {parsed.map((m, idx) => {
            const parts = [];
            if (m.dosage) parts.push(m.dosage);
            if (m.duration) parts.push(m.duration);
            if (m.instructions) parts.push(m.instructions);
            const detail = parts.length > 0 ? ` (${parts.join(", ")})` : "";
            return (
              <li key={idx} className="text-slate-800 font-extrabold list-item">
                {m.name}{detail}
              </li>
            );
          })}
        </ul>
      );
    }
  } catch (e) {}
  return medsJson;
};

const Dashboard = () => {
  const adminId = localStorage.getItem("adminId") || "1";

  const { branding, fetchBranding, applyTheme } = useBranding();
  const role = localStorage.getItem("role") || "admin";

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("role") === "staff" ? "bookings" : "dashboard";
  });

  // Booking Form states (for staff)
  const [bkType, setBkType] = useState("new"); // "new" or "re"
  const [bkPatientId, setBkPatientId] = useState("");
  const [bkPatientName, setBkPatientName] = useState("");
  const [bkMobile, setBkMobile] = useState("");
  const [bkDate, setBkDate] = useState("");
  const [bkSelectedService, setBkSelectedService] = useState("");
  const [bkSelectedDoctorId, setBkSelectedDoctorId] = useState("");
  const [bkTimeSlot, setBkTimeSlot] = useState("");
  const [bkFile, setBkFile] = useState(null);
  const [bkMessage, setBkMessage] = useState("");
  const [bkAvailableSlots, setBkAvailableSlots] = useState([]);
  const [clinicNameInput, setClinicNameInput] = useState("");
  const [themeColorInput, setThemeColorInput] = useState("#CA6180");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [logoWidthInput, setLogoWidthInput] = useState(120);
  const [logoHeightInput, setLogoHeightInput] = useState(120);
  const [clinicAddressInput, setClinicAddressInput] = useState("");
  const [clinicPhoneInput, setClinicPhoneInput] = useState("");
  const [clinicDetailsInput, setClinicDetailsInput] = useState("");
  const [patientPrefixInput, setPatientPrefixInput] = useState("P");
  const [logoUploading, setLogoUploading] = useState(false);
  const [selectedReportDoctorId, setSelectedReportDoctorId] = useState("all");
  const [brandingSaving, setBrandingSaving] = useState(false);

  useEffect(() => {
    if (adminId) {
      fetchBranding(adminId);
    }
  }, [adminId]);

  useEffect(() => {
    if (branding) {
      setClinicNameInput(branding.clinic_name || "");
      setThemeColorInput(branding.theme_color || "#CA6180");
      setLogoUrlInput(branding.logo_url || "");
      setLogoWidthInput(branding.logo_width || 120);
      setLogoHeightInput(branding.logo_height || 120);
      setClinicAddressInput(branding.clinic_address || "");
      setClinicPhoneInput(branding.clinic_phone || "");
      setClinicDetailsInput(branding.clinic_details || "");
      setPatientPrefixInput(branding.patient_prefix || "P");
    }
  }, [branding]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setLogoUrlInput(res.data.url);
      alert("Logo uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Logo upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBrandingSave = async (e) => {
    e.preventDefault();
    setBrandingSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/branding`;
      const res = await axios.put(url, {
        clinic_name: clinicNameInput,
        theme_color: themeColorInput,
        logo_url: logoUrlInput,
        logo_width: parseInt(logoWidthInput) || 120,
        logo_height: parseInt(logoHeightInput) || 120,
        clinic_address: clinicAddressInput,
        clinic_phone: clinicPhoneInput,
        clinic_details: clinicDetailsInput,
        patient_prefix: patientPrefixInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        applyTheme(
          themeColorInput, 
          clinicNameInput, 
          logoUrlInput,
          parseInt(logoWidthInput) || 120,
          parseInt(logoHeightInput) || 120,
          clinicAddressInput,
          clinicPhoneInput,
          clinicDetailsInput
        );
        alert("✅ Clinic profile & branding updated successfully!");
      }
    } catch (err) {
      console.error("Error saving branding settings: ", err);
      alert(err.response?.data?.error || "Failed to update branding settings");
    } finally {
      setBrandingSaving(false);
    }
  };

  const [doctors, setDoctors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [patients, setPatients] = useState([]);

  // Add Doctor Form States
  const [docName, setDocName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [shift, setShift] = useState("Morning");
  const [morningStartTime, setMorningStartTime] = useState("10:00 AM");
  const [morningEndTime, setMorningEndTime] = useState("01:00 PM");
  const [eveningStartTime, setEveningStartTime] = useState("05:00 PM");
  const [eveningEndTime, setEveningEndTime] = useState("08:00 PM");
  const [hasMorningShift, setHasMorningShift] = useState(true);
  const [hasEveningShift, setHasEveningShift] = useState(false);
  const [fees, setFees] = useState("");
  const [docUsername, setDocUsername] = useState("");
  const [docPassword, setDocPassword] = useState("");

  // Add Disease Form States
  const [newDiseaseName, setNewDiseaseName] = useState("");

  // Add Medicine Form States
  const [medicines, setMedicines] = useState([]);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineGenericName, setNewMedicineGenericName] = useState("");
  const [newMedicineDescription, setNewMedicineDescription] = useState("");

  // Leaves States
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveDoctorId, setLeaveDoctorId] = useState("");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [isLeaveEditModalOpen, setIsLeaveEditModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  // Patient Directory Tab States
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit Doctor Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Staff Master Tab States
  const [staff, setStaff] = useState([]);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Receptionist");
  const [staffMobile, setStaffMobile] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [isStaffEditModalOpen, setIsStaffEditModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    // Check auth token
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
    if (role === "super_admin") {
      window.location.href = "/super-admin/dashboard";
      return;
    }
    fetchDoctors();
    fetchBookings();
    fetchDiseases();
    fetchPatients();
    fetchStaff();
    fetchMedicines();
    fetchLeaves();
  }, []);

  // Clear patient details when switching booking type
  useEffect(() => {
    setBkPatientId("");
    setBkPatientName("");
    setBkMobile("");
  }, [bkType]);

  // Auto-fetch patient details for reappointment
  useEffect(() => {
    if (bkType === "re" && bkPatientId.trim().length >= 6) {
      const fetchPatientProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          const activeAdminId = localStorage.getItem("adminId") || "1";
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/public-profile/${bkPatientId.trim()}?adminId=${activeAdminId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data && res.data.success && res.data.profile) {
            const profile = res.data.profile;
            setBkPatientName(profile.name || "");
            setBkMobile(profile.mobile || "");
          }
        } catch (err) {
          console.error("Error fetching patient profile:", err);
          setBkPatientName("");
          setBkMobile("");
        }
      };
      fetchPatientProfile();
    } else if (bkType === "re") {
      setBkPatientName("");
      setBkMobile("");
    }
  }, [bkPatientId, bkType]);

  useEffect(() => {
    if (bkSelectedDoctorId && bkDate) {
      const fetchSlots = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/slots?doctorId=${bkSelectedDoctorId}&date=${bkDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setBkAvailableSlots(res.data || []);
          if (res.data && res.data.length > 0) {
            setBkTimeSlot(res.data[0]);
          } else {
            setBkTimeSlot("");
          }
        } catch (err) {
          console.error("Error loading slots:", err);
          setBkAvailableSlots([]);
          setBkTimeSlot("");
        }
      };
      fetchSlots();
    } else {
      setBkAvailableSlots([]);
      setBkTimeSlot("");
    }
  }, [bkSelectedDoctorId, bkDate]);

  const handleBkSubmit = async (e) => {
    e.preventDefault();
    if (bkType === "re" && !bkPatientId) {
      alert("Please enter a Patient ID for reappointment.");
      return;
    }
    if (!bkPatientName || !bkMobile || !bkDate || !bkSelectedDoctorId) {
      alert("Please fill in all required fields (Name, Mobile, Date, and Doctor)");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(bkMobile)) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      let uploadedFileUrl = "";
      if (bkFile) {
        const formData = new FormData();
        formData.append("image", bkFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (uploadRes.data && uploadRes.data.url) {
          uploadedFileUrl = uploadRes.data.url;
        }
      }

      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments`,
        {
          patient_id: bkType === "re" ? bkPatientId : null,
          patient_name: bkPatientName,
          mobile: bkMobile,
          doctor_id: parseInt(bkSelectedDoctorId),
          date: bkDate,
          appointment_time: bkTimeSlot,
          patient_diseases: bkSelectedService || "General Consultation",
          admin_id: parseInt(adminId)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Appointment booked successfully!");
      // Reset form
      setBkType("new");
      setBkPatientId("");
      setBkPatientName("");
      setBkMobile("");
      setBkDate("");
      setBkSelectedService("");
      setBkSelectedDoctorId("");
      setBkTimeSlot("");
      setBkFile(null);
      setBkMessage("");
      // Refresh bookings
      fetchBookings();
      setActiveTab("bookings");
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment: " + (err.response?.data?.error || err.message));
    }
  };

  const fetchDoctors = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors?adminId=${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setDoctors([]);
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings?adminId=${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    }
  };

  const handleUpdateBookingStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Pending" ? "Approved" : "Completed";
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/status/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Booking status updated to ${nextStatus}`);
      fetchBookings();
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  const handleRejectBooking = async (id) => {
    if (!window.confirm("Are you sure you want to reject this booking?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/status/${id}`,
        { status: "Rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Booking rejected");
      fetchBookings();
    } catch (err) {
      console.error("Error rejecting booking:", err);
    }
  };

  const fetchDiseases = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases?adminId=${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiseases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching diseases:", err);
      setDiseases([]);
    }
  };

  const fetchMedicines = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/medicines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setMedicines([]);
    }
  };

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");
    setLoadingLeaves(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel/delete this leave?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves/${leaveId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Leave cancelled successfully!");
      fetchLeaves();
    } catch (err) {
      console.error("Error cancelling leave:", err);
      alert(err.response?.data?.error || "Failed to cancel leave");
    }
  };

  const handleAddLeaveAdmin = async (e) => {
    e.preventDefault();
    if (!leaveDoctorId || !leaveStartDate || !leaveEndDate) {
      alert("Please select a doctor, and choose both Start and End dates.");
      return;
    }
    setSubmittingLeave(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves`,
        {
          doctorId: leaveDoctorId,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Leave recorded successfully!");
      setLeaveDoctorId("");
      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveReason("");
      fetchLeaves();
    } catch (err) {
      console.error("Error adding leave:", err);
      alert(err.response?.data?.error || "Failed to record leave");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleUpdateLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!editingLeave.start_date || !editingLeave.end_date) {
      alert("Start Date and End Date are required.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      // Format dates to YYYY-MM-DD
      const fmtStart = String(editingLeave.start_date).split("T")[0];
      const fmtEnd = String(editingLeave.end_date).split("T")[0];
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves/${editingLeave.id}`,
        {
          startDate: fmtStart,
          endDate: fmtEnd,
          reason: editingLeave.reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Leave updated successfully!");
      setIsLeaveEditModalOpen(false);
      setEditingLeave(null);
      fetchLeaves();
    } catch (err) {
      console.error("Error updating leave:", err);
      alert(err.response?.data?.error || "Failed to update leave");
    }
  };

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients?adminId=${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatients([]);
    }
  };

  const fetchStaff = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaff([]);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffRole || !staffMobile) {
      alert("Please fill all required fields (Name, Role, Mobile)");
      return;
    }

    if ((staffUsername && !staffPassword) || (!staffUsername && staffPassword)) {
      alert("If you set login credentials, please provide both Username and Password.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff/add`, {
        name: staffName.trim(),
        role: staffRole,
        mobile: staffMobile.trim(),
        username: staffUsername.trim() || null,
        password: staffPassword || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Staff Member Added Successfully");
      setStaffName("");
      setStaffRole("Receptionist");
      setStaffMobile("");
      setStaffUsername("");
      setStaffPassword("");
      fetchStaff();
    } catch (err) {
      console.error("Error adding staff:", err);
      alert("Failed to add staff member: " + (err.response?.data?.error || err.message));
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
      fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Failed to delete staff member: " + (err.response?.data?.error || err.message));
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
    if (!editingStaff.name || !editingStaff.role || !editingStaff.mobile) {
      alert("Please fill all required fields (Name, Role, Mobile)");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/staff/update/${editingStaffId}`, {
        name: editingStaff.name.trim(),
        role: editingStaff.role,
        mobile: editingStaff.mobile.trim(),
        username: editingStaff.username.trim() || null,
        password: editingStaff.password || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Staff Member Updated Successfully");
      setIsStaffEditModalOpen(false);
      setEditingStaffId(null);
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error("Error updating staff:", err);
      alert("Failed to update staff member: " + (err.response?.data?.error || err.message));
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!docName || !specialization || !mobile || selectedDiseases.length === 0 || !fees || !docUsername || !docPassword) {
      alert("Please fill all required fields, select at least one disease, and enter credentials");
      return;
    }
    if (!hasMorningShift && !hasEveningShift) {
      alert("Please enable at least one shift (Morning or Evening).");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const availabilityObj = {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: hasMorningShift ? morningStartTime : eveningStartTime,
        endTime: hasMorningShift ? morningEndTime : eveningEndTime,
        morningStartTime: hasMorningShift ? morningStartTime : null,
        morningEndTime: hasMorningShift ? morningEndTime : null,
        eveningStartTime: hasEveningShift ? eveningStartTime : null,
        eveningEndTime: hasEveningShift ? eveningEndTime : null,
        slotDuration: 30,
        blockedDates: []
      };

      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/add`, {
        name: docName.trim().startsWith("Dr. ") ? docName.trim() : "Dr. " + docName.trim(),
        specialization,
        mobile,
        disease: selectedDiseases.join(", "),
        specializations: selectedDiseases,
        shift: hasMorningShift && hasEveningShift ? "Both" : (hasMorningShift ? "Morning" : "Evening"),
        fees: parseInt(fees),
        image: imageUrl || null,
        username: docUsername.trim(),
        password: docPassword,
        availability: availabilityObj
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Doctor Added Successfully");
      // Reset form
      setDocName("");
      setSpecialization("");
      setMobile("");
      setSelectedDiseases([]);
      setImageUrl("");
      setShift("Morning");
      setMorningStartTime("10:00 AM");
      setMorningEndTime("01:00 PM");
      setEveningStartTime("05:00 PM");
      setEveningEndTime("08:00 PM");
      setHasMorningShift(true);
      setHasEveningShift(false);
      setFees("");
      setDocUsername("");
      setDocPassword("");
      // Refresh list
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding doctor");
      console.error(err);
    }
  };

  const handleOpenEditModal = (doc) => {
    setEditingDoctorId(doc.id);
    setEditingDoctor(doc);
    setDocName(doc.name.replace("Dr. ", ""));
    setSpecialization(doc.specialization || "");
    setMobile(doc.mobile || "");
    setFees(doc.fees || "");
    setShift(doc.shift || "Morning");

    const docAvail = doc.availability ? (typeof doc.availability === "string" ? JSON.parse(doc.availability) : doc.availability) : {};
    setMorningStartTime(docAvail.morningStartTime || docAvail.startTime || "10:00 AM");
    setMorningEndTime(docAvail.morningEndTime || docAvail.endTime || "01:00 PM");
    setEveningStartTime(docAvail.eveningStartTime || "05:00 PM");
    setEveningEndTime(docAvail.eveningEndTime || "08:00 PM");
    setHasMorningShift(docAvail.morningStartTime ? true : (docAvail.startTime ? true : false));
    setHasEveningShift(docAvail.eveningStartTime ? true : false);

    setImageUrl(doc.image || "");
    setDocUsername(doc.username || "");
    setDocPassword(""); // clear password, let admin set new password if they wish
    setSelectedDiseases(Array.isArray(doc.specializations) ? doc.specializations : (doc.disease || "").split(",").map((d) => d.trim()).filter(Boolean));
    setIsEditModalOpen(true);
  };

  const handleUpdateDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!docName || !mobile || !docUsername || selectedDiseases.length === 0) {
      alert("Please fill doctor name, phone, username, and select at least one specialization.");
      return;
    }
    if (!hasMorningShift && !hasEveningShift) {
      alert("Please enable at least one shift (Morning or Evening).");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const currentDoctor = editingDoctor || doctors.find((doc) => String(doc.id) === String(editingDoctorId)) || {};
      const currentAvail = currentDoctor.availability 
        ? (typeof currentDoctor.availability === "string" ? JSON.parse(currentDoctor.availability) : currentDoctor.availability) 
        : {};

      const availabilityObj = {
        ...currentAvail,
        days: currentAvail.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: hasMorningShift ? morningStartTime : eveningStartTime,
        endTime: hasMorningShift ? morningEndTime : eveningEndTime,
        morningStartTime: hasMorningShift ? morningStartTime : null,
        morningEndTime: hasMorningShift ? morningEndTime : null,
        eveningStartTime: hasEveningShift ? eveningStartTime : null,
        eveningEndTime: hasEveningShift ? eveningEndTime : null,
        slotDuration: currentAvail.slotDuration || 30,
        blockedDates: currentAvail.blockedDates || []
      };

      const updatePayload = {
        name: docName.trim().startsWith("Dr. ") ? docName.trim() : "Dr. " + docName.trim(),
        phone: mobile.trim(),
        mobile: mobile.trim(),
        specialization: specialization || currentDoctor.specialization || "General",
        disease: selectedDiseases.join(", "),
        specializations: selectedDiseases,
        shift: hasMorningShift && hasEveningShift ? "Both" : (hasMorningShift ? "Morning" : "Evening"),
        fees: parseInt(fees) || 0,
        image: imageUrl || null,
        username: docUsername.trim() || null,
        availability: availabilityObj
      };

      if (docPassword.trim()) {
        updatePayload.password = docPassword;
      }

      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/update/${editingDoctorId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Doctor Updated Successfully!");
      setIsEditModalOpen(false);
      // Reset form
      setDocName("");
      setSpecialization("");
      setMobile("");
      setSelectedDiseases([]);
      setImageUrl("");
      setShift("Morning");
      setMorningStartTime("10:00 AM");
      setMorningEndTime("01:00 PM");
      setEveningStartTime("05:00 PM");
      setEveningEndTime("08:00 PM");
      setHasMorningShift(true);
      setHasEveningShift(false);
      setFees("");
      setDocUsername("");
      setDocPassword("");
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating doctor");
      console.error(err);
    }
  };

  const handleToggleDoctorStatus = async (id) => {
    if (!window.confirm("Are you sure you want to change this doctor's operational status?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Doctor status updated successfully");
      fetchDoctors();
    } catch (err) {
      alert("Error changing doctor status");
      console.error(err);
    }
  };

  const handleAddDisease = async (e) => {
    e.preventDefault();
    if (!newDiseaseName) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases/add`, { name: newDiseaseName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Disease added successfully");
      setNewDiseaseName("");
      fetchDiseases();
    } catch (err) {
      alert("Error adding disease: " + (err.response?.data?.error || err.message));
      console.error("Error adding disease:", err);
    }
  };

  const handleDeleteDisease = async (id) => {
    if (!window.confirm("Are you sure you want to delete this disease?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Disease deleted successfully");
      fetchDiseases();
    } catch (err) {
      alert("Error deleting disease: " + (err.response?.data?.error || err.message));
      console.error("Error deleting disease:", err);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newMedicineName.trim()) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/medicines/add`, {
        medicine_name: newMedicineName.trim(),
        generic_name: newMedicineGenericName.trim() || null,
        description: newMedicineDescription.trim() || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Medicine added successfully");
      setNewMedicineName("");
      setNewMedicineGenericName("");
      setNewMedicineDescription("");
      fetchMedicines();
    } catch (err) {
      alert("Error adding medicine: " + (err.response?.data?.error || err.message));
      console.error("Error adding medicine:", err);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate/delete this medicine?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/medicines/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Medicine deactivated successfully");
      fetchMedicines();
    } catch (err) {
      alert("Error deactivating medicine: " + (err.response?.data?.error || err.message));
      console.error("Error deactivating medicine:", err);
    }
  };

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
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const loadPatientFileDetails = async (patId) => {
    setLoadingHistory(true);
    setSelectedPatientProfile(patId);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/profile/${patId}`);
      if (res.data.success) {
        setSelectedPatientHistory(res.data);
      }
    } catch (err) {
      console.error("Error loading patient history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ================= ANALYTICS COMPUTATIONS =================
  const totalPatients = patients.length;
  const approvedBookings = bookings.filter((b) => b.status === "Approved");
  
  // Daily Appointments
  const todayStr = new Date().toISOString().split("T")[0];
  const dailyAppointments = bookings.filter((b) => {
    const bDate = new Date(b.date).toISOString().split("T")[0];
    return bDate === todayStr;
  }).length;

  // Revenue (Approved Bookings * Doctor Fees)
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);

  // Completed Bookings for Reports
  const completedBookings = bookings.filter((b) => b.status === "Completed");
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const todayCompletedBookings = completedBookings.filter((b) => {
    try {
      const bDate = new Date(b.date).toISOString().split("T")[0];
      return bDate === todayStr;
    } catch(e) { return false; }
  });
  const todayCompletedRevenue = todayCompletedBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);

  const monthlyCompletedBookings = completedBookings.filter((b) => {
    try {
      const bd = new Date(b.date);
      return bd.getMonth() === currentMonth && bd.getFullYear() === currentYear;
    } catch(e) { return false; }
  });
  const monthlyCompletedRevenue = monthlyCompletedBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);

  const totalCompletedRevenue = completedBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);

  const doctorReport = doctors.map((doc) => {
    const docBookings = completedBookings.filter((b) => String(b.doctor_id) === String(doc.id));
    const todayDocBookings = docBookings.filter((b) => {
      try {
        const bDate = new Date(b.date).toISOString().split("T")[0];
        return bDate === todayStr;
      } catch(e) { return false; }
    });
    const monthlyDocBookings = docBookings.filter((b) => {
      try {
        const bd = new Date(b.date);
        return bd.getMonth() === currentMonth && bd.getFullYear() === currentYear;
      } catch(e) { return false; }
    });

    const todayRev = todayDocBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);
    const monthlyRev = monthlyDocBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);
    const totalRev = docBookings.reduce((sum, b) => sum + (parseInt(b.doctor_fees) || 0), 0);

    return {
      id: doc.id,
      name: doc.name,
      specialization: doc.specialization || "General",
      fees: doc.fees || 0,
      completedCount: docBookings.length,
      todayRevenue: todayRev,
      monthlyRevenue: monthlyRev,
      totalRevenue: totalRev
    };
  });

  // Doctor Performance
  const doctorPerformance = doctors.map((doc) => {
    const count = approvedBookings.filter((b) => String(b.doctor_id) === String(doc.id)).length;
    return { name: doc.name, count };
  }).sort((a, b) => b.count - a.count);

  // Most Common Diseases
  const diseaseCounts = {};
  bookings.forEach((b) => {
    if (b.patient_diseases) {
      b.patient_diseases.split(",").forEach((d) => {
        const name = d.trim();
        if (name) {
          diseaseCounts[name] = (diseaseCounts[name] || 0) + 1;
        }
      });
    }
  });
  const commonDiseases = Object.entries(diseaseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Filtering Patients based on search input
  const filteredPatients = patients.filter((pat) => {
    const query = patientSearchQuery.toLowerCase();
    return (
      pat.name.toLowerCase().includes(query) ||
      pat.patient_id.toLowerCase().includes(query) ||
      pat.mobile.toLowerCase().includes(query)
    );
  });

  // Filtering Doctor Leaves based on search input
  const filteredLeaves = leaves.filter((lv) => {
    const query = leaveSearch.toLowerCase();
    return (lv.doctor_name || "").toLowerCase().includes(query) || (lv.reason || "").toLowerCase().includes(query);
  });

  // Filtering Doctors for Booking Form
  const bkFilteredDoctors = doctors.filter((doc) => {
    if (!bkSelectedService) return true;
    const serviceLower = bkSelectedService.toLowerCase().trim();
    const specMatch = doc.specialization && doc.specialization.toLowerCase().includes(serviceLower);
    const diseaseMatch = doc.disease && doc.disease.toLowerCase().includes(serviceLower);
    return specMatch || diseaseMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col xl:flex-row">
      {/* SIDE NAVIGATION */}
      <aside className="w-full xl:w-72 bg-[var(--primary-dark)] text-white flex flex-col justify-between shrink-0 p-6 shadow-xl">
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
            {branding.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt="Logo" 
                className="object-contain rounded-lg" 
                style={{ 
                  width: branding.logo_width ? `${branding.logo_width}px` : "48px", 
                  height: branding.logo_height ? `${branding.logo_height}px` : "48px",
                  maxWidth: "120px", 
                  maxHeight: "60px" 
                }} 
              />
            ) : (
              <div className="w-12 h-12 bg-[var(--primary-hover)] flex items-center justify-center rounded-2xl font-black text-xl text-white">
                {branding.clinic_name ? branding.clinic_name.charAt(0) : "S"}
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-lg leading-tight truncate max-w-[170px]" title={branding.clinic_name || "Sumitra Clinic"}>
                {branding.clinic_name || "Sumitra Clinic"}
              </h1>
              <p className="text-xs text-white/85 font-bold uppercase tracking-wider">{role === "staff" ? "Receptionist" : "Admin Dashboard"}</p>
            </div>
          </div>

          {/* MENUS */}
          <nav className="space-y-2.5 font-bold text-sm">
            {role !== "staff" && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                  activeTab === "dashboard" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                }`}
              >
                <FaUserMd className="text-base" /> Dashboard Overview
              </button>
            )}
            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "bookings" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
              }`}
            >
              <FaCalendarCheck className="text-base" /> Appointment Bookings
            </button>
            <button
              onClick={() => setActiveTab("book")}
              className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "book" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
              }`}
            >
              <FaPlus className="text-base" /> Book Appointment
            </button>
            {role !== "staff" && (
              <>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "doctors" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaStethoscope className="text-base" /> Doctor Master
                </button>
                <button
                  onClick={() => setActiveTab("schedules")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "schedules" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaCalendarCheck className="text-base" /> Doctor Schedules
                </button>
                <button
                  onClick={() => setActiveTab("patients")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "patients" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaHospitalUser className="text-base" /> Patient Directory
                </button>
                <button
                  onClick={() => setActiveTab("diseases")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "diseases" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaDna className="text-base" /> Disease Master
                </button>
                <button
                  onClick={() => setActiveTab("medicines")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "medicines" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaPrescriptionBottle className="text-base" /> Medicine Master
                </button>
                <button
                  onClick={() => {
                    setActiveTab("leaves");
                    fetchLeaves();
                  }}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "leaves" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaCalendarCheck className="text-base" /> Doctor Leaves Log
                </button>
                <button
                  onClick={() => setActiveTab("staff")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "staff" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaUsers className="text-base" /> Staff Management
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "reports" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaClipboardList className="text-base" /> Revenue Reports
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left py-3.5 px-5 rounded-2xl transition-all duration-300 flex items-center gap-3.5 transform hover:scale-[1.01] active:scale-[0.99] ${
                    activeTab === "settings" ? "bg-[var(--primary-color)] text-white shadow-md shadow-black/10" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <FaEdit className="text-base" /> Clinic Settings
                </button>
              </>
            )}
          </nav>
        </div>

        {/* BACK TO HOME & LOGOUT */}
        <div className="mt-10 space-y-2">
          <a
            href="/"
            className="w-full bg-[var(--primary-dark)]/40 hover:bg-[var(--primary-dark)] hover:text-white text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 border border-white/20 text-sm"
          >
            Back to Home
          </a>
          <button
            onClick={handleLogout}
            className="w-full bg-[var(--primary-dark)]/60 hover:bg-[var(--primary-dark)] hover:text-white text-white/90 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 border border-white/35 text-sm"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* VIEW BODY */}
        <main className="p-6 sm:p-10 flex-1 overflow-y-auto">
          


          {/* ================= TAB 1: SYSTEM OVERVIEW ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* WELCOME HEADER */}
              <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white p-8 rounded-[36px] shadow-lg relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                <h2 className="text-3xl font-black relative z-10 tracking-tight">Welcome Back, Admin! 👋</h2>
                <p className="text-white/90 text-sm mt-2.5 relative z-10 max-w-xl leading-relaxed font-medium">
                  Manage the homeopathy clinic, add doctors, configure credentials, monitor incoming appointment bookings, and check patient recovery status.
                </p>
              </div>

              {/* ANALYTICS STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 hover:border-slate-200 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Patients</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{totalPatients}</span>
                    <span className="text-[10px] font-extrabold text-[var(--primary-hover)] bg-[var(--primary-color)]/10 px-2.5 py-1 rounded-md border border-[var(--primary-color)]/10">Patients</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 hover:border-slate-200 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Appointments</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{dailyAppointments}</span>
                    <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100">Slots</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 hover:border-slate-200 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Treatment Symptom</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-lg font-black text-slate-805 truncate max-w-[150px] tracking-tight">
                      {commonDiseases[0]?.name || "None"}
                    </span>
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                      {commonDiseases[0]?.count || 0} cases
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILED STATS (DOCTOR PERFORMANCE & DISEASES CHART) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Doctor Performance */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-5">Doctor Booking Performance</h3>
                  {doctorPerformance.length === 0 ? (
                    <p className="text-slate-450 text-xs font-semibold py-8 text-center">No doctor records logged.</p>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {doctorPerformance.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-650">
                            <span>{item.name}</span>
                            <span>{item.count} Approved Appointments</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[var(--primary-hover)] h-full transition-all duration-500" 
                              style={{ width: `${Math.min((item.count / Math.max(...doctorPerformance.map(d=>d.count || 1))) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Common Diseases Sufferings */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-5">Most Common Patient Sufferings</h3>
                  {commonDiseases.length === 0 ? (
                    <p className="text-slate-450 text-xs font-semibold py-8 text-center">No patient symptoms data available.</p>
                  ) : (
                    <div className="space-y-4 font-semibold text-xs text-slate-650">
                      {commonDiseases.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                          <span className="font-bold text-slate-850">{item.name}</span>
                          <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-bold">
                            {item.count} appointments
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: DOCTOR MASTER ================= */}
          {activeTab === "doctors" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
              {/* ADD DOCTOR FORM CONTAINER */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FaPlus className="text-[var(--primary-color)] text-sm" /> Add New Doctor
                </h3>
                
                <form onSubmit={handleAddDoctor} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Doctor Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaUser /></span>
                      <input
                        type="text"
                        placeholder="e.g. Sumitra"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Specialization</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaStethoscope /></span>
                      <input
                        type="text"
                        placeholder="e.g. Hair Specialist"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaMobileAlt /></span>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  {/* CREDENTIALS SECTION */}
                  <div className="p-4 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-[var(--primary-color)] block">Doctor Login Credentials</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Username</label>
                      <input
                        type="text"
                        placeholder="e.g. sharmadoc"
                        value={docUsername}
                        onChange={(e) => setDocUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Password</label>
                      <input
                        type="password"
                        placeholder="e.g. secret123"
                        value={docPassword}
                        onChange={(e) => setDocPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Treating Disease(s) (Select Checkboxes)</label>
                    {diseases.length === 0 ? (
                      <p className="text-xs text-amber-600 font-semibold py-1">Please add diseases in Disease Master first.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-1 border border-slate-200 bg-slate-50/50 p-3 rounded-xl max-h-36 overflow-y-auto">
                        {diseases.map((d) => {
                          const isChecked = selectedDiseases.includes(d.name);
                          return (
                            <label key={d.id} className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer hover:text-slate-800">
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
                                className="rounded text-[var(--primary-hover)] focus:ring-[var(--primary-color)]/30 h-3.5 w-3.5"
                              />
                              {d.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Doctor Image</label>
                    <div className="relative border border-dashed border-slate-300 bg-slate-50/50 p-3 rounded-xl flex flex-col items-center justify-center hover:bg-slate-100/50 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FaFileImage className="text-slate-400 text-xl mb-1" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {uploading ? "Uploading..." : "Click to Upload Profile Image"}
                      </span>
                    </div>
                    {imageUrl && (
                      <div className="mt-3 flex items-center gap-3 bg-[var(--primary-color)]/10/50 border border-[var(--primary-color)]/25 p-2 rounded-xl">
                        <img src={imageUrl} alt="uploaded" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="text-[10px] font-semibold text-[var(--primary-hover)] truncate max-w-[150px]">
                          Image uploaded successfully!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Morning Shift Timings */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMorningShift}
                        onChange={(e) => setHasMorningShift(e.target.checked)}
                        className="rounded text-[var(--primary-hover)] focus:ring-[var(--primary-color)]/30 h-4 w-4"
                      />
                      Morning Shift
                    </label>
                    {hasMorningShift && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Start Time</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 10:00 AM"
                            value={morningStartTime}
                            onChange={(e) => setMorningStartTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">End Time</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 01:00 PM"
                            value={morningEndTime}
                            onChange={(e) => setMorningEndTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Evening Shift Timings */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasEveningShift}
                        onChange={(e) => setHasEveningShift(e.target.checked)}
                        className="rounded text-[var(--primary-hover)] focus:ring-[var(--primary-color)]/30 h-4 w-4"
                      />
                      Evening Shift
                    </label>
                    {hasEveningShift && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Start Time</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 05:00 PM"
                            value={eveningStartTime}
                            onChange={(e) => setEveningStartTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">End Time</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 08:00 PM"
                            value={eveningEndTime}
                            onChange={(e) => setEveningEndTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Fees (₹)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaRupeeSign /></span>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-xl transition shadow"
                  >
                    Save Doctor
                  </button>
                </form>
              </div>

              {/* DOCTOR DIRECTORY LIST */}
              <div className="xl:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-5">Doctor Directory</h3>
                
                {doctors.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium">No doctors added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                          <th className="pb-3">Doctor Name</th>
                          <th className="pb-3">Specialization</th>
                          <th className="pb-3">Disease</th>
                          <th className="pb-3">Shift</th>
                          <th className="pb-3">Fees</th>
                          <th className="pb-3">Username</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {doctors.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 text-slate-800">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-250 flex-shrink-0">
                                  {doc.image ? (
                                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                                      {doc.name.replace("Dr. ", "").substring(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <span>{doc.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-500">{doc.specialization || "General"}</td>
                            <td className="py-3.5"><span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-2.5 py-1 rounded-lg text-xs font-bold">{doc.disease}</span></td>
                            <td className="py-3.5 text-slate-600">{doc.shift}</td>
                            <td className="py-3.5 text-[var(--primary-color)]">₹{doc.fees}</td>
                            <td className="py-3.5 text-slate-450">{doc.username || "N/A"}</td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                doc.status === "Inactive"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-primary-100 text-primary-700 border border-primary-200"
                              }`}>
                                {doc.status === "Inactive" ? "Deactivated" : "Active"}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(doc)}
                                  className="text-[var(--primary-hover)] hover:text-[var(--primary-color)] p-2 hover:bg-[var(--primary-color)]/10 rounded-lg transition"
                                  title="Edit Doctor"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleToggleDoctorStatus(doc.id)}
                                  className={`p-2 rounded-lg transition ${
                                    doc.status === "Inactive"
                                      ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                                      : "text-primary-500 hover:text-primary-700 hover:bg-primary-50"
                                  }`}
                                  title={doc.status === "Inactive" ? "Activate Doctor" : "Deactivate Doctor"}
                                >
                                  {doc.status === "Inactive" ? <FaToggleOff size={16} /> : <FaToggleOn size={16} />}
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
          {/* ================= TAB 3: DOCTOR SCHEDULES OVERVIEW (READ-ONLY) ================= */}
          {activeTab === "schedules" && (
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm animate-fadeIn">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">Doctor Schedules Overview</h3>
                <p className="text-slate-500 text-xs mt-1">Read-only overview of the active working shifts, slot intervals, and holidays configured by each doctor.</p>
              </div>
              
              {doctors.length === 0 ? (
                <p className="text-slate-400 text-center py-10 font-medium">No doctor records logged.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doc) => {
                    let avail = null;
                    if (doc.availability) {
                      try {
                        avail = typeof doc.availability === "string" ? JSON.parse(doc.availability) : doc.availability;
                      } catch (e) {
                        avail = doc.availability;
                      }
                    }
                    return (
                      <div key={doc.id} className="border border-slate-150 p-5 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 border-b pb-3 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {doc.image ? (
                                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                              ) : (
                                doc.name.replace("Dr. ", "").substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold">{doc.specialization || "General"}</p>
                            </div>
                          </div>

                          <div className="space-y-3.5 text-xs font-semibold text-slate-650 leading-relaxed">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Shift Days</span>
                              {avail && avail.days && avail.days.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {avail.days.map((day) => (
                                    <span key={day} className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-2 py-0.5 rounded text-[10px] font-bold">{day}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-750 italic font-bold">Mon-Fri (Default)</span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Timings</span>
                                <span className="text-slate-750 font-bold">
                                  {avail ? (
                                    avail.morningStartTime || avail.eveningStartTime ? (
                                      <div className="space-y-0.5 font-bold text-[10px]">
                                        {avail.morningStartTime && <div className="text-primary-700">Morn: {avail.morningStartTime} - {avail.morningEndTime}</div>}
                                        {avail.eveningStartTime && <div className="text-indigo-700">Even: {avail.eveningStartTime} - {avail.eveningEndTime}</div>}
                                      </div>
                                    ) : (
                                      `${avail.startTime} - ${avail.endTime}`
                                    )
                                  ) : (
                                    "10:00 AM - 01:00 PM"
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Slot Interval</span>
                                <span className="text-slate-750 font-bold">{avail ? `${avail.slotDuration} mins` : "30 mins"}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Blocked Leave Dates</span>
                              {avail && avail.blockedDates && avail.blockedDates.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {avail.blockedDates.map((dateStr) => (
                                    <span key={dateStr} className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded text-[9px] font-bold">
                                      {new Date(dateStr).toLocaleDateString()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No leaves configured</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3.5: APPOINTMENT BOOKINGS ================= */}
          {activeTab === "bookings" && (
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Patient Booking Ledger</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Review, approve, and finalize patient appointment requests</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                      <th className="pb-3">Patient Details</th>
                      <th className="pb-3">Assigned Doctor</th>
                      <th className="pb-3">Scheduled Slot</th>
                      <th className="pb-3">Problem / Symptoms</th>
                      <th className="pb-3">Current Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {bookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-slate-800 text-sm">{bk.patient_name}</div>
                          <span className="text-[10px] text-slate-400 font-bold">{bk.mobile}</span>
                        </td>
                        <td className="py-4 text-slate-700 font-bold">{bk.doctor_name || "Unassigned"}</td>
                        <td className="py-4">
                          <span className="block font-bold text-slate-800">{new Date(bk.date).toLocaleDateString()}</span>
                          <span className="block text-slate-400 text-[10px] font-bold">{bk.appointment_time || "10:00 AM"}</span>
                        </td>
                        <td className="py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            {bk.patient_diseases || "Consultation"}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            bk.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            bk.status === "Approved" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            bk.status === "Rejected" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-green-50 text-green-700 border-green-100"
                          }`}>
                            {bk.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {bk.status !== "Rejected" && bk.status !== "Completed" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, bk.status)}
                                className="bg-[var(--primary-color)]/10 hover:bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-[10px] font-extrabold py-1.5 px-3.5 rounded-xl border border-[var(--primary-color)]/25 transition-all active:scale-95 shadow-sm"
                              >
                                {bk.status === "Pending" ? "Approve" : "Complete"}
                              </button>
                            )}
                            {bk.status === "Pending" && (
                              <button
                                onClick={() => handleRejectBooking(bk.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-extrabold py-1.5 px-3.5 rounded-xl border border-rose-200 transition-all active:scale-95 shadow-sm"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                          No booking records logged in the clinic ledger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3.7: BOOK APPOINTMENT ================= */}
          {activeTab === "book" && (
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Book Patient Appointment</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Register a new patient and book a consultation slot</p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm mb-6">
                <button
                  type="button"
                  onClick={() => setBkType("new")}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                    bkType === "new" ? "bg-[var(--primary-color)] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  New Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setBkType("re")}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                    bkType === "re" ? "bg-[var(--primary-color)] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Reappointment
                </button>
              </div>

              <form onSubmit={handleBkSubmit} className="space-y-5 max-w-2xl font-semibold text-xs text-slate-700">
                {bkType === "re" && (
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Patient ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Patient ID (e.g. P-72862)"
                      value={bkPatientId}
                      onChange={(e) => setBkPatientId(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Full Patient Name *</label>
                    <input
                      type="text"
                      required
                      disabled={bkType === "re" && bkPatientName !== ""}
                      placeholder="Full Name"
                      value={bkPatientName}
                      onChange={(e) => setBkPatientName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      disabled={bkType === "re" && bkMobile !== ""}
                      placeholder="Enter 10-digit mobile number"
                      value={bkMobile}
                      onChange={(e) => setBkMobile(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Select Disease / Problem *</label>
                    <select
                      value={bkSelectedService}
                      onChange={(e) => {
                        setBkSelectedService(e.target.value);
                        setBkSelectedDoctorId("");
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs"
                    >
                      <option value="">Select Disease...</option>
                      {diseases.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Choose Doctor *</label>
                    <select
                      required
                      value={bkSelectedDoctorId}
                      onChange={(e) => setBkSelectedDoctorId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs"
                    >
                      <option value="">Choose Doctor...</option>
                      {bkFilteredDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.specialization || "Homeopathy Specialist"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={bkDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setBkDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Preferred Timing Slot *</label>
                    <select
                      required
                      value={bkTimeSlot}
                      onChange={(e) => setBkTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl outline-none transition font-semibold text-slate-700 text-xs"
                    >
                      {bkAvailableSlots.length === 0 ? (
                        <option value="">No Slots Available / Choose Date & Doctor</option>
                      ) : (
                        bkAvailableSlots.map((slot, idx) => (
                          <option key={idx} value={slot}>
                            {slot}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Upload Report / Reference File (Optional)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setBkFile(e.target.files[0])}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Symptoms / Notes (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Enter patient symptoms or additional notes..."
                    value={bkMessage}
                    onChange={(e) => setBkMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-2xl outline-none transition font-semibold text-slate-700 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-extrabold px-6 py-3 rounded-2xl transition active:scale-95 shadow-md text-xs"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 4: PATIENT DIRECTORY ================= */}
          {activeTab === "patients" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* PATIENTS DIRECTORY TABLE (7 COLS) */}
              <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Patient Directory</h3>
                  
                  {/* SEARCH LOOKUP */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search by ID, Name, Phone..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition text-slate-700 font-semibold"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  </div>
                </div>

                {filteredPatients.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium">No patient records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                          <th className="pb-3">Patient ID</th>
                          <th className="pb-3">Patient Name</th>
                          <th className="pb-3">Mobile</th>
                          <th className="pb-3 text-center">Bookings</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-xs">
                        {filteredPatients.map((pat) => (
                          <tr key={pat.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 text-slate-900 font-bold">{pat.patient_id}</td>
                            <td className="py-3 text-slate-800">{pat.name}</td>
                            <td className="py-3 text-slate-500">{pat.mobile}</td>
                            <td className="py-3 text-center text-slate-700 font-bold">{pat.total_appointments || 0}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => loadPatientFileDetails(pat.patient_id)}
                                className="text-xs bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-3 py-1.5 rounded-lg hover:bg-[var(--primary-color)]/20 transition inline-flex items-center gap-1"
                              >
                                <FaClipboardList /> View Medical File
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PATIENT HISTORICAL FILE PREVIEW (5 COLS) */}
              <div className="lg:col-span-5">
                {selectedPatientProfile ? (
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                    
                    {loadingHistory ? (
                      <div className="py-12 flex flex-col justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mb-2"></div>
                        <span className="text-xs font-bold text-slate-400">Loading patient medical file...</span>
                      </div>
                    ) : selectedPatientHistory ? (
                      <>
                        {/* Profile Details header */}
                        <div className="border-b pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-lg">{selectedPatientHistory.profile.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {selectedPatientHistory.profile.patient_id}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <a
                                  href={`/patient/${selectedPatientHistory.profile.patient_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1"
                                >
                                  <FaFolderOpen /> Invoice
                                </a>
                                <a
                                  href={`/patient/report/${selectedPatientHistory.profile.patient_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-[#9A6A42] bg-[#FFF8F2] hover:bg-[#FDF6EF] px-2.5 py-1.5 rounded-lg border border-[#E8D4C0] transition flex items-center gap-1"
                                >
                                  <FaBookMedical /> OPD & Prescription
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2.5 mt-3 text-[11px] font-bold text-slate-500">
                            <p>Mobile: <span className="text-slate-700">{selectedPatientHistory.profile.mobile}</span></p>
                            <p>Age/Gender: <span className="text-slate-700">{selectedPatientHistory.profile.age || "N/A"} Yrs / {selectedPatientHistory.profile.gender || "N/A"}</span></p>
                          </div>
                        </div>

                        {/* Latest Vitals preview */}
                        {selectedPatientHistory.latestVitals ? (
                          <div className="p-4 bg-slate-50 rounded-2xl border">
                            <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wide flex items-center gap-1.5"><FaHeartbeat /> Latest Vitals Logged</span>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-bold text-slate-600">
                              <div>
                                <span className="text-[9px] text-slate-400 block font-semibold">BP</span>
                                {selectedPatientHistory.latestVitals.blood_pressure || "N/A"}
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block font-semibold">Weight</span>
                                {selectedPatientHistory.latestVitals.weight || "N/A"} kg
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block font-semibold">Condition</span>
                                <span className="text-[var(--primary-color)]">{selectedPatientHistory.latestVitals.current_condition || "Stable"}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-[11px] font-bold">No clinical vitals logged yet.</p>
                        )}

                        {/* Medical Prescriptions list */}
                        <div>
                          <span className="text-xs font-bold text-[var(--primary-color)] block mb-3 uppercase tracking-wide border-b pb-1">Prescription Logs</span>
                          {selectedPatientHistory.prescriptions.length === 0 ? (
                            <p className="text-slate-450 text-[10px] font-bold py-2">No prescriptions written yet.</p>
                          ) : (
                            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                              {selectedPatientHistory.prescriptions.map((pr) => (
                                <div key={pr.id} className="border p-3.5 rounded-xl bg-slate-50/30 text-xs font-semibold text-slate-650">
                                  <div className="flex justify-between border-b pb-1.5 mb-1.5 text-[10px] font-bold text-slate-450">
                                    <span>Dr. {pr.doctor_name}</span>
                                    <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-slate-800 font-extrabold">{formatMedicinesForDisplay(pr.medicines)}</div>
                                  <p className="text-[10px] text-slate-400 mt-1">Dosage: {pr.dosage || "As advised"} • Duration: {pr.instructions || "N/A"}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Recent Appointments */}
                        <div>
                          <span className="text-xs font-bold text-[var(--primary-color)] block mb-3 uppercase tracking-wide border-b pb-1">Booking Records</span>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {selectedPatientHistory.appointments.map((ap) => (
                              <div key={ap.id} className="flex justify-between items-center text-xs border border-slate-100 p-2.5 rounded-xl bg-white hover:bg-slate-50 transition">
                                <div>
                                  <p className="font-bold text-slate-800">Dr. {ap.doctor_name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(ap.date).toLocaleDateString()} • {ap.appointment_time || "N/A"}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  ap.status === "Approved" ? "bg-green-50 text-green-700" :
                                  ap.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-705"
                                }`}>
                                  {ap.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-red-500 font-bold">Failed to load medical history</p>
                    )}

                  </div>
                ) : (
                  <div className="bg-white border border-slate-150 border-dashed rounded-3xl p-8 text-center h-full flex flex-col justify-center items-center min-h-[300px]">
                    <FaRegFolderOpen className="text-slate-350 text-4xl mb-2" />
                    <h4 className="font-bold text-slate-500 text-xs sm:text-sm">No Patient File Selected</h4>
                    <p className="text-slate-400 text-[10px] mt-1 max-w-[200px]">
                      Click "View Medical File" in the directory directory to review health history, BP metrics, and prescriptions.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 5: DISEASE MASTER ================= */}
          {activeTab === "diseases" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
              {/* ADD DISEASE FORM */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FaPlus className="text-[var(--primary-color)] text-sm" /> Add New Disease
                </h3>
                <form onSubmit={handleAddDisease} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Disease Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaHeartbeat /></span>
                      <input
                        type="text"
                        placeholder="e.g. Migraine, Hair Fall"
                        value={newDiseaseName}
                        onChange={(e) => setNewDiseaseName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-xl transition shadow"
                  >
                    Save Disease
                  </button>
                </form>
              </div>

              {/* DISEASE DIRECTORY */}
              <div className="xl:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-5">Disease Directory</h3>
                {diseases.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium">No diseases added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                          <th className="pb-3">ID</th>
                          <th className="pb-3">Disease Name</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-xs">
                        {diseases.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-55/50 transition">
                            <td className="py-3 text-slate-400">#{d.id}</td>
                            <td className="py-3 text-slate-800">{d.name}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteDisease(d.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                title="Delete Disease"
                              >
                                <FaTrash />
                              </button>
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

          {/* ================= TAB 5.5: MEDICINE MASTER ================= */}
          {activeTab === "medicines" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
              {/* ADD MEDICINE FORM */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FaPlus className="text-[var(--primary-color)] text-sm" /> Add New Medicine
                </h3>
                <form onSubmit={handleAddMedicine} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Medicine Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaPrescriptionBottle /></span>
                      <input
                        type="text"
                        placeholder="e.g. Arnica Montana 30C"
                        required
                        value={newMedicineName}
                        onChange={(e) => setNewMedicineName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Generic Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaPrescriptionBottle /></span>
                      <input
                        type="text"
                        placeholder="e.g. Arnica Montana"
                        value={newMedicineGenericName}
                        onChange={(e) => setNewMedicineGenericName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Description</label>
                    <textarea
                      rows="3"
                      placeholder="E.g. Excellent for bruising, muscle soreness..."
                      value={newMedicineDescription}
                      onChange={(e) => setNewMedicineDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-xl transition shadow"
                  >
                    Save Medicine
                  </button>
                </form>
              </div>

              {/* MEDICINE DIRECTORY */}
              <div className="xl:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-5">Medicine Directory</h3>
                {medicines.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium">No medicines added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                          <th className="pb-3">ID</th>
                          <th className="pb-3">Medicine Name</th>
                          <th className="pb-3">Generic Name</th>
                          <th className="pb-3">Description</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-xs">
                        {medicines.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 text-slate-400">#{m.id}</td>
                            <td className="py-3 text-slate-800">{m.medicine_name}</td>
                            <td className="py-3 text-slate-550">{m.generic_name || "N/A"}</td>
                            <td className="py-3 text-slate-450 max-w-xs truncate" title={m.description}>{m.description || "N/A"}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteMedicine(m.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                title="Delete Medicine"
                              >
                                <FaTrash />
                              </button>
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

          {/* ================= TAB 6: STAFF MANAGEMENT ================= */}
          {activeTab === "staff" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
              {/* ADD STAFF MEMBER FORM */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FaPlus className="text-[var(--primary-color)] text-sm" /> Add Staff Member
                </h3>
                <form onSubmit={handleAddStaff} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Full Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaUser /></span>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        required
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Role *</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                    >
                      <option value="Receptionist">Receptionist</option>
                      <option value="Peon">Peon</option>
                      <option value="Employee">Employee (General)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Phone / Mobile *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaMobileAlt /></span>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        required
                        value={staffMobile}
                        onChange={(e) => setStaffMobile(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-extrabold text-[var(--primary-color)] mb-2 uppercase tracking-wide">Login Credentials (Optional)</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Username</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaUser /></span>
                          <input
                            type="text"
                            placeholder="e.g. rahul_receptionist"
                            value={staffUsername}
                            onChange={(e) => setStaffUsername(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaLock /></span>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={staffPassword}
                            onChange={(e) => setStaffPassword(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-xl transition shadow mt-2"
                  >
                    Save Staff Member
                  </button>
                </form>
              </div>

              {/* STAFF DIRECTORY */}
              <div className="xl:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-5">Staff Directory</h3>
                {staff.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium">No staff members registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Phone</th>
                          <th className="pb-3">Username</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-xs">
                        {staff.map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 text-slate-800 font-bold">{member.name}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                member.role === "Receptionist"
                                  ? "bg-purple-100 text-purple-700"
                                  : member.role === "Peon"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="py-3 text-slate-500">{member.mobile}</td>
                            <td className="py-3 text-slate-450">{member.username || <span className="text-slate-300 italic font-normal">None</span>}</td>
                            <td className="py-3 text-right space-x-1 text-base">
                              <button
                                onClick={() => openEditStaffModal(member)}
                                className="text-[var(--primary-hover)] hover:text-[var(--primary-color)] p-2 hover:bg-[var(--primary-color)]/10 rounded-lg transition inline-flex items-center"
                                title="Edit Staff"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(member.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition inline-flex items-center"
                                title="Delete Staff"
                              >
                                <FaTrash />
                              </button>
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

          {/* ================= TAB: REVENUE REPORTS ================= */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* HEADER */}
              <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
                    <FaClipboardList className="text-[var(--primary-color)]" /> Performance & Revenue Reports
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Analyze completed consultations count and revenue generated by each doctor today, this month, or all-time.
                  </p>
                </div>
                
                {/* Doctor Selector Dropdown */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-600 w-full sm:w-auto">
                  <span className="text-slate-400">Filter Doctor:</span>
                  <select
                    value={selectedReportDoctorId}
                    onChange={(e) => setSelectedReportDoctorId(e.target.value)}
                    className="bg-transparent outline-none text-slate-800 font-extrabold cursor-pointer w-full sm:w-auto"
                  >
                    <option value="all">All Doctors</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* OVERVIEW CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Completed Consultations</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-extrabold text-slate-800">
                      {selectedReportDoctorId === "all"
                        ? completedBookings.length
                        : completedBookings.filter(b => String(b.doctor_id) === String(selectedReportDoctorId)).length
                      }
                    </span>
                    <span className="text-[10px] font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded uppercase">Patients</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Today's Completed Revenue</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-extrabold text-slate-800">
                      ₹{selectedReportDoctorId === "all"
                        ? todayCompletedRevenue
                        : todayCompletedBookings.filter(b => String(b.doctor_id) === String(selectedReportDoctorId)).reduce((s, b) => s + (parseInt(b.doctor_fees) || 0), 0)
                      }
                    </span>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">Today</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly Completed Revenue</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-extrabold text-slate-800">
                      ₹{selectedReportDoctorId === "all"
                        ? monthlyCompletedRevenue
                        : monthlyCompletedBookings.filter(b => String(b.doctor_id) === String(selectedReportDoctorId)).reduce((s, b) => s + (parseInt(b.doctor_fees) || 0), 0)
                      }
                    </span>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">This Month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Revenue (Completed)</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-extrabold text-slate-800">
                      ₹{selectedReportDoctorId === "all"
                        ? totalCompletedRevenue
                        : completedBookings.filter(b => String(b.doctor_id) === String(selectedReportDoctorId)).reduce((s, b) => s + (parseInt(b.doctor_fees) || 0), 0)
                      }
                    </span>
                    <span className="text-[10px] font-black text-[#064e3b] bg-primary-50 px-2 py-0.5 rounded uppercase">All-time</span>
                  </div>
                </div>
              </div>

              {/* REPORT BREAKDOWN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Doctor-wise Table */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 lg:col-span-12 space-y-5">
                  <h4 className="font-extrabold text-base text-slate-800">
                    {selectedReportDoctorId === "all" ? "All Doctors Performance & Revenue Ledger" : "Doctor Performance Details"}
                  </h4>
                  
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                    <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                          <th className="p-4 pl-6">Doctor Details</th>
                          <th className="p-4">Completed Patients</th>
                          <th className="p-4">Today's Revenue</th>
                          <th className="p-4">Monthly Revenue</th>
                          <th className="p-4 pr-6">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {doctorReport
                          .filter(doc => selectedReportDoctorId === "all" || String(doc.id) === String(selectedReportDoctorId))
                          .map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 pl-6">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-extrabold text-slate-800 text-sm">{doc.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{doc.specialization} • Fee: ₹{doc.fees}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-extrabold">{doc.completedCount} Patients</span>
                              </td>
                              <td className="p-4 font-black text-amber-700">₹{doc.todayRevenue}</td>
                              <td className="p-4 font-black text-blue-700">₹{doc.monthlyRevenue}</td>
                              <td className="p-4 pr-6 font-black text-primary-800 text-sm">₹{doc.totalRevenue}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Specific Doctor Completed Log */}
                {selectedReportDoctorId !== "all" && (
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 lg:col-span-12 space-y-4">
                    <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></span>
                      Audit Log: Completed Consultations for {doctors.find(d => String(d.id) === String(selectedReportDoctorId))?.name}
                    </h4>
                    
                    {completedBookings.filter(b => String(b.doctor_id) === String(selectedReportDoctorId)).length === 0 ? (
                      <p className="text-slate-450 text-xs font-semibold py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No completed appointments recorded for this doctor.
                      </p>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                              <th className="p-4 pl-6">Patient Name</th>
                              <th className="p-4">Mobile</th>
                              <th className="p-4">Consultation Date</th>
                              <th className="p-4">Time Slot</th>
                              <th className="p-4 pr-6">Fee Collected</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {completedBookings
                              .filter(b => String(b.doctor_id) === String(selectedReportDoctorId))
                              .map((b) => (
                                <tr key={b.id} className="hover:bg-slate-55/50 transition-colors">
                                  <td className="p-4 pl-6 font-extrabold text-slate-805">{b.patient_name}</td>
                                  <td className="p-4 text-slate-500 font-mono">{b.mobile}</td>
                                  <td className="p-4">{new Date(b.date).toLocaleDateString()}</td>
                                  <td className="p-4 text-slate-500 font-bold">{b.appointment_time || "N/A"}</td>
                                  <td className="p-4 pr-6 font-black text-slate-800">₹{b.doctor_fees || 0}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 7: CLINIC SETTINGS ================= */}
          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto bg-white border border-slate-100 p-6 sm:p-8 rounded-[32px] shadow-sm animate-fadeIn">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <FaEdit className="text-[var(--primary-color)]" /> Clinic Profile & Settings
              </h3>
              
              <form onSubmit={handleBrandingSave} className="space-y-6">
                
                {/* Logo Section */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 border-dashed h-40">
                    {logoUrlInput ? (
                      <img 
                        src={logoUrlInput} 
                        alt="Clinic Logo Preview" 
                        className="object-contain max-h-32 max-w-full rounded-lg"
                        style={{ width: `${logoWidthInput}px`, height: `${logoHeightInput}px` }}
                      />
                    ) : (
                      <div className="text-slate-400 text-center flex flex-col items-center">
                        <FaFileImage size={40} className="mb-2" />
                        <span className="text-xs font-semibold">No Logo Selected</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Upload New Logo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={logoUploading}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--primary-color)]/10 file:text-[var(--primary-color)] hover:file:bg-[var(--primary-color)]/25 cursor-pointer file:cursor-pointer"
                      />
                      {logoUploading && <p className="text-xs text-primary-600 font-semibold animate-pulse mt-1">Uploading logo...</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Logo Width (px)</label>
                        <input 
                          type="number"
                          value={logoWidthInput}
                          onChange={(e) => setLogoWidthInput(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Logo Height (px)</label>
                        <input 
                          type="number"
                          value={logoHeightInput}
                          onChange={(e) => setLogoHeightInput(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name, Theme Color, and Prefix */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Clinic / Hospital Name *</label>
                    <input 
                      type="text" 
                      required
                      value={clinicNameInput}
                      onChange={(e) => setClinicNameInput(e.target.value)}
                      placeholder="e.g. Sumitra Homeopathy Clinic"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Theme / Brand Color</label>
                    <div className="flex gap-3 items-center">
                      <input 
                        type="color" 
                        value={themeColorInput}
                        onChange={(e) => setThemeColorInput(e.target.value)}
                        className="w-12 h-12 bg-transparent border border-slate-200 rounded-lg cursor-pointer p-0.5"
                      />
                      <input 
                        type="text" 
                        value={themeColorInput}
                        onChange={(e) => setThemeColorInput(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Patient ID Prefix *</label>
                    <input 
                      type="text" 
                      required
                      value={patientPrefixInput}
                      onChange={(e) => setPatientPrefixInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                      placeholder="e.g. SUM (A-Z only)"
                      maxLength={10}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-bold text-slate-700"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Used for patient IDs (e.g. {patientPrefixInput || "P"}-10234)</span>
                  </div>
                </div>

                {/* Contact and Address */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Contact Phone Number</label>
                    <input 
                      type="text" 
                      value={clinicPhoneInput}
                      onChange={(e) => setClinicPhoneInput(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Clinic Address</label>
                    <input 
                      type="text" 
                      value={clinicAddressInput}
                      onChange={(e) => setClinicAddressInput(e.target.value)}
                      placeholder="e.g. 123 Health Street, City Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                    />
                  </div>
                </div>

                {/* Clinic details */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Clinic Details / Slogan</label>
                  <textarea 
                    rows="3"
                    value={clinicDetailsInput}
                    onChange={(e) => setClinicDetailsInput(e.target.value)}
                    placeholder="Describe your clinic services or write a short slogan..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={brandingSaving}
                  className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {brandingSaving ? "Saving Settings..." : "Save Configuration"}
                </button>

              </form>
            </div>
          )}

          {/* ================= TAB: LEAVES RECORD ================= */}
          {activeTab === "leaves" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
              {/* RECORD LEAVE FORM */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FaPlus className="text-[var(--primary-color)] text-sm" /> Record Doctor Leave
                </h3>
                <form onSubmit={handleAddLeaveAdmin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Select Doctor *</label>
                    <select
                      required
                      value={leaveDoctorId}
                      onChange={(e) => setLeaveDoctorId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-bold text-slate-700"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization || "General"})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Reason / Remarks</label>
                    <textarea
                      rows="3"
                      placeholder="Remarks regarding doctor leave..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition resize-none font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-color)] text-white font-bold py-3.5 rounded-xl transition shadow disabled:opacity-50"
                  >
                    {submittingLeave ? "Saving..." : "Record Leave"}
                  </button>
                </form>
              </div>

              {/* LEAVES RECORD TABLE */}
              <div className="xl:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Doctor Leaves Log</h3>
                    <p className="text-slate-500 text-xs mt-1">Complete history and track record of doctor leaves across the clinic.</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search by doctor name..."
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold animate-fadeIn"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  </div>
                </div>

                {loadingLeaves ? (
                  <p className="text-slate-400 text-center py-10 font-medium">Loading leaves track record...</p>
                ) : filteredLeaves.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 font-medium">No leave records found.</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm/50 animate-fadeIn">
                    <table className="w-full text-left text-sm text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider bg-slate-50/50">
                          <th className="p-4">Doctor Name</th>
                          <th className="p-4">Leave Dates</th>
                          <th className="p-4">Total Days</th>
                          <th className="p-4">Reason / Remarks</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-xs text-slate-800">
                        {filteredLeaves.map((lv) => {
                          const cleanStart = String(lv.start_date).split("T")[0];
                          const cleanEnd = String(lv.end_date).split("T")[0];

                          // Parse local time midnight
                          const date1 = new Date(cleanStart + "T00:00:00");
                          const date2 = new Date(cleanEnd + "T00:00:00");
                          const diffTime = Math.abs(date2 - date1);
                          const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                          // Display helpers
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const formatDisplay = (dStr) => {
                            const parts = dStr.split("-");
                            if (parts.length !== 3) return dStr;
                            return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
                          };

                          const formattedStart = formatDisplay(cleanStart);
                          const formattedEnd = formatDisplay(cleanEnd);

                          // End of active day comparison (inclusive of the whole last day)
                          const endDateBoundary = new Date(cleanEnd + "T23:59:59");
                          const isFutureOrActive = endDateBoundary >= new Date();

                          return (
                            <tr key={lv.id} className="hover:bg-slate-55/30 transition">
                              <td className="p-4 text-slate-900 font-bold">
                                {lv.doctor_name}
                              </td>
                              <td className="p-4 text-slate-700">
                                {formattedStart} <span className="text-slate-400 font-normal">to</span> {formattedEnd}
                              </td>
                              <td className="p-4 text-slate-700">{totalDays} days</td>
                              <td className="p-4 text-slate-500 max-w-xs truncate" title={lv.reason}>{lv.reason || "N/A"}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${lv.status === "Approved" ? "bg-green-50 text-green-700 border border-green-150" : "bg-red-50 text-red-700 border border-red-150"}`}>
                                  {lv.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                {isFutureOrActive && lv.status === "Approved" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingLeave({
                                          id: lv.id,
                                          doctor_name: lv.doctor_name,
                                          start_date: cleanStart,
                                          end_date: cleanEnd,
                                          reason: lv.reason || ""
                                        });
                                        setIsLeaveEditModalOpen(true);
                                      }}
                                      className="text-secondary-600 hover:text-secondary-800 text-xs px-2.5 py-1.5 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition"
                                      title="Edit Leave Details"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleCancelLeave(lv.id)}
                                      className="text-red-500 hover:text-red-700 text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition animate-fadeIn"
                                      title="Cancel/Delete Leave"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EDIT STAFF MODAL OVERLAY */}
      {isStaffEditModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-[32px] p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button
              onClick={() => {
                setIsStaffEditModalOpen(false);
                setEditingStaffId(null);
                setEditingStaff(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition"
            >
              <FaTimes className="text-lg" />
            </button>

            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2.5">
              <FaEdit className="text-[var(--primary-hover)]" /> Edit Staff Member
            </h3>

            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Role *</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                >
                  <option value="Receptionist">Receptionist</option>
                  <option value="Peon">Peon</option>
                  <option value="Employee">Employee (General)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Phone / Mobile *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.mobile}
                  onChange={(e) => setEditingStaff({ ...editingStaff, mobile: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-extrabold text-[var(--primary-color)] mb-2 uppercase tracking-wide">Login Credentials (Optional)</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="e.g. rahul_receptionist"
                      value={editingStaff.username}
                      onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Password (Leave blank to keep current)</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={editingStaff.password}
                      onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 rounded-xl transition shadow mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCTOR MODAL OVERLAY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-[32px] p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 animate-fadeIn">
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                // Clear password input
                setDocPassword("");
                setEditingDoctor(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-2 hover:bg-slate-50 rounded-full"
            >
              <FaTimes size={16} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3">
              <FaEdit className="text-[var(--primary-color)]" /> Edit Doctor Configuration
            </h3>

            <form onSubmit={handleUpdateDoctorSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Doctor Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaUser /></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sumitra"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaMobileAlt /></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* CREDENTIALS SECTION */}
              <div className="p-4 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-[var(--primary-color)] block">Doctor Login Credentials</span>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sharmadoc"
                    value={docUsername}
                    onChange={(e) => setDocUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    placeholder="Enter new password if changing"
                    value={docPassword}
                    onChange={(e) => setDocPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Specializations</label>
                <div className="grid grid-cols-2 gap-2 mt-1 border border-slate-200 bg-slate-50/50 p-3 rounded-xl max-h-44 overflow-y-auto">
                    {DOCTOR_SPECIALIZATION_OPTIONS.map((name) => {
                      const isChecked = selectedDiseases.includes(name);
                      return (
                        <label key={name} className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer hover:text-slate-800">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedDiseases(selectedDiseases.filter((selectedName) => selectedName !== name));
                              } else {
                                setSelectedDiseases([...selectedDiseases, name]);
                              }
                            }}
                            className="rounded text-[var(--primary-hover)] focus:ring-[var(--primary-color)]/30 h-3.5 w-3.5"
                          />
                          {name}
                        </label>
                      );
                    })}
                  </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Fees (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                />
              </div>

              {/* Morning Shift Timings */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMorningShift}
                    onChange={(e) => setHasMorningShift(e.target.checked)}
                    className="rounded text-[var(--primary-hover)] focus:ring-[var(--primary-color)]/30 h-4 w-4"
                  />
                  Morning Shift
                </label>
                {hasMorningShift && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Start Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10:00 AM"
                        value={morningStartTime}
                        onChange={(e) => setMorningStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">End Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 01:00 PM"
                        value={morningEndTime}
                        onChange={(e) => setMorningEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Evening Shift Timings */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEveningShift}
                    onChange={(e) => setHasEveningShift(e.target.checked)}
                    className="rounded text-[var(--primary-hover)] focus:ring-[var(--primary-color)]/30 h-4 w-4"
                  />
                  Evening Shift
                </label>
                {hasEveningShift && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Start Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 05:00 PM"
                        value={eveningStartTime}
                        onChange={(e) => setEveningStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">End Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 08:00 PM"
                        value={eveningEndTime}
                        onChange={(e) => setEveningEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-255 focus:border-[var(--primary-color)] rounded-lg text-xs outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[var(--primary-hover)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 rounded-xl transition shadow active:scale-95 text-sm"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAVE MODAL OVERLAY (ADMIN) */}
      {isLeaveEditModalOpen && editingLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 animate-fadeIn">
            <button
              onClick={() => {
                setIsLeaveEditModalOpen(false);
                setEditingLeave(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-650 p-2 hover:bg-slate-50 rounded-full transition"
            >
              <FaTimes className="text-lg" />
            </button>

            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2.5">
              <FaEdit className="text-[var(--primary-hover)]" /> Edit Doctor Leave
            </h3>

            <form onSubmit={handleUpdateLeaveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Doctor Name</label>
                <input
                  type="text"
                  disabled
                  value={editingLeave.doctor_name}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm outline-none font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={editingLeave.start_date}
                  onChange={(e) => setEditingLeave({ ...editingLeave, start_date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={editingLeave.end_date}
                  onChange={(e) => setEditingLeave({ ...editingLeave, end_date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Reason / Remarks</label>
                <textarea
                  rows="3"
                  value={editingLeave.reason || ""}
                  onChange={(e) => setEditingLeave({ ...editingLeave, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition resize-none font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-color)] text-white font-bold py-3.5 rounded-xl transition shadow mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { useBranding } from "../../context/BrandingContext";
import axios from "axios";
import { FaUserMd, FaCalendarCheck, FaSearch, FaNotesMedical, FaHeartbeat, FaPrescriptionBottle, FaSignOutAlt, FaFolderOpen, FaArrowRight, FaBookMedical, FaClock, FaHistory, FaPlus, FaTimes, FaPhone, FaTrash, FaEdit } from "react-icons/fa";
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
  } catch (e) { }
  return medsJson;
};

const getLocalDateString = (d) => {
  if (!d) return "";
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DoctorDashboard = () => {
  const { branding, fetchBranding } = useBranding();
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientProfile, setPatientProfile] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("today"); // 'today', 'all', 'complete'
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickPatientId, setQuickPatientId] = useState("");

  const [activeTab, setActiveTab] = useState("consultations"); // 'consultations', 'shifts'
  const [workingDays, setWorkingDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("01:00 PM");
  const [morningStartTime, setMorningStartTime] = useState("10:00 AM");
  const [morningEndTime, setMorningEndTime] = useState("01:00 PM");
  const [eveningStartTime, setEveningStartTime] = useState("05:00 PM");
  const [eveningEndTime, setEveningEndTime] = useState("08:00 PM");
  const [hasMorningShift, setHasMorningShift] = useState(true);
  const [hasEveningShift, setHasEveningShift] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);
  const [savingShifts, setSavingShifts] = useState(false);

  // Prescription Form States
  const [prescriptionRows, setPrescriptionRows] = useState([
    { name: "", dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" }
  ]);
  const [notes, setNotes] = useState("");
  const [chiefComplaints, setChiefComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [examinationNotes, setExaminationNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [category, setCategory] = useState("Opd Paying");
  const [address, setAddress] = useState("");
  const [nextOfKin, setNextOfKin] = useState("-");
  const [visitType, setVisitType] = useState("New Complaints");
  const [referredBy, setReferredBy] = useState("-");
  const [occupation, setOccupation] = useState("-");
  const [visitValidity, setVisitValidity] = useState("10 Days");

  const addRow = () => {
    setPrescriptionRows([
      ...prescriptionRows,
      { name: "", dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" }
    ]);
  };

  const removeRow = (index) => {
    if (prescriptionRows.length === 1) return;
    setPrescriptionRows(prescriptionRows.filter((_, idx) => idx !== index));
  };

  const updateRowField = (index, field, value) => {
    const updated = prescriptionRows.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setPrescriptionRows(updated);
  };

  // Vitals Form States
  const [bloodPressure, setBloodPressure] = useState("");
  const [weight, setWeight] = useState("");
  const [currentCondition, setCurrentCondition] = useState("Stable");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Medicines Autocomplete States
  const [medicinesMaster, setMedicinesMaster] = useState([]);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineGenericName, setNewMedicineGenericName] = useState("");
  const [newMedicineDescription, setNewMedicineDescription] = useState("");

  // Leaves States
  const [leaves, setLeaves] = useState([]);
  const [newLeaveStart, setNewLeaveStart] = useState("");
  const [newLeaveEnd, setNewLeaveEnd] = useState("");
  const [newLeaveReason, setNewLeaveReason] = useState("");
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [isLeaveEditModalOpen, setIsLeaveEditModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

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
      fetchMedicinesMaster();
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
      fetchMedicinesMaster();
    } catch (err) {
      alert("Error deactivating medicine: " + (err.response?.data?.error || err.message));
      console.error("Error deactivating medicine:", err);
    }
  };
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const doctorId = localStorage.getItem("doctorId");
  const doctorName = localStorage.getItem("doctorName");

  useEffect(() => {
    if (!doctorId) {
      window.location.href = "/login";
      return;
    }
    loadData();
    fetchDoctorProfile();
    fetchMedicinesMaster();
    fetchLeaves();
  }, [doctorId]);

  const fetchMedicinesMaster = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/medicines`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMedicinesMaster(res.data || []);
    } catch (err) {
      console.error("Error fetching medicines master: ", err);
    }
  };

  const fetchLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setLeaves(res.data || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!newLeaveStart || !newLeaveEnd) {
      alert("Please select both Start Date and End Date.");
      return;
    }
    setSubmittingLeave(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves`,
        {
          startDate: newLeaveStart,
          endDate: newLeaveEnd,
          reason: newLeaveReason
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Leave applied successfully!");
      setNewLeaveStart("");
      setNewLeaveEnd("");
      setNewLeaveReason("");
      fetchLeaves();
    } catch (err) {
      console.error("Error applying leave:", err);
      alert(err.response?.data?.error || "Failed to apply leave");
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

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leaves/${leaveId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Leave cancelled successfully!");
      fetchLeaves();
    } catch (err) {
      console.error("Error cancelling leave:", err);
      alert(err.response?.data?.error || "Failed to cancel leave");
    }
  };

  const getFilteredSuggestions = (query) => {
    if (!query || typeof query !== "string") return [];
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length === 0) return [];

    const startsWith = [];
    const contains = [];
    const subsequence = [];

    const isSubsequence = (q, text) => {
      let qIdx = 0;
      for (let tIdx = 0; tIdx < text.length; tIdx++) {
        if (text[tIdx] === q[qIdx]) {
          qIdx++;
          if (qIdx === q.length) return true;
        }
      }
      return false;
    };

    medicinesMaster.forEach((med) => {
      const name = (med.medicine_name || "").toLowerCase();
      const generic = (med.generic_name || "").toLowerCase();

      if (name.startsWith(cleanQuery) || generic.startsWith(cleanQuery)) {
        startsWith.push(med);
      } else if (name.includes(cleanQuery) || generic.includes(cleanQuery)) {
        contains.push(med);
      } else if (isSubsequence(cleanQuery, name) || isSubsequence(cleanQuery, generic)) {
        subsequence.push(med);
      }
    });

    const allResults = [...startsWith, ...contains, ...subsequence];
    const uniqueResults = [];
    const seenIds = new Set();
    for (const item of allResults) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueResults.push(item);
      }
    }

    return uniqueResults.slice(0, 10);
  };

  const loadData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctor/appointments?doctorId=${doctorId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error loading doctor appointments: ", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const currentDoc = res.data.find(d => String(d.id) === String(doctorId));
      if (currentDoc) {
        if (currentDoc.admin_id) {
          fetchBranding(currentDoc.admin_id);
        }
      }
      if (currentDoc && currentDoc.availability) {
        setWorkingDays(currentDoc.availability.days || []);
        setStartTime(currentDoc.availability.startTime || "10:00 AM");
        setEndTime(currentDoc.availability.endTime || "01:00 PM");
        setMorningStartTime(currentDoc.availability.morningStartTime || "10:00 AM");
        setMorningEndTime(currentDoc.availability.morningEndTime || "01:00 PM");
        setEveningStartTime(currentDoc.availability.eveningStartTime || "05:00 PM");
        setEveningEndTime(currentDoc.availability.eveningEndTime || "08:00 PM");
        setHasMorningShift(currentDoc.availability.morningStartTime ? true : false);
        setHasEveningShift(currentDoc.availability.eveningStartTime ? true : false);
        setSlotDuration(currentDoc.availability.slotDuration || 30);
      }
    } catch (err) {
      console.error("Error fetching doctor profile details:", err);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(`Appointment status updated to ${status}`);
      loadData();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to update status.");
    }
  };

  const handleSaveShifts = async (e) => {
    e.preventDefault();
    setSavingShifts(true);
    try {
      if (!hasMorningShift && !hasEveningShift) {
        alert("Please enable at least one shift (Morning or Evening).");
        setSavingShifts(false);
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctor/shifts`,
        {
          doctorId,
          days: workingDays,
          startTime: hasMorningShift ? morningStartTime : (eveningStartTime || "05:00 PM"),
          endTime: hasMorningShift ? morningEndTime : (eveningEndTime || "08:00 PM"),
          morningStartTime: hasMorningShift ? morningStartTime : null,
          morningEndTime: hasMorningShift ? morningEndTime : null,
          eveningStartTime: hasEveningShift ? eveningStartTime : null,
          eveningEndTime: hasEveningShift ? eveningEndTime : null,
          slotDuration,
          blockedDates: []
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Shift and availability settings saved successfully!");
      fetchDoctorProfile();
    } catch (err) {
      console.error("Error saving shifts schedule:", err);
      alert("Failed to save shift configuration.");
    } finally {
      setSavingShifts(false);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/search?q=${query}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Error searching patients: ", err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const loadPatientProfile = async (patId, assocAppointmentId = null, autoAssociate = true) => {
    setSelectedPatientId(patId);
    setSearchQuery("");
    setSearchResults([]);

    if (assocAppointmentId) {
      setActiveAppointmentId(assocAppointmentId);
    } else if (autoAssociate) {
      // Find matching approved appointment for this patient under this doctor
      // Prefer today's or past/missing appointments
      const currentTodayStr = getLocalDateString(new Date());
      const matchingAp = appointments.find(
        (ap) =>
          ap.patient_id === patId &&
          ap.status === "Approved" &&
          getLocalDateString(ap.date) <= currentTodayStr
      ) || appointments.find(
        (ap) =>
          ap.patient_id === patId &&
          ap.status === "Approved"
      );
      if (matchingAp) {
        setActiveAppointmentId(matchingAp.id);
      } else {
        setActiveAppointmentId(null);
      }
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/profile/${patId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        setPatientProfile(res.data);
        // Pre-fill latest vitals if available
        if (res.data.latestVitals) {
          setBloodPressure(res.data.latestVitals.blood_pressure || "");
          setWeight(res.data.latestVitals.weight || "");
          setCurrentCondition(res.data.latestVitals.current_condition || "Stable");
        } else {
          setBloodPressure("");
          setWeight("");
          setCurrentCondition("Stable");
        }
        setPrescriptionRows([{ name: "", dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" }]);
        setNotes("");
        setChiefComplaints("");
        setDiagnosis("");
        setExaminationNotes("");
        setObservations("");
        setAdvice("");
        setFollowUpNotes("");
        setCategory(res.data.profile?.category || "Opd Paying");
        setAddress(res.data.profile?.address || "");
        setNextOfKin(res.data.profile?.next_of_kin || "-");
        setVisitType("New Complaints");
        setReferredBy(res.data.profile?.referred_by || "-");
        setOccupation(res.data.profile?.occupation || "-");
        setVisitValidity(res.data.profile?.visit_validity || "10 Days");
        setFollowUpDate("");
      }
    } catch (err) {
      console.error("Error loading patient profile: ", err);
      alert("Error loading patient records");
    }
  };

  const resolveAndLoadPatientProfile = async (ap) => {
    setActiveAppointmentId(ap.id);
    if (ap.patient_id) {
      loadPatientProfile(ap.patient_id, ap.id);
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/resolve-or-create`,
        {
          booking_id: ap.booking_id,
          patient_name: ap.patient_name,
          mobile: ap.mobile
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success && res.data.patient_id) {
        await loadData();
        loadPatientProfile(res.data.patient_id, ap.id);
      } else {
        alert("Could not resolve patient ID for this consultation.");
      }
    } catch (err) {
      console.error("Error resolving patient ID: ", err);
      alert("Error resolving patient ID.");
    }
  };

  const handleQuickFetch = async () => {
    if (!quickPatientId.trim()) {
      alert("Please enter a Patient ID first.");
      return;
    }
    await loadPatientProfile(quickPatientId.trim().toUpperCase());
    setQuickPatientId("");
  };

  const handleSubmitTreatment = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Please select a patient first");
      return;
    }
    if (prescriptionRows.some((row) => !row.name.trim())) {
      alert("Please enter medicine names in all prescription rows.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit Prescription
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/prescriptions/add`,
        {
          patient_id: selectedPatientId,
          doctor_id: doctorId,
          medicines: JSON.stringify(prescriptionRows),
          dosage: prescriptionRows.map((r) => r.dosage).join(", "),
          instructions: prescriptionRows.map((r) => r.instructions).join(", "),
          notes: notes,
          chief_complaints: chiefComplaints,
          diagnosis: diagnosis,
          examination_notes: examinationNotes,
          observations: observations,
          advice: advice,
          follow_up_date: followUpDate || null,
          follow_up_notes: followUpNotes,
          category: category,
          address: address,
          next_of_kin: nextOfKin,
          visit_type: visitType,
          referred_by: referredBy,
          occupation: occupation,
          visit_validity: visitValidity
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // 2. Submit Health Record (Vitals & Status)
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/health-records/add`,
        {
          patient_id: selectedPatientId,
          blood_pressure: bloodPressure,
          weight,
          current_condition: currentCondition,
          follow_up_date: followUpDate || null
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // 3. Mark Appointment as Completed (if clicked from Consultation List or auto-resolved)
      let appointmentIdToComplete = activeAppointmentId;
      if (!appointmentIdToComplete && selectedPatientId) {
        const currentTodayStr = getLocalDateString(new Date());
        const matchingAp = appointments.find(
          (ap) =>
            ap.patient_id === selectedPatientId &&
            ap.status === "Approved" &&
            getLocalDateString(ap.date) <= currentTodayStr
        ) || appointments.find(
          (ap) =>
            ap.patient_id === selectedPatientId &&
            ap.status === "Approved"
        );
        if (matchingAp) {
          appointmentIdToComplete = matchingAp.id;
        }
      }

      if (appointmentIdToComplete) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments/${appointmentIdToComplete}`,
          { status: "Completed" },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setActiveAppointmentId(null);
      }

      alert("Prescription & Vitals updated successfully!");
      setPrescriptionRows([{ name: "", dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" }]);
      setNotes("");
      setChiefComplaints("");
      setDiagnosis("");
      setExaminationNotes("");
      setObservations("");
      setAdvice("");
      setFollowUpNotes("");
      setCategory("Opd Paying");
      setAddress("");
      setNextOfKin("-");
      setVisitType("New Complaints");
      setReferredBy("-");
      setOccupation("-");
      setVisitValidity("10 Days");
      setBloodPressure("");
      setWeight("");
      setCurrentCondition("Stable");
      setFollowUpDate("");
      // Reload profile to reflect updates in history logs
      loadPatientProfile(selectedPatientId, null, false);
      loadData();
    } catch (err) {
      console.error("Error submitting treatment: ", err);
      alert("Error saving records. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const todayStr = getLocalDateString(new Date());

  const isSlotInPast = (dateStr, slotStr) => {
    if (!slotStr) return false;
    try {
      const [time, modifier] = slotStr.split(" ");
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      if (modifier === "PM" && hours < 12) {
        hours += 12;
      }
      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }
      const parts = dateStr.split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const apDateTime = new Date(year, month, day, hours, minutes, 0, 0);
      return apDateTime < new Date();
    } catch (e) {
      return dateStr < todayStr;
    }
  };

  const filteredAppointments = appointments.filter((ap) => {
    const apDate = getLocalDateString(ap.date);
    const inPast = isSlotInPast(apDate, ap.appointment_time);
    
    if (activeSubTab === "today") {
      return apDate === todayStr && ap.status === "Approved" && !inPast;
    }
    if (activeSubTab === "all") {
      return ap.status === "Approved" && (apDate > todayStr || (apDate === todayStr && !inPast));
    }
    if (activeSubTab === "complete") {
      return ap.status === "Completed";
    }
    if (activeSubTab === "missing") {
      return ap.status === "Approved" && (apDate < todayStr || (apDate === todayStr && inPast));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: branding.theme_color || "#00875A" }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-lg border border-white/40 p-10 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 border-4 border-slate-100 rounded-full animate-spin" style={{ borderTopColor: branding.theme_color || "#00875A" }}></div>
          <div className="text-center">
            <h3 className="text-slate-800 font-black tracking-tight text-sm">Loading Doctor Desk</h3>
            <p className="text-slate-400 font-bold animate-pulse text-[11px] mt-1.5">Synchronizing schedule rosters...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER BANNER */}
      <nav className="bg-[var(--primary-dark)] text-white shadow-md py-4 px-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt="Logo"
              className="object-contain rounded-lg"
              style={{
                width: branding.logo_width ? `${branding.logo_width}px` : "36px",
                height: branding.logo_height ? `${branding.logo_height}px` : "36px",
                maxWidth: "120px",
                maxHeight: "60px"
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-[var(--primary-hover)] flex items-center justify-center rounded-xl font-bold text-white text-lg">
              {branding.clinic_name ? branding.clinic_name.charAt(0) : "D"}
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg sm:text-xl truncate max-w-[200px]" title={branding.clinic_name || "Sumitra Clinic"}>
              {branding.clinic_name || "Sumitra Clinic"}
            </h1>
            <p className="text-xs text-white/80">Doctor Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-xl text-xs sm:text-sm font-bold transition shadow"
          >
            Back to Home
          </a>
          <span className="hidden md:inline text-sm font-semibold text-white/90">
            Logged in: <span className="text-white font-bold">{doctorName}</span> (ID: {doctorId})
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-xl text-xs sm:text-sm font-bold transition shadow"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {/* TABS SUB-HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-10 flex gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("consultations")}
            className={`py-4 px-2 border-b-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${activeTab === "consultations"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Consultations Desk
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`py-4 px-2 border-b-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${activeTab === "shifts"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Shift & Availability Settings
          </button>
          <button
            onClick={() => setActiveTab("medicines")}
            className={`py-4 px-2 border-b-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${activeTab === "medicines"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Medicine Master
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`py-4 px-2 border-b-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${activeTab === "leaves"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Leaves Desk
          </button>
        </div>
      </div>

      {activeTab === "consultations" && (
        <div className="flex-grow max-w-7xl w-full mx-auto p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: APPOINTMENTS & SEARCH (5 COLS) */}
          <div className="lg:col-span-5 space-y-8">

            {/* PATIENT SEARCH LOOKUP CARD */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-[var(--primary-hover)]" /> Patient Search Lookup
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Patient ID, Name, or Mobile..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-2xl text-xs sm:text-sm outline-none transition font-semibold text-slate-700"
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* SEARCH RESULTS DROPDOWN */}
              {searchResults.length > 0 && (
                <div className="absolute left-6 right-6 mt-2 bg-white border rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y">
                  {searchResults.map((pat) => (
                    <div
                      key={pat.patient_id}
                      onClick={() => loadPatientProfile(pat.patient_id)}
                      className="p-3.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{pat.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400">ID: {pat.patient_id} • Phone: {pat.mobile}</p>
                      </div>
                      <FaArrowRight className="text-slate-300 text-xs" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REAPPOINTMENT LOOKUP CARD */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaHistory className="text-[var(--primary-hover)] animate-spin-slow" /> Reappointment Lookup
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Patient ID (e.g., PAT93142)..."
                  value={quickPatientId}
                  onChange={(e) => setQuickPatientId(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleQuickFetch}
                  className="bg-[var(--primary-hover)] hover:bg-[var(--primary-color)] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 shadow-sm"
                >
                  Fetch
                </button>
              </div>
            </div>

            {/* APPOINTMENT SCHEDULER BOARD */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FaCalendarCheck className="text-[var(--primary-hover)]" /> Consultation List
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold text-slate-500">
                  <button
                    onClick={() => setActiveSubTab("today")}
                    className={`px-3 py-1.5 rounded-lg ${activeSubTab === "today" ? "bg-white text-[var(--primary-color)] shadow-sm" : ""}`}
                  >
                    Today's
                  </button>
                  <button
                    onClick={() => setActiveSubTab("all")}
                    className={`px-3 py-1.5 rounded-lg ${activeSubTab === "all" ? "bg-white text-[var(--primary-color)] shadow-sm" : ""}`}
                  >
                    All Assigned
                  </button>
                  <button
                    onClick={() => setActiveSubTab("complete")}
                    className={`px-3 py-1.5 rounded-lg ${activeSubTab === "complete" ? "bg-white text-[var(--primary-color)] shadow-sm" : ""}`}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => setActiveSubTab("missing")}
                    className={`px-3 py-1.5 rounded-lg ${activeSubTab === "missing" ? "bg-white text-[var(--primary-color)] shadow-sm" : ""}`}
                  >
                    Missing
                  </button>
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                  No appointments found for this filter.
                </div>
              ) : (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {filteredAppointments.map((ap) => (
                    <div
                      key={ap.id}
                      onClick={() => resolveAndLoadPatientProfile(ap)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${selectedPatientId === ap.patient_id
                          ? "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/45 shadow-sm ring-1 ring-[var(--primary-color)]/10"
                          : "bg-white border-slate-150 hover:bg-slate-50/30"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{ap.patient_name}</h4>
                          <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                            ID: {ap.patient_id}
                            {ap.patient_password && !(ap.patient_password.startsWith("$2a$") || ap.patient_password.startsWith("$2b$") || ap.patient_password.startsWith("$2y$")) && ` • Pass: ${ap.patient_password}`}
                          </p>
                          {activeSubTab === "missing" ? (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <a
                                href={`tel:${ap.mobile}`}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 hover:bg-amber-200 transition shadow-sm"
                              >
                                <FaPhone className="text-[8px]" /> Call: {ap.mobile}
                              </a>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-450 font-bold">Phone: {ap.mobile}</p>
                          )}
                          <p className="text-[10px] text-[var(--primary-color)] font-bold mt-1">Symptom: {ap.patient_diseases || "General Consultation"}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${ap.status === "Approved" ? "bg-green-50 text-green-700 border border-green-100" :
                            ap.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                          {ap.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/50 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><FaClock className="text-slate-400" /> {ap.appointment_time || "10:00 AM"}</span>
                        <span>Date: {new Date(ap.date).toLocaleDateString()}</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: MEDICAL WORKSPACE (7 COLS) */}
          <div className="lg:col-span-7">
            {patientProfile ? (
              <div className="space-y-8 animate-fadeIn">

                {/* PATIENT BRIEF DETAILS */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{patientProfile.profile.name}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">Patient ID: {patientProfile.profile.patient_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/patient/${patientProfile.profile.patient_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                      >
                        <FaFolderOpen /> Invoice
                      </a>
                      <a
                        href={`/patient/report/${patientProfile.profile.patient_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[var(--primary-color)] bg-[var(--primary-color)]/10 hover:bg-[var(--primary-color)]/20 px-3 py-2 rounded-xl border border-[var(--primary-color)]/20 transition flex items-center gap-1.5"
                      >
                        <FaBookMedical /> OPD & Prescription
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-xs font-bold text-slate-600">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Age</span>
                      {patientProfile.profile.age || "N/A"} years
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Gender</span>
                      {patientProfile.profile.gender || "N/A"}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Mobile</span>
                      {patientProfile.profile.mobile}
                    </div>
                  </div>
                </div>

                {/* PREVIOUS APPOINTMENT & REAPPOINTMENT DATA CARD */}
                {patientProfile.prescriptions && patientProfile.prescriptions.length > 0 ? (
                  <div className="bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 p-5 rounded-3xl">
                    <h4 className="text-xs font-bold text-[var(--primary-hover)] mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <FaHistory className="text-[var(--primary-hover)]" /> Previous Visit & Reappointment Info
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-750 leading-normal">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm/50">
                        <span className="text-[10px] text-slate-400 block font-black mb-0.5 uppercase tracking-wider">Last Visit Date</span>
                        {new Date(patientProfile.prescriptions[0].created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm/50">
                        <span className="text-[10px] text-slate-400 block font-black mb-0.5 uppercase tracking-wider">Attending Doctor</span>
                        Dr. {patientProfile.prescriptions[0].doctor_name}
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm/50 sm:col-span-2">
                        <span className="text-[10px] text-slate-400 block font-black mb-0.5 uppercase tracking-wider">Previous Diagnosis & Notes</span>
                        <p className="text-slate-800 mt-1 font-extrabold">{patientProfile.prescriptions[0].notes || "No diagnosis logged"}</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm/50 sm:col-span-2">
                        <span className="text-[10px] text-slate-400 block font-black mb-0.5 uppercase tracking-wider">Medicines Prescribed</span>
                        <div className="text-[var(--primary-color)] mt-1 font-black">{formatMedicinesForDisplay(patientProfile.prescriptions[0].medicines)}</div>
                      </div>
                      {patientProfile.prescriptions[0].follow_up_date && (
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm/50">
                          <span className="text-[10px] text-slate-400 block font-black mb-0.5 uppercase tracking-wider">Follow-up / Reappointment Date</span>
                          <span className="text-[var(--primary-color)] font-extrabold">
                            {new Date(patientProfile.prescriptions[0].follow_up_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}
                      {patientProfile.prescriptions[0].follow_up_notes && (
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm/50">
                          <span className="text-[10px] text-slate-400 block font-black mb-0.5 uppercase tracking-wider">Follow-up Notes / Advice</span>
                          <span className="italic text-slate-600 font-medium">
                            "{patientProfile.prescriptions[0].follow_up_notes}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 p-5 rounded-3xl text-center text-xs font-bold text-slate-450 border-dashed">
                    No previous consultation data available for this patient.
                  </div>
                )}
                {/* DIAGNOSIS & PRESCRIPTION DESK FORM */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <FaNotesMedical className="text-[var(--primary-hover)]" /> Clinical Consultation Desk
                  </h3>
                  <form onSubmit={handleSubmitTreatment} className="space-y-6">
                    {/* 1. OPD & PATIENT METADATA SECTION */}
                    <div className="bg-slate-55 p-5 rounded-2xl border border-slate-150/50 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-2">OPD / Patient Metadata</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">OPD Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-bold text-slate-700"
                          >
                            <option value="Opd Paying">Opd Paying</option>
                            <option value="Opd Free">Opd Free</option>
                            <option value="Staff">Staff</option>
                            <option value="Special">Special</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Visit Type</label>
                          <select
                            value={visitType}
                            onChange={(e) => setVisitType(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-bold text-slate-700"
                          >
                            <option value="New Complaints">New Complaints</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Review">Review</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Visit Validity</label>
                          <input
                            type="text"
                            placeholder="e.g. 10 Days"
                            value={visitValidity}
                            onChange={(e) => setVisitValidity(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Referred By</label>
                          <input
                            type="text"
                            placeholder="Self / Dr. Name"
                            value={referredBy}
                            onChange={(e) => setReferredBy(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Patient Occupation</label>
                          <input
                            type="text"
                            placeholder="e.g. Engineer"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Next of Kin / Relation</label>
                          <input
                            type="text"
                            placeholder="Name / Relation"
                            value={nextOfKin}
                            onChange={(e) => setNextOfKin(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Patient Address</label>
                        <input
                          type="text"
                          placeholder="Current Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                        />
                      </div>
                    </div>

                    {/* 2. CLINICAL OBSERVATIONS & DIAGNOSIS */}
                    <div className="bg-slate-55 p-5 rounded-2xl border border-slate-150/50 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Clinical Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Chief Complaints</label>
                          <textarea
                            rows="2"
                            placeholder="Symptoms reported by patient..."
                            value={chiefComplaints}
                            onChange={(e) => setChiefComplaints(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Clinical Diagnosis</label>
                          <textarea
                            rows="2"
                            placeholder="Diagnosis identified by doctor..."
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Physical Observations / Findings</label>
                          <textarea
                            rows="2"
                            placeholder="Observations during inspection..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Examination / Investigations Notes</label>
                          <textarea
                            rows="2"
                            placeholder="E.g. Blood test recommended, X-Ray notes..."
                            value={examinationNotes}
                            onChange={(e) => setExaminationNotes(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. VITALS SECTION */}
                    <div className="bg-slate-55 p-5 rounded-2xl border border-slate-150/50 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Patient Vitals</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Blood Pressure</label>
                          <input
                            type="text"
                            placeholder="e.g. 120/80"
                            value={bloodPressure}
                            onChange={(e) => setBloodPressure(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Weight (kg)</label>
                          <input
                            type="text"
                            placeholder="e.g. 70"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Recovery status</label>
                          <select
                            value={currentCondition}
                            onChange={(e) => setCurrentCondition(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-bold text-slate-700"
                          >
                            <option value="Stable">Stable</option>
                            <option value="Improving">Improving</option>
                            <option value="Critical">Critical</option>
                            <option value="Recovered">Recovered</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Follow-up date</label>
                          <input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. PRESCRIPTION SHEET TABLE BUILDER */}
                    <div className="bg-slate-55 p-5 rounded-2xl border border-slate-150/50 space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Prescription Sheet</h4>
                        <button
                          type="button"
                          onClick={addRow}
                          className="flex items-center gap-1 text-[10px] bg-[#064e3b] hover:bg-[#043327] text-white px-2.5 py-1 rounded-lg font-bold transition shadow-sm"
                        >
                          <FaPlus size={8} /> Add Medicine
                        </button>
                      </div>

                      {/* Wide Suggestions Panel above Table */}
                      {activeSuggestionIndex !== -1 && (
                        <div className="border border-slate-200 bg-[#064e3b]/5 rounded-2xl p-4 space-y-3 animate-fadeIn print:hidden">
                          <h5 className="text-[10px] font-black text-[#064e3b] uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#064e3b] animate-pulse"></span>
                            Medicine Finder / Suggestions (Click to select)
                          </h5>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                            Searching for: "{suggestionQuery || 'all'}"
                          </div>
                          {getFilteredSuggestions(suggestionQuery).length === 0 ? (
                            <div className="text-slate-400 text-xs font-semibold py-2">
                              No matching medicines found in Medicine Master. You can type any custom name directly.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {getFilteredSuggestions(suggestionQuery).map((med, medIdx) => (
                                <button
                                  key={medIdx}
                                  type="button"
                                  onMouseDown={() => {
                                    updateRowField(activeSuggestionIndex, "name", med.medicine_name);
                                  }}
                                  className="w-full text-left p-3.5 rounded-xl border border-slate-150 bg-white hover:bg-primary-50/50 hover:border-primary-250 transition flex flex-col gap-0.5 active:scale-[0.98] shadow-sm animate-fadeIn"
                                >
                                  <span className="text-xs font-extrabold text-slate-800">{med.medicine_name}</span>
                                  {med.generic_name && (
                                    <span className="text-[9px] text-[#064e3b] font-bold">Generic: {med.generic_name}</span>
                                  )}
                                  {med.description && (
                                    <span className="text-[9px] text-slate-500 font-semibold line-clamp-2 mt-0.5 leading-relaxed">{med.description}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prescription Builder Table */}
                      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white animate-fadeIn">
                        <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-[#053528] text-white text-[9px] uppercase font-black tracking-wider">
                              <th className="p-2.5 text-center w-[35%]">MEDICINE *</th>
                              <th className="p-2.5 text-center w-[20%]">DOSAGE</th>
                              <th className="p-2.5 text-center w-[15%]">DURATION</th>
                              <th className="p-2.5 text-center w-[25%]">INSTRUCTIONS</th>
                              <th className="p-2.5 text-center w-[5%]"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-semibold">
                            {prescriptionRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-55/50 transition-colors">
                                <td className="p-2">
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Arnica 30"
                                    value={row.name}
                                    onChange={(e) => {
                                      updateRowField(idx, "name", e.target.value);
                                      setActiveSuggestionIndex(idx);
                                      setSuggestionQuery(e.target.value);
                                    }}
                                    onFocus={() => {
                                      setActiveSuggestionIndex(idx);
                                      setSuggestionQuery(row.name);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#064e3b] text-center font-bold"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. BD (After meal)"
                                    value={row.dosage}
                                    onChange={(e) => updateRowField(idx, "dosage", e.target.value)}
                                    onFocus={() => setActiveSuggestionIndex(-1)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#064e3b] text-center"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. 5 Days"
                                    value={row.duration}
                                    onChange={(e) => updateRowField(idx, "duration", e.target.value)}
                                    onFocus={() => setActiveSuggestionIndex(-1)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#064e3b] text-center font-mono"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. After meals"
                                    value={row.instructions}
                                    onChange={(e) => updateRowField(idx, "instructions", e.target.value)}
                                    onFocus={() => setActiveSuggestionIndex(-1)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#064e3b] text-center"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    disabled={prescriptionRows.length === 1}
                                    onClick={() => {
                                      removeRow(idx);
                                      setActiveSuggestionIndex(-1);
                                    }}
                                    className="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1"
                                  >
                                    <FaTimes />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 5. ADVICE & NOTES */}
                    <div className="bg-slate-55 p-5 rounded-2xl border border-slate-150/50 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Advice & Notes</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Doctor Advice / Directions</label>
                          <textarea
                            rows="2"
                            placeholder="General precautions, dietary advice, etc..."
                            value={advice}
                            onChange={(e) => setAdvice(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Internal Observational Notes (Private)</label>
                          <textarea
                            rows="2"
                            placeholder="Confidential comments, follow-up goals..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Follow-up Notes / Validity Directions</label>
                        <input
                          type="text"
                          placeholder="Notes regarding follow-up visit..."
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-color)] text-white font-bold py-3.5 rounded-2xl text-sm sm:text-base transition shadow active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FaBookMedical /> {submitting ? "Saving Patient Record..." : "Submit Prescription & OPD Record"}
                    </button>
                  </form>
                  <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <FaNotesMedical className="text-sky-700" /> Historical Consultations & Vitals Timeline
                  </h3>

                  {patientProfile.prescriptions.length === 0 ? (
                    <p className="text-slate-400 text-xs font-bold text-center py-6">No previous prescriptions recorded.</p>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {patientProfile.prescriptions.map((pr) => (
                        <div key={pr.id} className="border p-4 rounded-2xl bg-slate-50/20 hover:bg-slate-50/50 transition">
                          <div className="flex justify-between items-center border-b pb-2 mb-2 text-xs font-bold text-slate-500">
                            <span>Doctor: {pr.doctor_name}</span>
                            <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-2 text-xs font-semibold text-slate-650">
                            <div className="mb-2"><span className="text-slate-400 block mb-1">Medicines:</span> {formatMedicinesForDisplay(pr.medicines)}</div>
                            <p><span className="text-slate-400">Dosage:</span> {pr.dosage || "As advised"} • <span className="text-slate-450">Duration:</span> {pr.instructions || "N/A"}</p>
                            {pr.notes && <p className="italic text-slate-500">"{pr.notes}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-150 border-dashed rounded-3xl p-12 text-center h-full flex flex-col justify-center items-center">
                <FaFolderOpen className="text-slate-300 text-5xl mb-3" />
                <h4 className="font-bold text-slate-600 text-base">Workspace Idle</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">
                  Select a patient from the consultation list or use the lookup search to inspect records, write prescriptions, and log vitals.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "shifts" && (
        <div className="flex-grow max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-8 animate-fadeIn">
          <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Shift & Shift Management</h3>
              <p className="text-slate-500 text-xs mt-1">Configure your working days, hours, slot intervals, and record leaves/vacations.</p>
            </div>

            <form onSubmit={handleSaveShifts} className="space-y-6">

              {/* Working Days */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const isSelected = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setWorkingDays(workingDays.filter((d) => d !== day));
                          } else {
                            setWorkingDays([...workingDays, day]);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isSelected
                            ? "bg-[var(--primary-hover)] text-white border-[var(--primary-color)] shadow-sm"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Morning Shift Timings */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Start Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10:00 AM"
                        value={morningStartTime}
                        onChange={(e) => setMorningStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">End Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 01:00 PM"
                        value={morningEndTime}
                        onChange={(e) => setMorningEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Evening Shift Timings */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Start Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 05:00 PM"
                        value={eveningStartTime}
                        onChange={(e) => setEveningStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">End Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 08:00 PM"
                        value={eveningEndTime}
                        onChange={(e) => setEveningEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Duration */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] focus:bg-white rounded-xl text-sm font-bold outline-none transition text-slate-700"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              {/* Leaves are now managed in the dedicated Leaves tab */}

              {/* Submit btn */}
              <button
                type="submit"
                disabled={savingShifts}
                className="w-full mt-4 bg-[var(--primary-hover)] hover:bg-[var(--primary-color)] text-white font-bold py-3.5 rounded-2xl text-sm transition shadow active:scale-[0.98] disabled:opacity-50"
              >
                {savingShifts ? "Saving Schedule..." : "Save Shift Configuration"}
              </button>

            </form>
          </div>
        </div>
      )}
      {activeTab === "medicines" && (
        <div className="flex-grow max-w-7xl w-full mx-auto p-6 sm:p-10 grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
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
            {medicinesMaster.length === 0 ? (
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
                    {medicinesMaster.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 text-slate-400">#{m.id}</td>
                        <td className="py-3 text-slate-800">{m.medicine_name}</td>
                        <td className="py-3 text-slate-555">{m.generic_name || "N/A"}</td>
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

      {activeTab === "leaves" && (
        <div className="flex-grow max-w-7xl w-full mx-auto p-6 sm:p-10 grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
          {/* APPLY LEAVE FORM */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm h-fit">
            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FaPlus className="text-[var(--primary-color)] text-sm" /> Apply for Leave
            </h3>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={newLeaveStart}
                  onChange={(e) => setNewLeaveStart(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={newLeaveEnd}
                  onChange={(e) => setNewLeaveEnd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Reason / Notes</label>
                <textarea
                  rows="3"
                  placeholder="E.g. Attending a conference, personal emergency..."
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[var(--primary-color)] rounded-xl text-sm outline-none transition resize-none font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={submittingLeave}
                className="w-full bg-[var(--primary-hover)] hover:bg-[var(--primary-color)] text-white font-bold py-3 rounded-xl transition shadow disabled:opacity-50"
              >
                {submittingLeave ? "Applying..." : "Submit Leave Application"}
              </button>
            </form>
          </div>

          {/* LEAVE HISTORY TABLE */}
          <div className="xl:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-5">Leaves Track Record</h3>
            {loadingLeaves ? (
              <p className="text-slate-400 text-center py-10 font-medium">Loading leaves...</p>
            ) : leaves.length === 0 ? (
              <p className="text-slate-400 text-center py-10 font-medium">No leaves requested yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-xs font-bold">
                      <th className="pb-3">Duration Dates</th>
                      <th className="pb-3">Total Days</th>
                      <th className="pb-3">Reason</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-xs">
                    {leaves.map((lv) => {
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
                        <tr key={lv.id} className="hover:bg-slate-55/50 transition">
                          <td className="py-3 text-slate-800">
                            {formattedStart} <span className="text-slate-400 font-normal">to</span> {formattedEnd}
                          </td>
                          <td className="py-3 text-slate-700">{totalDays} days</td>
                          <td className="py-3 text-slate-500 max-w-xs truncate" title={lv.reason}>{lv.reason || "N/A"}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${lv.status === "Approved" ? "bg-green-50 text-green-700 border border-green-150" : "bg-red-50 text-red-700 border border-red-150"}`}>
                              {lv.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            {isFutureOrActive && lv.status === "Approved" && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingLeave({
                                      id: lv.id,
                                      start_date: cleanStart,
                                      end_date: cleanEnd,
                                      reason: lv.reason || ""
                                    });
                                    setIsLeaveEditModalOpen(true);
                                  }}
                                  className="text-secondary-600 hover:text-secondary-800 text-xs px-2.5 py-1.5 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition"
                                  title="Edit Leave Dates/Reason"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCancelLeave(lv.id)}
                                  className="text-red-500 hover:text-red-700 text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                  title="Cancel Leave"
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

      {/* EDIT LEAVE MODAL OVERLAY (DOCTOR) */}
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
              <FaEdit className="text-[var(--primary-hover)]" /> Edit Leave Entry
            </h3>

            <form onSubmit={handleUpdateLeaveSubmit} className="space-y-4">
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
                <label className="text-xs font-bold text-slate-500 block mb-1">Reason / Notes</label>
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

export default DoctorDashboard;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import defaultClinicLogo from "../../Images/Icon/default-clinic-logo.jpg";
import { useBranding } from "../../context/BrandingContext";
import {
  FaPlus,
  FaTrash,
  FaPrint,
  FaDownload,
  FaShareAlt,
  FaSave,
  FaChevronLeft,
  FaHistory,
  FaCheckCircle,
  FaFileMedical,
  FaBookMedical,
  FaFolderOpen
} from "react-icons/fa";

const PatientReportPage = () => {
  const { branding, fetchBranding } = useBranding();
  const { patientId } = useParams();

  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    if (adminId) {
      fetchBranding(adminId);
    }
  }, [adminId]);

  // Backend data
  const [profile, setProfile] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [isEditing, setIsEditing] = useState(false);

  // Custom logo state
  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem("globalClinicLogo") || null;
  });

  useEffect(() => {
    if (branding.logo_url) {
      setLogoUrl(branding.logo_url);
    }
  }, [branding.logo_url]);

  // Left Column Notes
  const [symptoms, setSymptoms] = useState("");
  const [complaints, setComplaints] = useState("");

  // Right Column Notes
  const [diagnosis, setDiagnosis] = useState("");
  const [observations, setObservations] = useState("");

  // Follow-up appointment states
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // OPD Metadata states
  const [category, setCategory] = useState("Opd Paying");
  const [address, setAddress] = useState("");
  const [nextOfKin, setNextOfKin] = useState("-");
  const [visitType, setVisitType] = useState("New Complaints");
  const [referredBy, setReferredBy] = useState("-");
  const [occupation, setOccupation] = useState("-");
  const [visitValidity, setVisitValidity] = useState("10 Days");

  const [prescriptionRows, setPrescriptionRows] = useState([
    { name: "Tab. Chymoral AP", dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" },
    { name: "Tab. Asonpaz 100", dosage: "OD (After meal)", duration: "5 Days", instructions: "After meals" },
    { name: "Tab. Zocuf 500 mg", dosage: "BD (After meal)", duration: "3 Days", instructions: "After meals" }
  ]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Medicines Autocomplete States
  const [medicinesMaster, setMedicinesMaster] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Doctor session check
  const doctorId = localStorage.getItem("doctorId");
  const doctorName = localStorage.getItem("doctorName") || "Dr. SANDEEP SHARMA";

  useEffect(() => {
    fetchPatientData();
    fetchMedicinesMaster();
  }, [patientId]);

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

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/profile/${patientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        setProfile(res.data.profile);
        const prescriptions = res.data.prescriptions || [];
        setHistoryList(prescriptions);

        if (prescriptions.length > 0) {
          loadHistoryItem(prescriptions[0]);
        } else {
          if (doctorId) {
            setIsEditing(true);
          }
        }
      }
    } catch (err) {
      console.error("Error loading patient data: ", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setIsEditing(false);

    // Parse Left Column notes
    try {
      const cc = JSON.parse(item.chief_complaints);
      setSymptoms(cc.symptoms || cc.complaints || item.chief_complaints || "");
      setComplaints(cc.complaints || "");
    } catch (e) {
      setSymptoms(item.chief_complaints || "");
      setComplaints(item.chief_complaints || "");
    }

    setDiagnosis(item.diagnosis || "");
    setObservations(item.observations || "");
    setFollowUpDate(item.follow_up_date ? item.follow_up_date.substring(0, 10) : "");
    setFollowUpNotes(item.follow_up_notes || "");
    setLogoUrl(item.logo_url || localStorage.getItem("globalClinicLogo") || null);
    setCategory(item.category || "Opd Paying");
    setAddress(item.address || "");
    setNextOfKin(item.next_of_kin || "-");
    setVisitType(item.visit_type || "New Complaints");
    setReferredBy(item.referred_by || "-");
    setOccupation(item.occupation || "-");
    setVisitValidity(item.visit_validity || "10 Days");

    // Parse medicines table
    try {
      const parsedRows = JSON.parse(item.medicines);
      if (Array.isArray(parsedRows)) {
        setPrescriptionRows(parsedRows);
      } else {
        throw new Error();
      }
    } catch (e) {
      if (item.medicines) {
        const rows = item.medicines.split(",").map((med) => {
          return { name: med, dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" };
        });
        setPrescriptionRows(rows);
      } else {
        setPrescriptionRows([]);
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedHistoryItem(null);
    setIsEditing(true);
    setLogoUrl(localStorage.getItem("globalClinicLogo") || null);
    setSymptoms("");
    setComplaints("");
    setDiagnosis("");
    setObservations("");
    setFollowUpDate("");
    setFollowUpNotes("");
    setCategory("Opd Paying");
    setAddress("");
    setNextOfKin("-");
    setVisitType("New Complaints");
    setReferredBy("-");
    setOccupation("-");
    setVisitValidity("10 Days");
    setPrescriptionRows([
      { name: "", dosage: "BD (After meal)", duration: "5 Days", instructions: "After meals" }
    ]);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (uploadRes.data && uploadRes.data.url) {
        setLogoUrl(uploadRes.data.url);
        localStorage.setItem("globalClinicLogo", uploadRes.data.url);
      }
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload custom logo: " + (err.response?.data?.error || err.message));
    }
  };

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

  const handleSaveReport = async () => {
    if (prescriptionRows.some(row => !row.name.trim())) {
      alert("Please enter medicine names in all prescription rows.");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    const complaintsPayload = JSON.stringify({
      symptoms,
      complaints
    });

    const payload = {
      patient_id: profile.patient_id,
      doctor_id: doctorId || 1,
      medicines: JSON.stringify(prescriptionRows),
      dosage: prescriptionRows.map(r => r.dosage).join(", "),
      instructions: prescriptionRows.map(r => r.instructions).join(", "),
      notes: diagnosis || "OPD Sheet Entry",
      chief_complaints: complaintsPayload,
      diagnosis,
      observations,
      advice: "Take as directed",
      follow_up_date: followUpDate || null,
      follow_up_notes: followUpNotes || null,
      logo_url: logoUrl,
      category: category || null,
      address: address || null,
      next_of_kin: nextOfKin || null,
      visit_type: visitType || null,
      referred_by: referredBy || null,
      occupation: occupation || null,
      visit_validity: visitValidity || null
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/prescriptions/add`, payload);
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchPatientData();
      }
    } catch (err) {
      console.error("Error saving report:", err);
      alert("Failed to save patient report: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    alert("Report link copied to clipboard:\n" + shareLink);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#064e3b]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-800">
        <FaFileMedical className="text-slate-400 text-5xl mb-4" />
        <h3 className="text-2xl font-bold font-sans">Patient Profile Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">Please verify the Patient ID and try again.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex justify-center items-start print:bg-white print:p-0">

      <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-6 print:gap-0">

        {/* ================= PATIENT HISTORY SIDEBAR (LEFT) ================= */}
        <aside className="w-full lg:w-72 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 print:hidden">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
              <FaHistory className="text-[#064e3b] text-xs" /> Patient History
            </h3>
            {doctorId && !isEditing && (
              <button
                onClick={handleCreateNew}
                className="text-[10px] bg-[#064e3b] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#043327] transition shadow-sm"
              >
                + New Sheet
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center font-medium">No past visits recorded.</p>
            ) : (
              historyList.map((item, index) => {
                const dateStr = new Date(item.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });
                const isSelected = selectedHistoryItem && selectedHistoryItem.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${isSelected
                        ? "bg-secondary-50/50 border-[#064e3b] font-bold shadow-sm"
                        : "bg-white border-slate-100 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
                      <span>Visit #{historyList.length - index}</span>
                      <span>{dateStr}</span>
                    </div>
                    <p className="font-bold truncate text-slate-800">{item.notes || "OPD Checkup"}</p>
                    <p className="text-[9px] text-slate-400 truncate mt-1">Dr. {item.doctor_name}</p>
                  </button>
                );
              })
            )}
          </div>

          {/* BACK TO DASHBOARD */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-800 transition"
            >
              <FaChevronLeft className="text-[10px]" /> Back to Workspace
            </button>
          </div>
        </aside>

        {/* ================= MAIN OPD SHEET (RIGHT) ================= */}
        <div
          className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-8 md:p-12 flex flex-col relative print:shadow-none print:border-none print:p-0"
          style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
        >

          {/* ACTION BUTTONS (HIDDEN ON PRINT) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-150 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {isEditing ? "Writing OPD Sheet" : "Viewing OPD Sheet"}
              </span>
              {isEditing && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                  Draft
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      if (historyList.length > 0) {
                        loadHistoryItem(historyList[0]);
                      } else {
                        setIsEditing(false);
                      }
                    }}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReport}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4.5 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-xl hover:bg-[#043327] transition shadow-sm disabled:opacity-50"
                  >
                    <FaSave /> {saving ? "Saving..." : "Save Report"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-xl hover:bg-[#043327] transition shadow-sm"
                  >
                    <FaPrint /> Print
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition shadow-sm"
                  >
                    <FaDownload /> PDF
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-50 transition"
                  >
                    <FaShareAlt /> Share
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 text-primary-800 rounded-xl text-sm font-semibold flex items-center gap-2 print:hidden animate-fadeIn">
              <FaCheckCircle className="text-primary-500 shrink-0" />
              OPD report sheet and prescription saved successfully.
            </div>
          )}

          {/* ================= CLINIC HEADER BRANDING ================= */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-[#064e3b] print:flex-row print:items-center">

            {/* Left Column: Logo & Clinic Name */}
            <div className="flex items-center gap-4">

              {/* Dynamic Clinic Logo Container */}
              <div className="relative group shrink-0 w-20 h-20 aspect-square">
                <img
                  src={logoUrl || branding.logo_url || defaultClinicLogo}
                  alt="Clinic Logo"
                  className="w-full h-full rounded-2xl object-cover bg-white p-1 border-2 border-[#064e3b] shadow-sm aspect-square"
                />

                {/* Upload overlay visible to doctor in edit mode */}
                {isEditing && (
                  <div
                    onClick={() => document.getElementById("logo-file-input").click()}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white text-[8px] font-black uppercase text-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                  >
                    Change Logo
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="logo-file-input"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              <div>
                <h1 className="text-3xl font-black text-[#064e3b] tracking-tight leading-none uppercase">
                  {branding.clinic_name || "SUMITRA CLINIC"}
                </h1>
                <p className="text-[12px] font-extrabold text-[#064e3b] uppercase tracking-wider mt-1.5">
                  CLASSICAL HOMEOPATHY CLINICAL REPORT
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-2.5">
                  {branding.clinic_address || "123, Green Valley Road, Bhopal, Madhya Pradesh - 462001"}
                </p>
                <p className="text-[9.5px] text-slate-400 font-bold mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#064e3b]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.8-.7-1.5-1.5-1.5H4C3.2 2.5 2.5 3.2 2.5 4c0 10 8 18 18 18 .8 0 1.5-.7 1.5-1.5v-3.5c0-.8-.7-1.5-1.5-1.5z" />
                    </svg>
                    {branding.clinic_phone || "+91 12345 67890"}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#064e3b]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    {branding.clinic_name ? `info@${branding.clinic_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : "info@sumitraclinic.com"}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column: Report Box (REP-2026-001) */}
            <div className="border-2 border-[#064e3b] rounded-xl p-3.5 w-full sm:w-44 text-left shrink-0 self-stretch flex flex-col justify-between bg-white shadow-sm font-sans print:w-44">
              <div>
                <span className="text-[8.5px] uppercase font-extrabold text-slate-400 block tracking-wide">REPORT NO.</span>
                <span className="text-sm font-black text-[#064e3b] mt-1 block">
                  REP-2026-{selectedHistoryItem ? String(selectedHistoryItem.id).padStart(3, "0") : "NEW"}
                </span>
              </div>
              <div className="h-[1px] bg-slate-200 my-1.5"></div>
              <div>
                <span className="text-[8.5px] uppercase font-extrabold text-slate-400 block tracking-wide">REPORT DATE</span>
                <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-extrabold text-[11px]">
                  <svg className="w-3.5 h-3.5 text-[#064e3b] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {selectedHistoryItem
                      ? new Date(selectedHistoryItem.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                      : new Date().toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                  </span>
                </div>
              </div>
              <div className="h-[1px] bg-slate-200 my-1.5"></div>
              <div>
                <span className="text-[8.5px] uppercase font-extrabold text-slate-400 block tracking-wide">NEXT VISIT DATE</span>
                <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-extrabold text-[11px]">
                  <svg className="w-3.5 h-3.5 text-[#064e3b] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isEditing ? (
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                    />
                  ) : (
                    <span>
                      {followUpDate
                        ? new Date(followUpDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                        : "Not Scheduled"}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>



          {/* ================= PATIENT METADATA GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[11px] text-[#333] py-3.5 border-t border-b border-[#333] leading-normal print:grid-cols-2">
            {/* Left Side Column */}
            <div className="space-y-1.5">
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Regn. No.</span>
                <span className="mr-2 font-bold">:</span>
                <span>OPD.24-25-{String(profile.id).padStart(5, "0")}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Patient Name</span>
                <span className="mr-2 font-bold">:</span>
                <span className="font-black uppercase">{profile.name}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">MRN</span>
                <span className="mr-2 font-bold">:</span>
                <span>UHID{profile.patient_id}</span>
              </div>
              <div className="flex items-center text-primary-800 font-extrabold">
                <span className="w-28 font-black shrink-0">Portal Login ID</span>
                <span className="mr-2 font-bold">:</span>
                <span>{profile.patient_id}</span>
              </div>
              <div className="flex items-center text-primary-800 font-extrabold">
                <span className="w-28 font-black shrink-0">Portal Password</span>
                <span className="mr-2 font-bold">:</span>
                <span>
                  {profile.password && !(profile.password.startsWith("$2a$") || profile.password.startsWith("$2b$") || profile.password.startsWith("$2y$"))
                    ? profile.password
                    : "Your Password"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Category</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span>{category}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Doctor</span>
                <span className="mr-2 font-bold">:</span>
                <span className="font-extrabold uppercase">
                  {(() => {
                    const doc = selectedHistoryItem ? selectedHistoryItem.doctor_name : doctorName;
                    if (!doc) return "N/A";
                    return doc.toUpperCase().startsWith("DR.") ? doc : `Dr. ${doc}`;
                  })()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Address</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address..."
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span className="uppercase truncate max-w-xs">{address || profile.address || "N/A"}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Next Of Kin</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={nextOfKin}
                    onChange={(e) => setNextOfKin(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span>{nextOfKin}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Visit Type</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span>{visitType}</span>
                )}
              </div>
            </div>

            {/* Right Side Column */}
            <div className="space-y-1.5">
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Visit Date</span>
                <span className="mr-2 font-bold">:</span>
                <span className="font-extrabold">
                  {selectedHistoryItem
                    ? new Date(selectedHistoryItem.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    }).toUpperCase()
                    : new Date().toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    }).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Age / Gender</span>
                <span className="mr-2 font-bold">:</span>
                <span>{profile.age ? `${profile.age} Yr` : "N/A"} / {profile.gender === "Male" ? "M" : profile.gender === "Female" ? "F" : "O"}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Mobile No.</span>
                <span className="mr-2 font-bold">:</span>
                <span>{profile.mobile}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Department</span>
                <span className="mr-2 font-bold">:</span>
                <span className="font-extrabold uppercase">HOMEOPATHY</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Referred By</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span>{referredBy}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Occupation</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span>{occupation}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-28 font-bold shrink-0">Visit Validity</span>
                <span className="mr-2 font-bold">:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={visitValidity}
                    onChange={(e) => setVisitValidity(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-[#064e3b] w-full"
                  />
                ) : (
                  <span>{visitValidity}</span>
                )}
              </div>
            </div>
          </div>

          {/* ================= CLINICAL NOTES / DESCRIPTION ================= */}
          <div className="my-5 flex-1 flex flex-col">
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3.5 font-sans">
              Doctor's Description / Clinical Notes :
            </h2>

            <div className="flex flex-col gap-4 flex-1">

              {/* History of Illness & Symptoms */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-[#064e3b]">History of Illness & Symptoms</span>
                {isEditing ? (
                  <textarea
                    rows="5"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. H/o injury today in back. C/o Pain, swelling R foot..."
                    className="w-full bg-[#fcfdfd] border border-slate-250 rounded-xl p-3 text-xs outline-none focus:border-[#064e3b] resize-none"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  ></textarea>
                ) : (
                  <div className="text-[12.5px] text-slate-700 font-bold leading-relaxed pl-2 whitespace-pre-line bg-slate-50/30 border border-slate-200/60 p-4 rounded-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {symptoms || ""}
                  </div>
                )}
              </div>



            </div>
          </div>

          {/* ================= PRESCRIPTION SHEET TABLE ================= */}
          <div className="my-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest pl-2 flex-grow text-center font-sans">
                PRESCRIPTION SHEET
              </h2>
              {isEditing && (
                <button
                  onClick={addRow}
                  className="flex items-center gap-1 text-[9px] bg-[#064e3b] hover:bg-[#043327] text-white px-2 py-0.5 rounded font-bold transition shadow-sm print:hidden"
                >
                  <FaPlus className="text-[7px]" /> Add row
                </button>
              )}
            </div>

            {/* Dynamic suggestions panel above table */}
            {isEditing && activeSuggestionIndex !== -1 && (
              <div className="border border-slate-200 bg-[#064e3b]/5 rounded-2xl p-4 space-y-3 mb-4 animate-fadeIn print:hidden">
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

            <div className="border border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px] print:min-w-0">
                <thead>
                  <tr className="bg-[#053528] text-white text-[10px] uppercase font-black tracking-widest">
                    <th className="p-3 pl-4 w-[40%] text-center">MEDICINE</th>
                    <th className="p-3 w-[20%] text-center">DOSAGE</th>
                    <th className="p-3 w-[15%] text-center">DURATION</th>
                    <th className="p-3 w-[25%] text-center pr-4">INSTRUCTIONS</th>
                    {isEditing && <th className="p-3 w-[5%] text-center print:hidden"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-[#3A2A20]">
                  {prescriptionRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Medicine */}
                      <td className="p-2.5 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tab. Chymoral AP"
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
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs outline-none focus:border-[#064e3b] text-center font-bold"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-800 text-sm">{row.name}</span>
                        )}
                      </td>

                      {/* Dosage */}
                      <td className="p-2.5 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="e.g. BD (After meal)"
                            value={row.dosage}
                            onChange={(e) => updateRowField(idx, "dosage", e.target.value)}
                            onFocus={() => setActiveSuggestionIndex(-1)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs outline-none focus:border-[#064e3b] text-center"
                          />
                        ) : (
                          <span className="font-bold text-slate-700">{row.dosage}</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="p-2.5 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="e.g. 5 Days"
                            value={row.duration}
                            onChange={(e) => updateRowField(idx, "duration", e.target.value)}
                            onFocus={() => setActiveSuggestionIndex(-1)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs outline-none focus:border-[#064e3b] text-center"
                          />
                        ) : (
                          <span className="text-slate-800 font-bold">{row.duration}</span>
                        )}
                      </td>

                      {/* Instructions */}
                      <td className="p-2.5 text-center pr-4">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="e.g. After meals"
                            value={row.instructions}
                            onChange={(e) => updateRowField(idx, "instructions", e.target.value)}
                            onFocus={() => setActiveSuggestionIndex(-1)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-xs outline-none focus:border-[#064e3b] text-center"
                          />
                        ) : (
                          <span className="text-slate-700 font-bold">{row.instructions}</span>
                        )}
                      </td>

                      {/* Remove Row Action */}
                      {isEditing && (
                        <td className="p-2.5 text-center print:hidden">
                          <button
                            onClick={() => {
                              removeRow(idx);
                              setActiveSuggestionIndex(-1);
                            }}
                            disabled={prescriptionRows.length === 1}
                            className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>



          {/* SIGNATURE (FLUSH RIGHT ABOVE FOOTER) */}
          <div className="flex justify-end pr-4 mb-4 print:mb-8">
            <div className="text-center flex flex-col items-center">
              {/* Doctor signature SVG */}
              <svg viewBox="0 0 100 30" className="w-24 h-8 text-[#064e3b] opacity-90 select-none pointer-events-none mb-1">
                <path d="M 10 20 C 20 5, 25 2, 35 15 C 40 25, 45 30, 52 10 C 56 2, 60 4, 65 12 C 70 20, 75 10, 80 15 C 85 20, 90 18, 95 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <div className="w-36 border-b border-[#333]/55"></div>
              <span className="text-[8.5px] uppercase font-extrabold text-slate-500 mt-1 block">Attending Physician Signature</span>
            </div>
          </div>

          {/* ================= CLINIC FOOTER ================= */}
          <div className="pt-4 border-t border-[#333]/20 text-center font-bold text-[10px] text-slate-800 leading-normal">
            <p className="uppercase">{branding.clinic_address || "123, Green Valley Road, Bhopal, Madhya Pradesh - 462001"}</p>
            <p className="text-[#064e3b] mt-1">
              CONTACT NO.: {branding.clinic_phone || "+91 12345 67890"} | {branding.clinic_name ? `info@${branding.clinic_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : "info@sumitraclinic.com"}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientReportPage;

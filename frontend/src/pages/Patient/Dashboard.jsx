import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaCalendarAlt, FaFileMedical, FaPrescriptionBottleAlt, FaHeartbeat, FaSignOutAlt, FaNotesMedical } from "react-icons/fa";
import { useBranding } from "../../context/BrandingContext";
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

const PatientDashboard = () => {
  const { branding, fetchBranding } = useBranding();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [latestVitals, setLatestVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  const patientId = localStorage.getItem("patientId");
  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    if (adminId) {
      fetchBranding(adminId);
    }
  }, [adminId]);

  useEffect(() => {
    if (!patientId) {
      window.location.href = "/login";
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/profile/${patientId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.data.success) {
          setProfile(res.data.profile);
          setAppointments(res.data.appointments);
          setPrescriptions(res.data.prescriptions);
          setHealthRecords(res.data.healthRecords);
          setLatestVitals(res.data.latestVitals);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [patientId]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: branding.theme_color || "#00875A" }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-lg border border-white/40 p-10 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 border-4 border-slate-100 rounded-full animate-spin" style={{ borderTopColor: branding.theme_color || "#00875A" }}></div>
          <div className="text-center">
            <h3 className="text-slate-800 font-black tracking-tight text-sm">Loading Patient Desk</h3>
            <p className="text-slate-400 font-bold animate-pulse text-[11px] mt-1.5">Fetching medical history records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVIGATION BAR */}
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
              {branding.clinic_name ? branding.clinic_name.charAt(0) : "P"}
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg sm:text-xl truncate max-w-[200px]" title={branding.clinic_name || "Sumitra Clinic"}>
              {branding.clinic_name || "Sumitra Clinic"}
            </h1>
            <p className="text-xs text-white/80">Patient Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-primary-800 hover:bg-primary-700 rounded-xl text-xs sm:text-sm font-bold transition shadow"
          >
            Back to Home
          </a>
          <span className="hidden md:inline text-sm font-semibold text-primary-100">
            Welcome, {profile?.name || "Patient"} (#{patientId})
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 bg-primary-800 hover:bg-primary-700 rounded-xl text-xs sm:text-sm font-bold transition shadow"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-8 animate-fadeIn">
        {/* ROW 1: PERSONAL DETAILS & VITALS QUICKSTATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 hover:border-slate-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 text-2xl font-bold">
                  {profile?.name ? profile.name.charAt(0) : "P"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{profile?.name}</h3>
                  <p className="text-xs font-bold text-slate-400">Patient ID: {profile?.patient_id}</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm border-t border-slate-50 pt-5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Mobile</span>
                  <span className="text-slate-700 font-bold">{profile?.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Age</span>
                  <span className="text-slate-700 font-bold">{profile?.age || "N/A"} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Gender</span>
                  <span className="text-slate-700 font-bold">{profile?.gender || "N/A"}</span>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <a
                  href={`/patient/report/${profile?.patient_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center block text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 py-2.5 rounded-xl border border-primary-100 transition-all duration-300 hover:shadow-sm"
                >
                  📄 View OPD & Prescription Report
                </a>
              </div>
            </div>
          </div>

          {/* HEALTH RECORDS / VITALS CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 hover:border-slate-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaHeartbeat className="text-rose-500" /> Current Vitals & Health Condition
            </h3>

            {latestVitals ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/50 flex flex-col justify-center">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">Blood Pressure</span>
                  <span className="text-3xl font-extrabold text-slate-800 mt-1">{latestVitals.blood_pressure || "N/A"}</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-bold">mmHg</span>
                </div>

                <div className="bg-primary-50/50 p-5 rounded-2xl border border-primary-100/50 flex flex-col justify-center">
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">Weight</span>
                  <span className="text-3xl font-extrabold text-slate-800 mt-1">{latestVitals.weight || "N/A"}</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-bold">kg</span>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50 flex flex-col justify-center">
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">Recovery Status</span>
                  <span className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      latestVitals.current_condition === "Critical" ? "bg-red-100 text-red-700" :
                      latestVitals.current_condition === "Improving" ? "bg-amber-100 text-amber-700" :
                      latestVitals.current_condition === "Recovered" ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-700"
                    }`}>
                      {latestVitals.current_condition || "Stable"}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 mt-2 font-bold">
                    Follow-up: {latestVitals.follow_up_date ? new Date(latestVitals.follow_up_date).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-500 font-semibold">No vitals or recovery tracking logs recorded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Your doctor will record your blood pressure, weight, and recovery milestones during consultation.</p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: ACTIVE PRESCRIPTION SHEET */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FaPrescriptionBottleAlt className="text-primary-600" /> Active Prescriptions & Medicines
          </h3>

          {prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prescriptions.map((pr) => (
                <div key={pr.id} className="border border-slate-150 p-6 rounded-2xl bg-primary-50/20 hover:bg-primary-50/30 transition">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{pr.doctor_name}</h4>
                      <p className="text-xs font-semibold text-slate-400">{pr.doctor_specialization || "Classical Homeopathy"}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
                      {new Date(pr.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm font-semibold">
                    <div>
                      <span className="text-xs font-bold text-primary-800 uppercase block mb-1">Medicines / Formulations</span>
                      <div className="text-slate-800 font-bold bg-white p-3 border rounded-xl">{formatMedicinesForDisplay(pr.medicines)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">Dosage Details</span>
                        <p className="text-slate-700 bg-white p-3 border rounded-xl">{pr.dosage || "As advised"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">Special Instructions</span>
                        <p className="text-slate-700 bg-white p-3 border rounded-xl">{pr.instructions || "None"}</p>
                      </div>
                    </div>

                    {pr.notes && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-400 block mb-1">Doctor Advice / Notes</span>
                        <p className="text-slate-650 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs italic">"{pr.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-500 font-semibold">No active prescriptions available.</p>
              <p className="text-xs text-slate-400 mt-1">Prescriptions will appear here once submitted by your doctor.</p>
            </div>
          )}
        </div>

        {/* ROW 3: APPOINTMENT HISTORY & REPORTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* APPOINTMENT HISTORY */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaCalendarAlt className="text-primary-700" /> Appointment History
            </h3>

            {appointments.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {appointments.map((ap) => (
                  <div key={ap.id} className="flex justify-between items-center border border-slate-100 p-4 rounded-xl hover:bg-slate-50 transition">
                    <div>
                      <h4 className="font-bold text-slate-800">{ap.doctor_name || "N/A"}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                        {new Date(ap.date).toLocaleDateString()} • {ap.appointment_time || "N/A"}
                      </p>
                      <p className="text-xs font-semibold text-primary-800 mt-1">Symptom: {ap.patient_diseases || "N/A"}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        ap.status === "Approved" ? "bg-green-100 text-green-700" :
                        ap.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {ap.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-10 font-semibold">No appointments booked yet.</p>
            )}
          </div>

          {/* PREVIOUS DOCTOR NOTES & HISTORICAL RECORDS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaNotesMedical className="text-sky-700" /> Historical Consultations & Reports
            </h3>

            {healthRecords.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {healthRecords.map((rec) => (
                  <div key={rec.id} className="border border-slate-100 p-4 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">Vitals Log</span>
                      <span className="text-xs text-slate-400 font-bold">{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-650">
                      <p>BP: <span className="text-slate-800 font-bold">{rec.blood_pressure || "N/A"}</span></p>
                      <p>Weight: <span className="text-slate-800 font-bold">{rec.weight || "N/A"} kg</span></p>
                      <p className="col-span-2 mt-1">Condition: <span className="text-primary-700 font-extrabold">{rec.current_condition || "Stable"}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-500 font-semibold">No historical consultation records.</p>
                <p className="text-xs text-slate-400 mt-1">Vitals tracking timelines will populate here over time.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;

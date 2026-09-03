import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useBranding } from "../../context/BrandingContext";

const PatientRecord = () => {
  const { branding, fetchBranding } = useBranding();
  const { patientId } = useParams();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [latestVitals, setLatestVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    if (adminId) {
      fetchBranding(adminId);
    }
  }, [adminId]);

  useEffect(() => {
    const fetchRecordData = async () => {
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
        console.error("Error loading patient record: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordData();
  }, [patientId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-lg border border-white/40 p-10 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 border-4 border-slate-100 rounded-full animate-spin border-t-[#0A3464]"></div>
          <div className="text-center">
            <h3 className="text-slate-800 font-black tracking-tight text-sm">Generating Medical Sheet</h3>
            <p className="text-slate-400 font-bold animate-pulse text-[11px] mt-1.5">Parsing diagnostic ledger values...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafbfc] p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-sm bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
          <svg className="w-14 h-14 text-rose-500 mb-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Record Mapped Offline</h3>
          <p className="text-slate-450 text-xs mt-2 font-medium leading-relaxed">The patient credentials or sheet parameters specified are invalid. Please check context details.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 w-full py-3 bg-gradient-to-r from-slate-700 to-slate-850 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate total fees of approved appointments
  const totalFees = appointments
    .filter((ap) => ap.status === "Approved")
    .reduce((sum, ap) => sum + (parseInt(ap.doctor_fees) || 0), 0);

  // Find doctor details from appointments
  const mainDoctor = appointments.length > 0 ? appointments[0] : null;
  const doctorName = mainDoctor ? `Dr. ${mainDoctor.doctor_name || "Staff Clinician"}` : "Staff Clinician";
  const doctorSpecialization = mainDoctor?.doctor_specialization || "Homeopathy Consultant";

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-10 flex justify-center items-start print:bg-white print:p-0">
      <style>{`
        @media print {
          body, html {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 12mm 8mm 12mm !important;
          }
          .print-single-page {
            max-height: 297mm;
            overflow: hidden;
            box-sizing: border-box;
          }
        }
      `}</style>
      
      {/* RECORD CONTAINER */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-[#D2E0EC] p-8 sm:p-12 relative print:shadow-none print:border-none print:p-0 print-single-page">
        
        {/* ACTION HEADER (HIDDEN ON PRINT) */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 print:hidden">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#0A3464] font-bold text-xs sm:text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Workspace
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-[#D2E0EC] hover:bg-slate-50 text-slate-700 rounded-lg text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all print:hidden"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Record
          </button>
        </div>

        {/* CLINICAL REPORT BRANDING HEADER */}
        <div className="flex justify-between items-stretch gap-4 pb-6 print:pb-2">
          {/* Left Section: Back button, emblem, and vertical divider */}
          <div className="flex items-stretch gap-4">
            {/* Left Column: Arrow */}
            <div className="flex flex-col items-center justify-start py-1 shrink-0 w-12 print:hidden">
              {/* Back button (navigation) */}
              <button
                onClick={() => window.history.back()}
                className="text-[#0A3464] hover:text-[#0c4380] transition-colors"
                title="Back"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            {/* Vertical divider */}
            <div className="w-[1.5px] bg-[#0A3464]/30 self-stretch print:hidden"></div>

            {/* Middle Column: Clinic details */}
            <div className="flex flex-col justify-between py-0.5">
              <div>
                <h1 className="text-[17px] font-extrabold text-[#0A3464] tracking-tight leading-tight uppercase font-sans">
                  {branding.clinic_name || "SUMITRA HOMEOPATHY CLINIC"}
                </h1>
                {(!branding.clinic_name) && (
                  <h1 className="text-[17px] font-extrabold text-[#0A3464] tracking-tight leading-tight uppercase font-sans">
                    & RESEARCH CENTRE
                  </h1>
                )}
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  {branding.clinic_details || "at the N.I. Pirogov Clinic of High Medical Technologies St. Petersburg State University"}
                </p>
              </div>
              
              {/* Divider line in the middle column */}
              <div className="h-[0.5px] bg-slate-300 my-2"></div>
              
              <div className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                <p>{branding.clinic_address || "Fontanka River Embankment, 154, St. Petersburg, 190103, Russia"}</p>
                <p className="mt-0.5">
                  Tel: {branding.clinic_phone || "+91 91091 02650"} | Web: {branding.clinic_name ? `www.${branding.clinic_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : "www.sumitraclinic.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Divider and Invoice Meta */}
          <div className="flex items-stretch gap-4">
            {/* Vertical line divider */}
            <div className="w-[1px] bg-[#0A3464]/30 self-stretch"></div>

            {/* Right Column: Invoice Info */}
            <div className="flex flex-col justify-between text-right w-44 py-0.5">
              <h2 className="text-2xl font-extrabold text-[#0A3464] uppercase tracking-wider font-sans leading-none">
                INVOICE
              </h2>
              <div className="text-[11px] font-medium text-slate-700 space-y-1 mt-4">
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 uppercase text-[9px] font-bold">Invoice No.:</span>
                  <span className="text-[#0A3464] font-bold">
                    REC-2026-{profile.patient_id ? profile.patient_id.replace("PAT", "") : profile.id}
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 uppercase text-[9px] font-bold">Invoice Date:</span>
                  <span className="text-slate-800 font-bold">
                    {new Date(profile.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BLUE SEPARATOR */}
        <div className="h-[1.5px] bg-[#0A3464] w-full mb-6 print:mb-3"></div>

        {/* SECTION 1: PATIENT & DOCTOR INFORMATION */}
        <div className="mb-6 print:mb-3">
          <h3 className="text-[11px] font-bold text-[#0A3464] uppercase tracking-wider mb-2 font-sans">
            Consultation Details
          </h3>
          
          {/* Light-blue Card with Background Watermark */}
          <div className="bg-[#F0F5FA]/80 border border-[#D2E0EC] rounded-xl p-5 print:p-3 relative overflow-hidden grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 items-stretch">
            
            {/* Left side: Patient data */}
            <div className="space-y-2 text-xs text-slate-700 font-medium relative z-10">
              <div className="flex items-center border-b border-[#D2E0EC]/60 pb-2 mb-2">
                <span className="text-[#0A3464] font-extrabold text-xs uppercase tracking-wider">Patient Details</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Patient Name:</span>
                <span className="text-slate-900 font-extrabold text-sm">{profile.name}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Age / Gender:</span>
                <span className="text-slate-900 font-extrabold text-sm font-sans">
                  {profile.age ? `${profile.age} Yrs` : "N/A"} / {profile.gender || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Patient ID:</span>
                <span className="text-[#0A3464] font-extrabold text-sm">{profile.patient_id}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Mobile Number:</span>
                <span className="text-slate-900 font-extrabold text-sm">{profile.mobile}</span>
              </div>
            </div>

            {/* Right side: Doctor details */}
            <div className="space-y-2 text-xs text-slate-700 font-medium relative z-10 md:border-l md:border-[#D2E0EC]/60 md:pl-6">
              <div className="flex items-center border-b border-[#D2E0EC]/60 pb-2 mb-2">
                <span className="text-[#0A3464] font-extrabold text-xs uppercase tracking-wider">Doctor Details</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Doctor Name:</span>
                <span className="text-slate-900 font-extrabold text-sm">{doctorName}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Specialization:</span>
                <span className="text-slate-900 font-extrabold text-sm">{doctorSpecialization}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Clinic Name:</span>
                <span className="text-slate-900 font-extrabold text-sm">{branding.clinic_name || "Sumitra Homeopathy"}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-slate-400 uppercase text-[9px] font-bold">Status:</span>
                <span className="text-primary-700 font-extrabold text-sm uppercase">Active Consultant</span>
              </div>
            </div>

            {/* Right side: Watermark SVG */}
            <div className="absolute right-0 bottom-0 pointer-events-none z-0">
              <svg viewBox="0 0 160 100" className="w-48 h-28 text-[#0A3464]/10 shrink-0 select-none">
                {/* Dome base */}
                <path d="M 10 90 L 150 90 L 150 85 L 10 85 Z" fill="currentColor" opacity="0.4" />
                <path d="M 20 85 L 140 85 L 140 75 L 20 75 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                {/* Pillars */}
                <line x1="30" y1="75" x2="30" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="45" y1="75" x2="45" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="60" y1="75" x2="60" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="75" y1="75" x2="75" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="90" y1="75" x2="90" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="105" y1="75" x2="105" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="120" y1="75" x2="120" y2="85" stroke="currentColor" strokeWidth="1.5" />
                <line x1="135" y1="75" x2="135" y2="85" stroke="currentColor" strokeWidth="1.5" />
                
                {/* Central pediment */}
                <polygon points="50,75 110,75 80,63" fill="none" stroke="currentColor" strokeWidth="1" />
                
                {/* Dome structure */}
                <path d="M 60,63 L 100,63 L 100,53 L 60,53 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                {/* Inner Columns */}
                <line x1="65" y1="53" x2="65" y2="63" stroke="currentColor" strokeWidth="1" />
                <line x1="72" y1="53" x2="72" y2="63" stroke="currentColor" strokeWidth="1" />
                <line x1="80" y1="53" x2="80" y2="63" stroke="currentColor" strokeWidth="1" />
                <line x1="88" y1="53" x2="88" y2="63" stroke="currentColor" strokeWidth="1" />
                <line x1="95" y1="53" x2="95" y2="63" stroke="currentColor" strokeWidth="1" />
                
                {/* Main Dome */}
                <path d="M 62,53 C 62,30 98,30 98,53 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 69,53 C 69,38 91,38 91,53 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
                {/* Dome Ribs */}
                <line x1="80" y1="36" x2="80" y2="53" stroke="currentColor" strokeWidth="0.5" />
                <line x1="74" y1="38" x2="74" y2="53" stroke="currentColor" strokeWidth="0.5" />
                <line x1="86" y1="38" x2="86" y2="53" stroke="currentColor" strokeWidth="0.5" />
                
                {/* Lantern and Cross */}
                <rect x="77" y="28" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 80,28 C 80,24 80,24 80,24" stroke="currentColor" strokeWidth="1" />
                {/* Cross */}
                <line x1="80" y1="20" x2="80" y2="25" stroke="currentColor" strokeWidth="1" />
                <line x1="77" y1="22" x2="83" y2="22" stroke="currentColor" strokeWidth="1" />
                
                {/* Side Towers (Left and Right) */}
                {/* Left Tower */}
                <rect x="25" y="60" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 25,60 C 25,50 40,50 40,60" fill="none" stroke="currentColor" strokeWidth="1" />
                <line x1="32.5" y1="46" x2="32.5" y2="50" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="48" x2="35" y2="48" stroke="currentColor" strokeWidth="1" />
                
                {/* Right Tower */}
                <rect x="120" y="60" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 120,60 C 120,50 135,50 135,60" fill="none" stroke="currentColor" strokeWidth="1" />
                <line x1="127.5" y1="46" x2="127.5" y2="50" stroke="currentColor" strokeWidth="1" />
                <line x1="125" y1="48" x2="130" y2="48" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>

          </div>
        </div>

        {/* SECTION 2: SERVICES PROVIDED */}
        <div className="mb-6 print:mb-3">
          <h3 className="text-[11px] font-bold text-[#0A3464] uppercase tracking-wider mb-2 font-sans">
            Services Provided
          </h3>

          <div className="border border-[#D2E0EC] rounded-xl overflow-hidden mb-4 print:mb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#D2E0EC] text-slate-700 text-[10px] uppercase font-bold tracking-wider divide-x divide-[#D2E0EC]/50">
                  <th className="p-3 print:p-2 pl-4 w-[75%]">Description</th>
                  <th className="p-3 print:p-2 text-right w-[25%] pr-4 print:pr-2">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2E0EC] font-semibold text-slate-700">
                {/* 1. Appointments / Consultations */}
                {appointments.length > 0 ? (
                  appointments.map((ap) => (
                    <tr key={`ap-${ap.id}`} className="divide-x divide-[#D2E0EC] hover:bg-slate-50/30 transition-colors">
                      <td className="p-3 print:p-2 pl-4">
                        <div className="font-extrabold text-[#0A3464] text-[11.5px] print:text-[10.5px]">
                          Homeopathy Consultation - Dr. {ap.doctor_name || "Staff Clinician"}
                        </div>
                        <div className="text-[9.5px] print:text-[8.5px] text-slate-400 mt-1 print:mt-0.5 font-bold">
                          DIAGNOSIS: {ap.patient_diseases || "General Checkup"} &bull; DATE: {new Date(ap.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })} {ap.appointment_time ? `(${ap.appointment_time})` : ""}
                        </div>
                      </td>
                      <td className="p-3 print:p-2 text-right text-slate-800 font-extrabold pr-4 print:pr-2 font-mono print:text-[10.5px]">
                        ₹{ap.status === "Approved" ? parseFloat(ap.doctor_fees || 0).toFixed(2) : "0.00"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="p-8 print:p-4 text-center text-slate-400 font-bold italic">
                      No consultations recorded for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Amount Due Box */}
          <div className="border border-[#D2E0EC] rounded-lg overflow-hidden flex font-extrabold text-xs sm:text-sm mb-6 print:mb-3">
            <div className="w-[70%] p-3.5 print:p-2 text-slate-700 bg-white tracking-wider uppercase font-sans">
              TOTAL AMOUNT DUE
            </div>
            <div className="w-[30%] p-3.5 print:p-2 text-right pr-4 print:pr-2 text-[#0A3464] bg-white text-sm sm:text-base font-black font-mono border-l border-[#D2E0EC]">
              ₹{totalFees.toFixed(2)}
            </div>
          </div>
        </div>

        {/* CLINICAL SEAL, SIGNATURE & STAMP */}
        <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-100 print:mt-4 print:pt-3">
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700">
              {/* Payment Status */}
              <div className="text-xs font-bold text-slate-700 mb-6 print:mb-3 flex items-center gap-4">
                <span className="text-slate-400 uppercase text-[9px]">Payment Status:</span>
                <span className={`text-[13px] font-extrabold uppercase ${
                  appointments.length > 0 && appointments.some(ap => ap.status === "Approved") 
                    ? "text-primary-700" 
                    : "text-amber-700"
                }`}>
                  {appointments.length > 0 && appointments.some(ap => ap.status === "Approved") ? "Settled / Paid" : "Pending"}
                </span>
              </div>
              
              {/* Signature Line */}
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 uppercase text-[9px] font-bold block mb-1">Authorized Signature:</span>
                <div className="relative h-12 w-44 print:h-10">
                  {/* Signature SVG */}
                  <svg viewBox="0 0 150 50" className="absolute top-[-10px] print:top-[-16px] left-2 w-36 h-12 text-[#0A3464] opacity-85 select-none pointer-events-none">
                    <path d="M 10 35 C 25 15, 30 10, 40 25 C 45 35, 50 45, 60 20 C 65 10, 70 12, 75 22 C 80 32, 85 30, 90 20 C 95 10, 100 25, 110 32 C 120 40, 130 35, 140 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 30 25 L 120 25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                  </svg>
                  <div className="w-44 border-b border-slate-300 absolute bottom-0"></div>
                </div>
                <p className="mt-1.5 text-[10px] font-extrabold text-slate-800 tracking-wide uppercase">Billing Department</p>
                <p className="text-[9px] text-slate-450 font-semibold uppercase">{branding.clinic_name || "Sumitra Homeopathy Clinic"} & Research Centre</p>
              </div>
            </div>
          </div>
          
          {/* Circular Stamp Logo */}
          <div className="flex flex-col items-center shrink-0 mr-4">
            <svg className="w-28 h-28 print:w-20 print:h-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#0A3464" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#0A3464" strokeWidth="0.5" strokeDasharray="1.5 1" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="#0A3464" strokeWidth="1" />
              
              {/* Path for curving text */}
              <path id="stamp-text-path" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="none" />
              <text fill="#0A3464" fontSize="4.8" fontWeight="bold" letterSpacing="0.4">
                <textPath href="#stamp-text-path" startOffset="0%">
                  * {branding.clinic_name ? branding.clinic_name.toUpperCase() : "SUMITRA HOMEOPATHY CLINIC & RESEARCH CENTRE"} *
                </textPath>
              </text>
              
              {/* Miniature building outline in stamp */}
              <g transform="translate(39, 39) scale(0.22)" stroke="#0A3464" fill="none" strokeWidth="2">
                {/* Base */}
                <path d="M 10 75 H 90" />
                {/* Pillars */}
                <line x1="20" y1="75" x2="20" y2="60" />
                <line x1="35" y1="75" x2="35" y2="60" />
                <line x1="50" y1="75" x2="50" y2="60" />
                <line x1="65" y1="75" x2="65" y2="60" />
                <line x1="80" y1="75" x2="80" y2="60" />
                {/* Pediment */}
                <polygon points="15,60 85,60 50,45" />
                {/* Dome */}
                <path d="M 35,45 C 35,20 65,20 65,45 Z" />
                <line x1="50" y1="20" x2="50" y2="45" />
                {/* Lantern */}
                <rect x="47.5" y="14" width="5" height="6" />
                <line x1="50" y1="8" x2="50" y2="14" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="47" y1="10" x2="53" y2="10" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              
              <text x="50" y="34" textAnchor="middle" fill="#0A3464" fontSize="4.2" fontWeight="black" letterSpacing="0.2">VERIFIED</text>
              <text x="50" y="70" textAnchor="middle" fill="#0A3464" fontSize="4.2" fontWeight="black" letterSpacing="0.2">INDIA</text>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientRecord;

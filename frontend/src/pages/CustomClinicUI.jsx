import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { 
  FaCalendarCheck, 
  FaUserMd, 
  FaPhoneAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaStethoscope,
  FaArrowRight,
  FaShieldAlt,
  FaRupeeSign,
  FaEnvelope
} from "react-icons/fa";
import { useBranding } from "../context/BrandingContext";
import LoginModal from "../components/LoginModal";

const CustomClinicUI = () => {
  const { adminId } = useParams();
  const { branding, fetchBranding, applyTheme } = useBranding();
  
  // Scoped Data Lists
  const [doctors, setDoctors] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Booking Form States
  const [activeTab, setActiveTab] = useState("new"); // "new" or "re"
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [overrideFilter, setOverrideFilter] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Load Clinic Branding & Operational Data
  useEffect(() => {
    if (adminId) {
      setLoading(true);
      setNotFound(false);

      const loadClinic = async () => {
        try {
          const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
          // Fetch branding details first to check if clinic exists and is active
          const brandRes = await axios.get(`${base}/api/auth/branding/${adminId}`);
          if (brandRes.data && brandRes.data.success) {
            const b = brandRes.data.branding;
            applyTheme(b.theme_color, b.clinic_name, b.logo_url, b.logo_width, b.logo_height, b.clinic_address, b.clinic_phone, b.clinic_details);

            // Fetch operational data
            const docsRes = await axios.get(`${base}/api/doctors?adminId=${adminId}&status=Active`);
            setDoctors(Array.isArray(docsRes.data) ? docsRes.data : []);

            const disRes = await axios.get(`${base}/api/diseases?adminId=${adminId}`);
            setDiseases(Array.isArray(disRes.data) ? disRes.data : []);

            const shiftRes = await axios.get(`${base}/api/shifts?adminId=${adminId}`);
            setShifts(Array.isArray(shiftRes.data) ? shiftRes.data : []);

            setLoading(false);
          } else {
            setNotFound(true);
            setLoading(false);
          }
        } catch (err) {
          console.error("Clinic loading failed:", err);
          setNotFound(true);
          setLoading(false);
        }
      };

      loadClinic();
    }
  }, [adminId]);

  // Load patient details on reappointment ID or mobile match
  useEffect(() => {
    const trimmed = patientId.trim();
    if (activeTab === "re" && trimmed.length >= 3 && adminId) {
      const timer = setTimeout(async () => {
        try {
          const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const res = await axios.get(`${base}/api/patients/public-profile/${encodeURIComponent(trimmed)}?adminId=${adminId}`);
          if (res.data && res.data.success && res.data.profile) {
            const profile = res.data.profile;
            setPatientName(profile.name || "");
            setMobile(profile.mobile || "");
            setAge(profile.age ? String(profile.age) : "");
            setGender(profile.gender || "");
          }
        } catch (err) {
          console.warn("Error fetching patient profile:", err.message);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [patientId, activeTab, adminId]);

  const filteredDoctors = doctors.filter((doc) => {
    if (overrideFilter || !selectedDisease) return true;
    const serviceLower = selectedDisease.toLowerCase().trim();
    
    // 1. Check treated diseases list
    const diseaseString = doc.disease || "";
    const docDiseases = diseaseString.split(",").map(d => d.trim().toLowerCase()).filter(Boolean);
    
    const treatedMatch = docDiseases.some(d => serviceLower.includes(d) || d.includes(serviceLower));
    if (treatedMatch) return true;
    
    // 2. Check if doctor's specialization contains the selected service
    const specString = (doc.specialization || "").toLowerCase().trim();
    if (specString) {
      const specMatch = serviceLower.includes(specString) || specString.includes(serviceLower);
      if (specMatch) return true;
    }

    // 3. Synonym matching for diseases & specializations (e.g. Neurologist matches Migraine/Headache, Dentist matches Mouth, Stomach matches IBS/Digestive)
    const SYNONYMS = {
      "mouth": ["dentist", "mouth", "dental", "teeth"],
      "dentist": ["mouth", "dentist", "dental", "teeth"],
      "stomach": ["stomach", "digestive", "ibs", "irritable bowel syndrome", "bowel", "gastric", "acidity"],
      "neurologist": ["neurologist", "migraine", "headache", "neurology", "brain", "paralysis"],
      "headache": ["neurologist", "migraine", "headache", "neurology", "brain"],
      "migraine": ["neurologist", "migraine", "headache", "neurology", "brain"]
    };

    // Check treated diseases synonyms
    for (const d of docDiseases) {
      const syns = SYNONYMS[d];
      if (syns && syns.some(s => serviceLower.includes(s) || s.includes(serviceLower))) {
        return true;
      }
    }

    // Check specialization synonyms
    if (specString) {
      const syns = SYNONYMS[specString];
      if (syns && syns.some(s => serviceLower.includes(s) || s.includes(serviceLower))) {
        return true;
      }
    }

    // Check selected disease synonyms
    const selectSyns = SYNONYMS[serviceLower];
    if (selectSyns) {
      if (specString && selectSyns.some(s => specString.includes(s) || s.includes(specString))) {
        return true;
      }
      if (docDiseases.some(d => selectSyns.some(s => d.includes(s) || s.includes(d)))) {
        return true;
      }
    }
    
    return false;
  });

  // Fetch slots dynamically
  useEffect(() => {
    if (selectedDoctorId && date && adminId) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const res = await axios.get(`${base}/api/slots?doctorId=${selectedDoctorId}&date=${date}&adminId=${adminId}`);
          setAvailableSlots(res.data || []);
          if (res.data && res.data.length > 0) {
            setTimeSlot(res.data[0]);
          } else {
            setTimeSlot("");
          }
        } catch (err) {
          console.error("Error loading slots:", err);
          setAvailableSlots([]);
          setTimeSlot("");
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
      setTimeSlot("");
    }
  }, [selectedDoctorId, date, adminId]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "new") {
      if (!patientName || !mobile || !selectedDoctorId || !date) {
        alert("Please fill in all required fields.");
        return;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(mobile)) {
        alert("Mobile number must be exactly 10 digits.");
        return;
      }
    } else {
      if (!patientId || !patientName || !selectedDoctorId || !date) {
        alert("Please enter Patient ID, Name, Doctor and Date.");
        return;
      }
    }

    setBookingLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const payload = {
        patient_name: patientName,
        mobile: mobile,
        doctor_id: parseInt(selectedDoctorId),
        date: date,
        appointment_time: timeSlot,
        patient_diseases: selectedDisease || "General Consultation",
        admin_id: parseInt(adminId)
      };

      if (activeTab === "new") {
        payload.age = age ? parseInt(age) : null;
        payload.gender = gender || null;
      } else {
        payload.patient_id = patientId.trim();
      }

      const res = await axios.post(`${base}/api/appointments`, payload);
      
      if (res.data && res.data.success) {
        setSuccessData({
          ...res.data,
          bookedDate: date,
          bookedTimeSlot: timeSlot
        });
        // Clear fields
        setPatientName("");
        setMobile("");
        setAge("");
        setGender("");
        setPatientId("");
        setSelectedDoctorId("");
        setSelectedDisease("");
        setDate("");
        setTimeSlot("");
        setMessage("");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit appointment booking: " + (err.response?.data?.error || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const primaryColor = branding.theme_color || "#CA6180";
  const primaryHover = branding.theme_hover || "#B54A6B";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] relative overflow-hidden">
        {/* Interactive blur spots */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-40" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-lg border border-white/40 p-10 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 border-4 border-slate-100 rounded-full animate-spin" style={{ borderTopColor: primaryColor }}></div>
          <div className="text-center">
            <h3 className="text-slate-800 font-black tracking-tight text-sm">Configuring Workspace</h3>
            <p className="text-slate-400 font-bold animate-pulse text-[11px] mt-1.5">Establishing secure medical protocol nodes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-lg text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-3xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-2">Clinic Not Found</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              The clinic workspace you are trying to access does not exist, has been deactivated, or is currently undergoing configuration updates.
            </p>
          </div>
          <Link
            to="/"
            className="w-full bg-[#CA6180] hover:bg-[#B54A6B] text-white font-bold py-3 rounded-2xl text-xs transition duration-200 shadow-md text-center block"
          >
            Back to Homeopathy World
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-primary-100">
      
      {/* Floating Glass Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt="Logo" 
                className="object-contain rounded-lg" 
                style={{ 
                  width: branding.logo_width ? `${branding.logo_width}px` : "40px", 
                  height: branding.logo_height ? `${branding.logo_height}px` : "40px",
                  maxWidth: "180px", 
                  maxHeight: "80px" 
                }} 
              />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: primaryColor }}>
                {branding.clinic_name ? branding.clinic_name.charAt(0) : "H"}
              </div>
            )}
            <span className="font-extrabold text-lg tracking-tight text-slate-800">
              {branding.clinic_name || "Homeopathy World"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <button onClick={() => scrollToSection("home")} className="hover:text-slate-900 transition-colors">Home</button>
            <button onClick={() => scrollToSection("doctors")} className="hover:text-slate-900 transition-colors">Our Doctors</button>
            <button onClick={() => scrollToSection("booking")} className="hover:text-slate-900 transition-colors">Book Consult</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-5 py-2.5 rounded-full border text-xs font-bold transition-all transform active:scale-95 hover:bg-slate-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Portal Login
            </button>
            <button 
              onClick={() => scrollToSection("booking")}
              className="px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-md shadow-primary-500/10 hover:shadow-lg transition-all transform active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              Request Consult
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-primary-50/40 via-white to-slate-50">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-800 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Modern Clinic Node Operational
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight">
              Natural Healing, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #0F766E)` }}>
                Personalized Care
              </span>
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Welcome to <strong>{branding.clinic_name || "our clinic"}</strong>. Experience the power of specialized Homeopathic treatments custom-tailored to your unique health profile, driven by experienced practitioners.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button 
                onClick={() => scrollToSection("booking")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                Schedule Appointment <FaArrowRight className="text-xs" />
              </button>
              <button 
                onClick={() => scrollToSection("doctors")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-sm shadow-sm transition-all"
              >
                Meet Doctors
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-100 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{doctors.length}</p>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Specialists</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{diseases.length || 8}</p>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Treatments</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900">100%</p>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Safe & Pure</p>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Glassmorphic Widget Container */}
            <div className="w-full max-w-sm rounded-[36px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden p-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-full blur-2xl opacity-50"></div>
              
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl text-primary-600">
                  <FaStethoscope />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Quick Consultation</h3>
                  <p className="text-xs text-slate-400">Available slots for today</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                    <span className="text-xs font-bold text-slate-700">Morning Consultation</span>
                  </div>
                  <span className="text-[10px] bg-primary-100/60 text-primary-800 px-2 py-0.5 rounded-md font-bold">10 AM - 1 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-slate-700">Evening Consultation</span>
                  </div>
                  <span className="text-[10px] bg-amber-100/60 text-amber-800 px-2 py-0.5 rounded-md font-bold">5 PM - 8 PM</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3 justify-center text-xs font-bold text-slate-500">
                <FaShieldAlt className="text-primary-500" /> Fully Encrypted Patient Portal
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Our Doctors Section */}
      <section id="doctors" className="py-24 bg-white border-t border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Our Specialists</h2>
            <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Highly certified doctors focusing on holistic treatment plans for lasting health remedies.
            </p>
          </div>

          {doctors.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold text-sm">
              No doctors listed for this branch yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doc) => (
                <div key={doc.id} className="group rounded-[28px] bg-white border border-slate-100/80 hover:border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                    {doc.image ? (
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <FaUserMd className="text-slate-200 text-7xl" />
                    )}
                    <span 
                      className="absolute bottom-4 right-4 px-3.5 py-1 rounded-full text-white font-extrabold text-[9px] tracking-wider uppercase shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {doc.shift || "Morning"}
                    </span>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{doc.name}</h3>
                      <p className="text-slate-400 text-xs font-bold mt-0.5">{doc.specialization || "Homeopathy Consultant"}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <FaClock className="text-slate-350" /> Slots Mon-Sat
                      </span>
                      <span className="text-slate-850 flex items-center text-sm font-black">
                        <FaRupeeSign className="text-xs" /> {doc.fees || "500"}
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        scrollToSection("booking");
                      }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 hover:text-white font-extrabold text-xs transition-colors hover:border-transparent"
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = primaryColor;
                        e.target.style.color = "#white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "";
                      }}
                    >
                      Choose & Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking" className="py-24 bg-[#fafbfc]">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-8 sm:p-12">
              
              <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-md">Consultation Booking</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">Reserve Your Time Slot</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Enter patient details below to sync registration with clinic node logs.</p>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-3 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => { setActiveTab("new"); setSuccessData(null); }}
                  className={`py-3 rounded-xl font-extrabold text-xs transition-all ${
                    activeTab === "new" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  New Patient Registration
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("re"); setSuccessData(null); }}
                  className={`py-3 rounded-xl font-extrabold text-xs transition-all ${
                    activeTab === "re" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Returning Consult (ID Login)
                </button>
              </div>

              {successData ? (
                /* Animated Booking Success State */
                <div className="py-8 text-center animate-fadeIn space-y-6">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-500 text-3xl shadow-sm">
                    <FaCheckCircle />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-800">Booking Confirmed!</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your consultation details have been successfully written to <strong>{branding.clinic_name || "the clinic"}</strong> ledger.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-150 text-left max-w-md mx-auto space-y-3 font-semibold text-xs text-slate-600">
                    <p className="text-slate-500 font-bold text-center border-b border-slate-100 pb-3 leading-relaxed">
                      Your booking is registered! Your patient portal login ID and password will be generated when your OPD receipt is processed.
                    </p>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Consultation Date:</span>
                      <span className="text-slate-800 font-extrabold">{successData.bookedDate} at {successData.bookedTimeSlot}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSuccessData(null)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs transition-colors"
                  >
                    Book Another Slot
                  </button>
                </div>
              ) : (
                /* Form Block */
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  
                  {activeTab === "re" && (
                    <div className="animate-fadeIn">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Patient ID *</label>
                      <input
                        type="text"
                        placeholder="e.g. P-12345 or Registered Mobile"
                        required
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value.trim())}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Patient Name *</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                      />
                    </div>
                    
                    {activeTab === "new" && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-550 block mb-1">Mobile Line *</label>
                        <input
                          type="tel"
                          placeholder="10-digit number"
                          maxLength={10}
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {activeTab === "new" && (
                    <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <label className="text-[11px] font-bold text-slate-550 block mb-1">Age</label>
                        <input
                          type="number"
                          placeholder="e.g. 28"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-550 block mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Disease Selection First */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-550 block mb-1">Select Disease / Problem Category *</label>
                      <select
                        required
                        value={selectedDisease}
                        onChange={(e) => {
                          setSelectedDisease(e.target.value);
                          setOverrideFilter(false);
                        }}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                      >
                        <option value="">Select Disease / Problem *</option>
                        {diseases.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Doctor Selection Second */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold text-slate-550">Choose Specialist *</label>
                        <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={overrideFilter}
                            onChange={(e) => setOverrideFilter(e.target.checked)}
                            className="rounded text-primary-600 focus:ring-primary-500 scale-90"
                          />
                          Show All Doctors
                        </label>
                      </div>
                      <select
                        required
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                      >
                        <option value="">Select Doctor</option>
                        {filteredDoctors.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-550 block mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-550 block mb-1">Preferred Timing Slot *</label>
                      <select
                        required
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/85 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white rounded-2xl text-xs outline-none transition-all duration-300 font-bold text-slate-850 shadow-sm"
                      >
                        {slotsLoading ? (
                          <option value="">Loading slots...</option>
                        ) : availableSlots.length > 0 ? (
                          availableSlots.map((slot, index) => (
                            <option key={index} value={slot}>{slot}</option>
                          ))
                        ) : (
                          <option value="">No slots available</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {bookingLoading ? "Registering consult details..." : "Confirm & Send Booking Entry"}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white tracking-wider uppercase">{branding.clinic_name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Premium holistic homeopathic treatment node synced with secure local database proxy protocols.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white tracking-wider uppercase">Contact Link</h4>
            <div className="space-y-2 text-xs font-semibold">
              <p className="flex items-center gap-2"><FaPhoneAlt className="text-primary-500" /> +91 99999 88888</p>
              <p className="flex items-center gap-2"><FaEnvelope className="text-primary-500" /> clinic@info.com</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white tracking-wider uppercase">Operations</h4>
            <p className="text-xs text-slate-500">
              Monday - Saturday: 10:00 AM - 08:00 PM <br />
              Sunday: Emergency Calls Only
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white tracking-wider uppercase">Secure Node</h4>
            <div className="flex items-center gap-2 text-xs font-semibold bg-slate-800 p-3 rounded-xl border border-slate-700/60 w-fit">
              <FaShieldAlt className="text-primary-500 text-sm" /> 
              <span>SSL SHA-256 Registered</span>
            </div>
          </div>

        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} fixedClinicId={adminId} />

    </div>
  );
};

export default CustomClinicUI;

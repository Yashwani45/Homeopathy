import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPhoneAlt,
  FaUserMd,
  FaCalendarAlt,
  FaUserPlus,
  FaRedoAlt
} from "react-icons/fa";
import { useBranding } from "../../context/BrandingContext";
const defaultDoctors = [
  { id: 101, name: "Dr. Sharma", specialization: "Homeopathy Specialist", shift: "Morning", fees: 500 },
  { id: 102, name: "Dr. Mishra", specialization: "Chronic Diseases Specialist", shift: "Evening", fees: 600 },
  { id: 103, name: "Dr. Verma", specialization: "Skin & Hair Expert", shift: "Morning", fees: 450 }
];

const defaultServices = [
  { id: 1, name: "General Consultation" },
  { id: 2, name: "Skin Treatment" },
  { id: 3, name: "Hair Treatment" },
  { id: 4, name: "Chronic Disease" }
];

const AppointmentSection = () => {
  const { fetchBranding } = useBranding();
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  //
  const [activeTab, setActiveTab] = useState("new");

  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [reSymptoms, setReSymptoms] = useState("");

  const [overrideFilter, setOverrideFilter] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Multi-Tenant States
  const [tenants, setTenants] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");

  // Patient auto-fetch feedback states
  const [fetchingPatient, setFetchingPatient] = useState(false);
  const [patientFoundStatus, setPatientFoundStatus] = useState(""); // "found" | "not_found" | ""
  const [matchedClinicName, setMatchedClinicName] = useState("");
  const [fetchedPatientId, setFetchedPatientId] = useState("");

  // Clear patient details when switching tabs
  useEffect(() => {
    setPatientId("");
    setPatientName("");
    setMobile("");
    setAge("");
    setGender("");
    setPatientFoundStatus("");
    setMatchedClinicName("");
    setFetchedPatientId("");
    setFetchingPatient(false);
  }, [activeTab]);

  // Auto-fetch patient details for reappointment with debounce
  useEffect(() => {
    const trimmedId = patientId.trim();
    if (activeTab === "re" && trimmedId.length >= 3) {
      setFetchingPatient(true);
      setPatientFoundStatus("");

      const timer = setTimeout(async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/patients/public-profile/${encodeURIComponent(trimmedId)}`
          );
          if (res.data && res.data.success && res.data.profile) {
            const profile = res.data.profile;
            setPatientName(profile.name || "");
            setMobile(profile.mobile || "");
            setAge(profile.age ? String(profile.age) : "");
            setGender(profile.gender || "");
            setFetchedPatientId(profile.patient_id || "");
            if (profile.admin_id) {
              setSelectedAdminId(profile.admin_id);
            }
            if (profile.clinic_name) {
              setMatchedClinicName(profile.clinic_name);
            }
            setPatientFoundStatus("found");
          } else {
            setPatientFoundStatus("not_found");
            setFetchedPatientId("");
          }
        } catch (err) {
          console.warn("Patient not found for reappointment:", err.message);
          setPatientFoundStatus("not_found");
          setFetchedPatientId("");
        } finally {
          setFetchingPatient(false);
        }
      }, 350);

      return () => clearTimeout(timer);
    } else if (activeTab === "re") {
      setPatientFoundStatus("");
      setFetchingPatient(false);
      setMatchedClinicName("");
      setFetchedPatientId("");
    }
  }, [patientId, activeTab]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const filteredDoctors = doctors.filter((doc) => {
    if (overrideFilter || !selectedService) return true;
    const serviceLower = selectedService.toLowerCase();
    
    // 1. Check if treated diseases string contains the selected service
    const diseaseString = doc.disease || "";
    const treatedMatch = diseaseString.toLowerCase().includes(serviceLower);
    
    // 2. Check if doctor's specialization contains the selected service
    const specString = doc.specialization || "";
    const specMatch = specString.toLowerCase().includes(serviceLower);
    
    return treatedMatch || specMatch;
  });

  // Fetch slots whenever doctor, date, or selected clinic changes
  useEffect(() => {
    if (selectedDoctorId && date && selectedAdminId) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/slots?doctorId=${selectedDoctorId}&date=${date}&adminId=${selectedAdminId}`);
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
  }, [selectedDoctorId, date, selectedAdminId]);

  // Fetch branding when selectedAdminId changes
  useEffect(() => {
    if (selectedAdminId) {
      fetchBranding(selectedAdminId);
    }
  }, [selectedAdminId]);

  // Load tenants first
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/public-clinics`);
        const tenantList = res.data && Array.isArray(res.data.clinics) ? res.data.clinics : [];
        setTenants(tenantList);
        if (tenantList.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const urlAdminId = params.get("adminId") || params.get("admin_id");
          if (urlAdminId) {
            setSelectedAdminId(parseInt(urlAdminId));
          } else {
            setSelectedAdminId(tenantList[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading tenants:", err);
      }
    };
    fetchTenants();
  }, []);

  // Load doctors and services from backend based on selected clinic
  useEffect(() => {
    if (!selectedAdminId) return;
    const loadData = async () => {
      try {
        const [docsRes, servicesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors?adminId=${selectedAdminId}`),
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases?adminId=${selectedAdminId}`)
        ]);
        setDoctors(docsRes.data && docsRes.data.length > 0 ? docsRes.data : []);
        setServices(servicesRes.data && servicesRes.data.length > 0 ? servicesRes.data : []);
      } catch (err) {
        console.error("Error loading doctors/services:", err);
        setDoctors([]);
        setServices([]);
      }
    };
    loadData();
    // Reset selected doctor/service when clinic changes
    setSelectedDoctorId("");
    setSelectedService("");
    setTimeSlot("");
    setAvailableSlots([]);
  }, [selectedAdminId]);
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}, []);
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !mobile || !date || !selectedDoctorId) {
      alert("Please fill in all required fields (Name, Mobile, Date, and Doctor)");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile)) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload file if exists
      let uploadedFileUrl = "";
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        try {
          const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          if (uploadRes.data && uploadRes.data.url) {
            uploadedFileUrl = uploadRes.data.url;
          }
        } catch (uploadErr) {
          console.error("Report upload failed:", uploadErr);
        }
      }

      const selectedDoctor = doctors.find((doc) => String(doc.id) === String(selectedDoctorId));

      // 2. Save booking to local MySQL database (with independent try-catch)
      let bookingDetails = null;
      try {
        const dbRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments`, {
          patient_name: patientName,
          mobile,
          doctor_id: parseInt(selectedDoctorId),
          date,
          appointment_time: timeSlot,
          patient_diseases: selectedService || "General Consultation",
          age,
          gender,
          admin_id: selectedAdminId
        });
        if (dbRes.data && dbRes.data.success) {
          bookingDetails = dbRes.data;
        }
      } catch (dbErr) {
        console.warn("Local database booking failed to save (Backend might be offline):", dbErr.message);
      }

      // 3. Send email to Gmail via Web3Forms (maintaining exact order)
      const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "566a11fa-d38c-4eb2-b320-cdb29bf5804f";
      const web3FormsPayload = {
        access_key: web3FormsAccessKey,
        subject: `New Appointment Booking - ${patientName}`,
        from_name: "Sumitra Homeopathy Clinic",
        "Patient ID": (bookingDetails && bookingDetails.patient_id) || "New Registration",
        "Patient Name": patientName,
        "Mobile Number": mobile,
        "Patient Age": age || "N/A",
        "Patient Gender": gender || "N/A",
        "Appointment Date": `${date} at ${timeSlot}`,
        "Selected Service": selectedService || "General Consultation",
        "Selected Doctor": selectedDoctor ? `${selectedDoctor.name} (${selectedDoctor.specialization || "General"})` : "N/A",
        "Attached Report/File Link": uploadedFileUrl || "No report attached",
        "Symptoms / Description": message || "None"
      };

      try {
        await axios.post("https://api.web3forms.com/submit", web3FormsPayload);
      } catch (mailErr) {
        console.warn("Web3Forms email submit failed:", mailErr);
      }

      if (bookingDetails && bookingDetails.success) {
        alert("Your Appointment Booking has been successfully submitted! Your patient ID and login details will be provided when your OPD receipt is processed.");
      } else {
        alert("Your Appointment Booking has been successfully submitted!");
      }

      // Reset form
      setPatientName("");
      setMobile("");
      setDate("");
      setTimeSlot("10:00 AM");
      setSelectedService("");
      setSelectedDoctorId("");
      setFile(null);
      setMessage("");
      setAge("");
      setGender("");
      // Clear file input manually
      const fileInput = document.getElementById("report-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      alert("Failed to submit appointment booking. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReappointmentSubmit = async (e) => {
    e.preventDefault();

    if (!patientId || !patientName || !date || !selectedDoctorId) {
      alert("Please fill in all required fields (Patient ID, Patient Name, Date, and Doctor)");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload file if exists
      let uploadedFileUrl = "";
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        try {
          const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          if (uploadRes.data && uploadRes.data.url) {
            uploadedFileUrl = uploadRes.data.url;
          }
        } catch (uploadErr) {
          console.error("Report upload failed:", uploadErr);
        }
      }

      const selectedDoctor = doctors.find((doc) => String(doc.id) === String(selectedDoctorId));
      const finalPatientId = fetchedPatientId || patientId;

      // 2. Save booking to local MySQL database
      const dbRes = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments`, {
        patient_id: finalPatientId,
        patient_name: patientName,
        mobile: mobile,
        doctor_id: parseInt(selectedDoctorId),
        date,
        appointment_time: timeSlot,
        patient_diseases: selectedService || "General Consultation",
        admin_id: selectedAdminId
      });

      if (dbRes.data && dbRes.data.success) {
        const mobileNum = dbRes.data.mobile || mobile;

        // 3. Send email to Gmail via Web3Forms
        const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "566a11fa-d38c-4eb2-b320-cdb29bf5804f";
        const web3FormsPayload = {
          access_key: web3FormsAccessKey,
          subject: `Follow-Up Appointment Booking - ${patientName}`,
          from_name: "Sumitra Homeopathy Clinic",
          "Patient ID": finalPatientId,
          "Patient Name": patientName,
          "Mobile Number": mobileNum,
          "Appointment Date": `${date} at ${timeSlot}`,
          "Selected Service": selectedService || "General Consultation",
          "Selected Doctor": selectedDoctor ? `${selectedDoctor.name} (${selectedDoctor.specialization || "General"})` : "N/A",
          "Attached Report/File Link": uploadedFileUrl || "No report attached",
          "Follow-Up Details / Symptoms": message || "None"
        };

        try {
          await axios.post("https://api.web3forms.com/submit", web3FormsPayload);
        } catch (mailErr) {
          console.warn("Web3Forms email submit failed:", mailErr);
        }

        alert(`Your Reappointment Booking has been successfully submitted!\n\nBooking ID: ${dbRes.data.booking_id}\nPatient ID: ${patientId}\n\nDetails have also been sent to your WhatsApp.`);

        // Reset form
        setPatientId("");
        setPatientName("");
        setMobile("");
        setAge("");
        setGender("");
        setDate("");
        setTimeSlot("10:00 AM");
        setSelectedService("");
        setSelectedDoctorId("");
        setFile(null);
        setMessage("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit reappointment booking: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
   <section className="bg-[#eef8f6] pt-36 pb-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* LEFT FORM */}
        <div className="flex-1 bg-white rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] p-5 sm:p-8">

          <div className="inline-flex items-center gap-3 bg-[#dff6ea] px-4 py-2 rounded-full mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>

            <span className="font-semibold text-[#0c8f64]">
              Available Now
            </span>

            <span className="text-[#246b5b]">
              Natural Healing Consultation
            </span>
          </div>

          <h2
            className="text-3xl sm:text-[46px] leading-tight font-bold text-[#08172d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Book An Appointment
          </h2>

          <p className="text-gray-500 mt-2 mb-8 text-lg">
            Fill in your details and our team will contact you shortly to
            confirm your consultation.
          </p>

          {/* reappointment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">

  <button
    type="button"
    onClick={() => setActiveTab("new")}
    className={`p-4 rounded-2xl border ${
      activeTab === "new"
        ? "bg-green-600 text-white"
        : "bg-white text-gray-700"
    }`}
  >
    <div className="flex items-center gap-2">
      <FaUserPlus />
      <span>New Patient</span>
    </div>
  </button>

  <button
    type="button"
    onClick={() => setActiveTab("re")}
    className={`p-4 rounded-2xl border ${
      activeTab === "re"
        ? "bg-[#0ca36d] text-white"
        : "bg-white text-gray-700"
    }`}
  >
    <div className="flex items-center gap-2">
      <FaRedoAlt />
      <span>Reappointment</span>
    </div>
  </button>

</div>

          

            {activeTab === "new" && (
<form onSubmit={handleFormSubmit} className="space-y-5">
  {/* Row 1 - Name & Mobile */}
<div className="grid md:grid-cols-2 gap-5">

  <input
    type="text"
    required
    value={patientName}
    onChange={(e) => setPatientName(e.target.value)}
    placeholder="Full Name *"
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
  />

  <input
    type="tel"
    required
    pattern="[0-9]{10}"
    maxLength={10}
    value={mobile}
    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
    placeholder="Phone Number (10 digits) *"
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
  />

</div>

{/* Row 2 - Gender & Age */}
<div className="grid md:grid-cols-2 gap-5">

  <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>

  <input
    type="number"
    value={age}
    onChange={(e) => setAge(e.target.value)}
    placeholder="Age (Years)"
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
  />

</div>

            {/* Row 1 */}
            {/* Row 2 - Disease & Doctor */}
<div className="grid md:grid-cols-2 gap-5">

  <select
    required
    value={selectedService}
    onChange={(e) => {
      setSelectedService(e.target.value);
      setOverrideFilter(false);
    }}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full font-semibold text-slate-800"
  >
    <option value="">Select Disease / Problem *</option>
    {services.map((s) => (
      <option key={s.id} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>

  <div className="flex flex-col w-full gap-1">
    <select
      required
      value={selectedDoctorId}
      onChange={(e) => setSelectedDoctorId(e.target.value)}
      className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
    >
      <option value="">Select Doctor *</option>
      {filteredDoctors.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} ({d.specialization || "General"})
        </option>
      ))}
    </select>
    {selectedService && (
      <label className="flex items-center gap-2 mt-1 px-1 text-xs font-bold text-slate-500 cursor-pointer">
        <input 
          type="checkbox" 
          checked={overrideFilter}
          onChange={(e) => setOverrideFilter(e.target.checked)}
          className="rounded text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
        />
        Show all doctors (ignore disease filter)
      </label>
    )}
  </div>

</div>

{/* Row 3 - Date Time Upload */}
<div className="grid md:grid-cols-3 gap-5">

  <input
    type="date"
    required
    value={date}
    onChange={(e) => setDate(e.target.value)}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
  />

  <select
    value={timeSlot}
    onChange={(e) => setTimeSlot(e.target.value)}
    disabled={!selectedDoctorId || !date || slotsLoading}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full disabled:opacity-60"
  >
    {!selectedDoctorId || !date ? (
      <option value="">Select Doctor & Date *</option>
    ) : slotsLoading ? (
      <option value="">Loading slots...</option>
    ) : availableSlots.length === 0 ? (
      <option value="">No slots available</option>
    ) : (
      availableSlots.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))
    )}
  </select>

  <div className="border border-primary-200 bg-primary-50 rounded-2xl p-4">
    <label
      htmlFor="reportUpload"
      className="flex items-center justify-between cursor-pointer"
    >
      <span className="text-sm font-medium">
        Upload Report
      </span>

      <span className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs">
        Choose
      </span>
    </label>

    <input
      id="reportUpload"
      type="file"
      onChange={(e) => setFile(e.target.files[0])}
      className="hidden"
    />

    {file && (
      <p className="mt-1 text-xs text-primary-700 truncate">
        ✓ {file.name}
      </p>
    )}
  </div>

</div>
            

            {/* Description */}
            <textarea
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your symptoms or health concerns..."
              className="w-full border border-gray-300 rounded-2xl p-5 resize-none outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            ></textarea>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0ca36d] hover:bg-[#09945f] text-white py-5 rounded-2xl text-xl font-semibold flex justify-center items-center gap-3 shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <FaCalendarAlt />
              {loading ? "Submitting Booking..." : "Schedule Appointment"}
            </button>

          </form>
          )}
{activeTab === "re" && (
  <form onSubmit={handleReappointmentSubmit} className="space-y-5">
  {/* Row 1 - Patient ID & Name */}
  <div className="grid md:grid-cols-2 gap-5">
    <div className="flex flex-col">
      <div className="relative">
        <input
          type="text"
          required
          placeholder="Patient ID or Mobile *"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className={`h-14 px-5 border rounded-2xl outline-none w-full pr-12 font-medium transition-all ${
            patientFoundStatus === "found"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30"
              : patientFoundStatus === "not_found" && patientId.trim().length >= 4
              ? "border-rose-300 bg-rose-50/20"
              : "border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
          }`}
        />
        {fetchingPatient && (
          <div className="absolute right-4 top-4.5 flex items-center">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          </div>
        )}
      </div>
      {patientFoundStatus === "found" && (
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3 py-2 mt-2">
          <span>✓ Verified: <span className="font-extrabold">{patientName}</span> {matchedClinicName ? `(${matchedClinicName})` : ""}</span>
          <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-md font-mono text-[11px] shadow-sm">
            Patient ID: {fetchedPatientId || patientId}
          </span>
        </div>
      )}
      {!patientFoundStatus && (
        <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
          💡 <strong>Forgot your ID?</strong> Enter your registered 10-digit mobile number here.
        </p>
      )}
      {patientFoundStatus === "not_found" && patientId.trim().length >= 4 && !fetchingPatient && (
        <span className="text-xs font-semibold text-rose-500 mt-1.5 ml-1">
          ⚠️ Patient not found. Please check your Patient ID or registered mobile.
        </span>
      )}
    </div>

    <input
      type="text"
      required
      placeholder="Patient Name (Auto-fetched) *"
      value={patientName}
      onChange={(e) => setPatientName(e.target.value)}
      className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full bg-slate-50 font-semibold text-slate-800"
    />
  </div>

  {/* Row 2 - Phone Number, Age & Gender (Auto-fetched) */}
  <div className="grid md:grid-cols-3 gap-5">
    <input
      type="text"
      placeholder="Phone Number (Auto-fetched)"
      value={mobile}
      onChange={(e) => setMobile(e.target.value)}
      className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full bg-slate-50 font-semibold text-slate-800"
    />
    <input
      type="text"
      placeholder="Age (Auto-fetched)"
      value={age}
      onChange={(e) => setAge(e.target.value)}
      className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full bg-slate-50 font-semibold text-slate-800"
    />
    <input
      type="text"
      placeholder="Gender (Auto-fetched)"
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full bg-slate-50 font-semibold text-slate-800"
    />
  </div>

  {/* Row 3 - Disease & Doctor */}
  <div className="grid md:grid-cols-2 gap-5">

  <select
    required
    value={selectedService}
    onChange={(e) => {
      setSelectedService(e.target.value);
      setOverrideFilter(false);
    }}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full font-semibold text-slate-800"
  >
    <option value="">Select Disease / Problem *</option>
    {services.map((s) => (
      <option key={s.id} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>

  <div className="flex flex-col w-full gap-1">
    <select
      required
      value={selectedDoctorId}
      onChange={(e) => setSelectedDoctorId(e.target.value)}
      className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
    >
      <option value="">Select Doctor *</option>
      {filteredDoctors.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} ({d.specialization || "General"})
        </option>
      ))}
    </select>
    {selectedService && (
      <label className="flex items-center gap-2 mt-1 px-1 text-xs font-bold text-slate-500 cursor-pointer">
        <input 
          type="checkbox" 
          checked={overrideFilter}
          onChange={(e) => setOverrideFilter(e.target.checked)}
          className="rounded text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
        />
        Show all doctors (ignore disease filter)
      </label>
    )}
  </div>

</div>

{/* Row 4 - Date, Time, Upload */}
<div className="grid md:grid-cols-3 gap-5">

  <input
    type="date"
    required
    value={date}
    onChange={(e) => setDate(e.target.value)}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full"
  />

  <select
    value={timeSlot}
    onChange={(e) => setTimeSlot(e.target.value)}
    disabled={!selectedDoctorId || !date || slotsLoading}
    className="h-14 px-5 border border-gray-300 rounded-2xl outline-none w-full disabled:opacity-60"
  >
    {!selectedDoctorId || !date ? (
      <option value="">Select Doctor & Date *</option>
    ) : slotsLoading ? (
      <option value="">Loading slots...</option>
    ) : availableSlots.length === 0 ? (
      <option value="">No slots available</option>
    ) : (
      availableSlots.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))
    )}
  </select>

    <div className="border border-primary-200 bg-primary-50 rounded-2xl p-4">
      <label
        htmlFor="reportUpload"
        className="flex items-center justify-between cursor-pointer"
      >
        <span className="text-sm font-medium">
          Upload Report
        </span>

        <span className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs">
          Choose
        </span>
      </label>

      <input
        id="reportUpload"
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="hidden"
      />

      {file && (
        <p className="mt-1 text-xs text-primary-700 truncate">
          ✓ {file.name}
        </p>
      )}
    </div>

  </div>

  {/* Description */}
  <textarea
    rows="5"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Describe your symptoms or health concerns..."
    className="w-full border border-gray-300 rounded-2xl p-5 resize-none outline-none focus:border-primary-500"
  />

  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-[#0ca36d] hover:bg-[#09945f] text-white py-5 rounded-2xl text-xl font-semibold flex justify-center items-center gap-3 shadow-lg transition-all duration-300 disabled:opacity-50"
  >
    <FaCalendarAlt />
    {loading ? "Submitting Booking..." : "Schedule Appointment"}
  </button>

</form>
)}
        </div>

        {/* RIGHT PANEL */}
      


        <div className="w-full lg:w-[390px] self-center rounded-2xl bg-gradient-to-br from-slate-950 to-primary-900 px-8 py-5 text-white shadow-2xl">

  <h3 className="text-3xl font-bold text-white font-serif">
    Opening Hours
  </h3>

  <div className="mt-5 space-y-3 text-sm">

    <div className="flex justify-between border-b border-white/15 pb-2">
      <span>Monday - Saturday</span>
      <span>08:30 AM - 02:00 PM</span>
    </div>

    <div className="flex justify-between border-b border-white/15 pb-2">
      <span>Evening Clinic</span>
      <span>05:30 PM - 09:00 PM</span>
    </div>

    <div className="flex justify-between">
      <span>Sunday</span>
      <span>Closed</span>
    </div>

  </div>

  {/* Emergency Contact */}
  <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
    <div className="flex items-center gap-3">
      <FaPhoneAlt className="text-xl" />
      <div>
        <p className="text-sm text-white/70">
          Emergency Contact
        </p>

        <p className="text-lg font-semibold">
          +91 91091 02650
        </p>
      </div>
    </div>
  </div>

  {/* Specialist */}
  <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
    <div className="flex items-center gap-3">
      <FaUserMd className="text-xl" />

      <div>
        <p className="text-sm text-white/70">
          Specialist
        </p>

        <p className="font-semibold">
          Classical Homeopathy Expert
        </p>
      </div>
    </div>
  </div>

  {/* Call Button */}
  <a
    href="tel:+919109102650"
    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-primary-800 hover:bg-slate-100 transition"
  >
    Call Clinic
    <FaPhoneAlt />
  </a>
</div>


      </div>
    </section>
  );
};

export default AppointmentSection;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPhone,
  FaUserMd,
  FaUpload,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarCheck,
} from "react-icons/fa";

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

const Appointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");

  const [overrideFilter, setOverrideFilter] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const filteredDoctors = doctors.filter((doc) => {
    if (overrideFilter || !selectedService) return true;
    const specs = doc.specializations || [];
    return specs.some((s) => s.toLowerCase() === selectedService.toLowerCase());
  });

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && date) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/slots?doctorId=${selectedDoctorId}&date=${date}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
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
  }, [selectedDoctorId, date]);

  // Load doctors and services from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [docsRes, servicesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/diseases`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
        ]);
        setDoctors(docsRes.data && docsRes.data.length > 0 ? docsRes.data : defaultDoctors);
        setServices(servicesRes.data && servicesRes.data.length > 0 ? servicesRes.data : defaultServices);
      } catch (err) {
        console.error("Error loading doctors/services:", err);
        setDoctors(defaultDoctors);
        setServices(defaultServices);
      }
    };
    loadData();
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
      // 1. Upload report file if exists
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

      // Find doctor details for Web3Forms email
      const selectedDoctor = doctors.find((doc) => String(doc.id) === String(selectedDoctorId));

      // 2. Save booking to local MySQL database (with independent try-catch)
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments`,
          {
            patient_name: patientName,
            mobile,
            doctor_id: parseInt(selectedDoctorId),
            date,
            appointment_time: timeSlot,
            patient_diseases: selectedService || "General Consultation"
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (dbErr) {
        console.warn("Local database booking failed to save (Backend might be offline):", dbErr.message);
      }

      // 3. Send email to Gmail via Web3Forms (maintaining exact order)
      const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "566a11fa-d38c-4eb2-b320-cdb29bf5804f";
      const web3FormsPayload = {
        access_key: web3FormsAccessKey,
        subject: `New Admin-Scheduled Booking - ${patientName}`,
        from_name: "Sumitra Homeopathy Clinic (Admin)",
        "Patient Name": patientName,
        "Mobile Number": mobile,
        "Appointment Date": date,
        "Selected Service": selectedService || "General Consultation",
        "Selected Doctor": selectedDoctor ? `${selectedDoctor.name} (${selectedDoctor.specialization || "General"})` : "N/A",
        "Attached Report/File Link": uploadedFileUrl || "No report attached",
        "Symptoms / Health Concerns": message || "None"
      };

      await axios.post("https://api.web3forms.com/submit", web3FormsPayload);

      alert("Appointment booking has been successfully scheduled!");
      // Reset form
      setPatientName("");
      setMobile("");
      setDate("");
      setSelectedService("");
      setSelectedDoctorId("");
      setFile(null);
      setMessage("");
      // Clear file input manually
      const fileInput = document.getElementById("admin-report-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      alert("Failed to submit appointment booking. Please check your internet connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-200 to-green-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-[32px] mb-8 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f"
            alt="Clinic"
            className="w-full h-[180px] md:h-[250px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E]/90 to-transparent flex items-center">
            <div className="px-6 md:px-12 text-white max-w-2xl">
              <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm">
                🟢 Available Today
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mt-4">
                Book Your Appointment
              </h1>
              <p className="mt-4 text-white/90">
                Get personalized homeopathic consultation from experienced
                specialists. Natural healing with trusted care.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT FORM SECTION */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-md rounded-[32px] shadow-xl border border-white p-6 md:p-8 hover:bg-blue-50 hover:shadow-2xl transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  Schedule Consultation
                </h2>
                <p className="text-gray-500 mt-2">
                  Fill your details and we will contact you shortly.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none hover:bg-pink-50 transition"
                  />

                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="Phone Number (10 digits) *"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none hover:bg-blue-50 transition"
                  />

                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none hover:bg-pink-50 transition"
                  />

                  <select 
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setOverrideFilter(false);
                    }}
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none hover:bg-blue-50 transition"
                  >
                    <option value="">Select Service (Optional)</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  <div className="flex flex-col w-full gap-1">
                    <select 
                      required
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none hover:bg-pink-50 transition"
                    >
                      <option value="">Select Doctor *</option>
                      {filteredDoctors.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialization || "General"})</option>
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
                        Show all doctors (ignore specialization filter)
                      </label>
                    )}
                  </div>

                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    disabled={!selectedDoctorId || !date || slotsLoading}
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none hover:bg-blue-50 transition disabled:opacity-60"
                  >
                    {!selectedDoctorId || !date ? (
                      <option value="">Select Doctor & Date *</option>
                    ) : slotsLoading ? (
                      <option value="">Loading slots...</option>
                    ) : availableSlots.length === 0 ? (
                      <option value="">No slots available</option>
                    ) : (
                      availableSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))
                    )}
                  </select>

                  <label className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:bg-blue-50 transition">
                    <span className="text-gray-500">
                      {file ? file.name : "Upload Reports (Optional)"}
                    </span>
                    <FaUpload className="text-green-600" />
                    <input 
                      id="admin-report-file-input"
                      type="file" 
                      hidden 
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your symptoms or health concerns..."
                  className="w-full mt-5 px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none h-36 resize-none hover:bg-pink-50 transition"
                />

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-[#0F766E] to-[#22C55E] text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
                >
                  <FaCalendarCheck className="inline mr-2" />
                  {loading ? "Scheduling Appointment..." : "Schedule Appointment"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">

            {/* DOCTOR CARD */}
            <div className="bg-white rounded-[28px] shadow-lg p-6 text-center hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d"
                alt="Doctor"
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-green-100"
              />
              <h3 className="text-xl font-bold mt-4">
                Dr. Sumitra Sharma
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Classical Homeopathy Specialist
              </p>
              <div className="mt-4">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                  25+ Years Experience
                </span>
              </div>
            </div>

            {/* HOURS CARD */}
            <div className="bg-[#1E293B] text-white rounded-[28px] p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <FaClock />
                <h3 className="font-bold text-lg">
                  Opening Hours
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p>Monday - Saturday</p>
                  <p className="text-green-300">
                    08:30 AM - 02:00 PM
                  </p>
                </div>
                <div>
                  <p>Evening Clinic</p>
                  <p className="text-green-300">
                    05:30 PM - 09:00 PM
                  </p>
                </div>
                <div>
                  <p>Sunday</p>
                  <p className="text-red-300">
                    Closed
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT CARD */}
            <div className="bg-white rounded-[28px] shadow-lg p-6 hover:bg-pink-50 transition">
              <div className="flex items-center gap-4">
                <FaPhone className="text-green-600 text-xl" />
                <div>
                  <p className="text-gray-500 text-sm">
                    Emergency Contact
                  </p>
                  <h3 className="font-bold">
                    +91 91091 02650
                  </h3>
                </div>
              </div>
            </div>

            {/* LOCATION CARD */}
            <div className="bg-white rounded-[28px] shadow-lg p-6 hover:bg-blue-50 transition">
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-red-500 text-xl" />
                <div>
                  <p className="text-gray-500 text-sm">
                    Clinic Address
                  </p>
                  <h3 className="font-bold">
                    Sumitra Homeopathy Clinic
                  </h3>
                </div>
              </div>
            </div>

            {/* CALL BUTTON */}
            <a
              href="tel:+919109102650"
              className="w-full flex items-center justify-center bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg text-center"
            >
              Call Clinic
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Appointment;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaLock, FaUserMd, FaTimes, FaUsers } from "react-icons/fa";

const LoginModal = ({ isOpen, onClose, fixedClinicId }) => {
  const [role, setRole] = useState("patient"); // 'patient', 'doctor', 'staff'
  const [username, setUsername] = useState(""); // Doctor username
  const [patientId, setPatientId] = useState(""); // Patient ID
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (fixedClinicId) {
        setSelectedClinicId(String(fixedClinicId));
        return;
      }
      const fetchClinics = async () => {
        try {
          const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const res = await axios.get(`${base}/api/auth/public-clinics`);
          if (res.data && res.data.success) {
            const list = res.data.clinics || [];
            setClinics(list);
            
            const savedAdminId = localStorage.getItem("adminId");
            if (savedAdminId && list.some(c => String(c.id) === String(savedAdminId))) {
              setSelectedClinicId(savedAdminId);
            } else if (list.length > 0) {
              setSelectedClinicId(String(list[0].id));
            }
          }
        } catch (err) {
          console.warn("Failed to load clinics in LoginModal:", err.message);
        }
      };
      fetchClinics();
    }
  }, [isOpen, fixedClinicId]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedClinicId) {
        alert("Please select a clinic branch");
        setLoading(false);
        return;
      }

      let res;
      if (role === "patient") {
        if (!patientId || !password) {
          alert("Please fill all patient credentials");
          setLoading(false);
          return;
        }
        res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/patient/login`, {
          patient_id: patientId.trim(),
          password,
          adminId: parseInt(selectedClinicId)
        });
      } else {
        if (!username || !password) {
          alert("Please fill all credentials");
          setLoading(false);
          return;
        }
        res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/doctor/login`, {
          username: username.trim(),
          password,
          adminId: parseInt(selectedClinicId)
        });
      }

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        const resolvedRole = res.data.role || role;
        localStorage.setItem("role", resolvedRole);
        if (res.data.adminId) {
          localStorage.setItem("adminId", String(res.data.adminId));
        }

        if (resolvedRole === "patient") {
          localStorage.setItem("patientId", res.data.patientId);
          localStorage.setItem("patientName", res.data.patientName);
          window.location.href = "/patient/dashboard";
        } else if (resolvedRole === "staff") {
          localStorage.setItem("staffId", res.data.staffId);
          localStorage.setItem("staffName", res.data.username);
          window.location.href = "/admin/dashboard";
        } else {
          localStorage.setItem("doctorId", res.data.doctorId);
          localStorage.setItem("doctorName", res.data.doctorName);
          window.location.href = "/doctor/dashboard";
        }
      } else {
        alert(res.data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.error || error.response?.data?.message || "Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div 
        className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-50 rounded-full"
          aria-label="Close modal"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-bold text-slate-800">Clinic Portal</h2>
          <p className="text-slate-500 text-xs mt-1">Select your role to access your dashboard</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setRole("patient"); setPassword(""); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === "patient" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaUser className="text-xs" />
            Patient Portal
          </button>
          <button
            type="button"
            onClick={() => { setRole("doctor"); setPassword(""); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === "doctor" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaUserMd className="text-xs" />
            Doctor Portal
          </button>
          <button
            type="button"
            onClick={() => { setRole("staff"); setPassword(""); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === "staff" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaUsers className="text-xs" />
            Staff Portal
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Clinic selection dropdown */}
          {!fixedClinicId && (
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Clinic Branch *</label>
              <select
                required
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm font-semibold text-slate-800 outline-none transition"
              >
                <option value="">Choose Clinic...</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clinic_name || c.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Patient ID or Username Input */}
          {role === "patient" ? (
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Patient ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><FaUser size={13} /></span>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAT10293"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm outline-none transition"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Doctor Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><FaUserMd size={14} /></span>
                <input
                  type="text"
                  required
                  placeholder="Enter doctor username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><FaLock size={13} /></span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#0F766E] hover:bg-[#0d645d] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Verifying..." : `Login as ${role === "patient" ? "Patient" : "Doctor"}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

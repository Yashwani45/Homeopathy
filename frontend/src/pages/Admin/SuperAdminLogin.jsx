import React, { useState } from "react";
import axios from "axios";
import { FaLock, FaShieldAlt } from "react-icons/fa";

const SuperAdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username || !password) {
        alert("Please fill all super admin credentials");
        setLoading(false);
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        username,
        password
      });

      if (res.data.success) {
        if (res.data.role !== "super_admin") {
          alert("Access Denied: Only Super Admin is authorized to login here. Please use the Clinic Admin login page.");
          setLoading(false);
          return;
        }

        alert("Super Admin Login Successful!");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("adminId", res.data.adminId || 1);
        window.location.href = "/super-admin/dashboard";
      } else {
        alert(res.data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 sm:py-12 lg:py-0 bg-gradient-to-br from-[#F4F9F6] via-[#E8F5EE] to-[#D1EADF]">
      {/* BIG CONTAINER */}
      <div className="w-[92%] sm:w-[85%] md:w-[75%] lg:w-[85%] xl:w-[75%] h-auto lg:h-[90vh] bg-white rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] shadow-2xl overflow-hidden grid lg:grid-cols-2 border border-[#E2E8F0]">
        
        {/* LEFT SIDE (Homeopathy Theme Match) */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#005B41] via-[#00875A] to-[#00A878] p-12 xl:p-16 text-white flex-col justify-center">
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl top-0 left-0"></div>
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl bottom-0 right-0"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-20 h-20 bg-white flex items-center justify-center rounded-2xl shadow-lg">
                <FaShieldAlt className="text-[#00875A] text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Homeopathy World</h1>
                <p className="text-primary-100 font-medium">Super Administration</p>
              </div>
            </div>

            <h2 className="text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
              Root Authority
              <span className="block text-primary-200 text-4xl xl:text-5xl mt-2 font-semibold">
                & Tenant Control
              </span>
            </h2>

            <p className="text-lg text-primary-50 mb-10 opacity-90 leading-relaxed">
              Access restricted to the system owner. Use this portal to initialize clinics, update tenant licenses, and configure administrative logins.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <h3 className="text-2xl font-bold">Global</h3>
                <p className="text-sm text-primary-100 opacity-80">Multi-Tenant Guard</p>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <h3 className="text-2xl font-bold">Secure</h3>
                <p className="text-sm text-primary-100 opacity-80">Encryption Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Form Context) */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
          <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 sm:space-y-7">
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Super Admin Login</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">Please enter your root authority credentials</p>
            </div>

            {/* USERNAME FIELD */}
            <div>
              <label className="font-bold text-slate-600 text-xs sm:text-sm block mb-1.5 ml-1">Super Admin Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#00875A] group-focus-within:text-[#005B41] transition-colors">
                  <FaShieldAlt />
                </span>
                <input
                  type="text"
                  required
                  placeholder="superadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 focus:border-[#00875A] focus:ring-4 focus:ring-[#00875A]/10 focus:bg-white rounded-2xl text-sm outline-none transition-all duration-300 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="font-bold text-slate-600 text-xs sm:text-sm block mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#00875A] group-focus-within:text-[#005B41] transition-colors">
                  <FaLock />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 focus:border-[#00875A] focus:ring-4 focus:ring-[#00875A]/10 focus:bg-white rounded-2xl text-sm outline-none transition-all duration-300 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00875A] to-[#00A878] hover:from-[#006F4A] hover:to-[#00875A] text-white py-3.5 rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-md hover:shadow-lg hover:shadow-[#00875A]/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Verifying Authority..." : "Login as Super Admin"}
            </button>

            <div className="text-center pt-2">
              <a
                href="/"
                className="text-[#00875A] hover:text-[#006F4A] hover:underline text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 transition-colors"
              >
                ← Back to Home Page
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
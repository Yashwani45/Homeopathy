import React, { useState } from "react";
import axios from "axios";
import { FaUserMd, FaLock, FaShieldAlt, FaUser, FaWheelchair } from "react-icons/fa";
import { useBranding } from "../../context/BrandingContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { applyTheme } = useBranding();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username || !password) {
        alert("Please fill all admin credentials");
        setLoading(false);
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        username,
        password
      });

      if (res.data.success) {
        if (res.data.role === "super_admin") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);
          localStorage.setItem("adminId", String(res.data.id || 1));
          window.location.href = "/super-admin/dashboard";
          return;
        }

        // Save auth data to localStorage
        localStorage.setItem("token",    res.data.token);
        localStorage.setItem("role",     res.data.role || "admin");
        localStorage.setItem("adminId",  String(res.data.id || 1));

        // Immediately apply clinic branding received from login response
        applyTheme(
          res.data.theme_color,
          res.data.clinic_name,
          res.data.logo_url,
          res.data.logo_width,
          res.data.logo_height,
          res.data.clinic_address,
          res.data.clinic_phone,
          res.data.clinic_details
        );

        window.location.href = "/admin/dashboard";
      } else {
        alert(res.data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Server Error. Please try again.";
      if (typeof errMsg === "string" && errMsg.includes("Clinic Admin ID is required")) {
        alert("Account '" + username + "' not found in the system.\n\n👉 If you are the system administrator, use:\nUsername: superadmin\nPassword: superadmin");
      } else {
        alert(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 sm:py-12 lg:py-0 bg-gradient-to-br from-[#DFF5F1] via-[#F5FFFD] to-[#CDEFE8]">

      {/* BIG CONTAINER */}
      <div className="w-[92%] sm:w-[85%] md:w-[75%] lg:w-[85%] xl:w-[75%] h-auto lg:h-[90vh] bg-white rounded-[30px] sm:rounded-[40px] lg:rounded-[50px] shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#425d6e] to-[#79e0da] p-12 xl:p-16 text-white flex-col justify-center">
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl top-0 left-0"></div>
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl bottom-0 right-0"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-20 h-20 bg-white flex items-center justify-center rounded-2xl">
                <FaShieldAlt className="text-[#94dad4] text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Sumitra Clinic</h1>
                <p className="text-primary-200">Admin Control Center</p>
              </div>
            </div>

            <h2 className="text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
              Security
              <span className="block text-primary-300">
                & Administration
              </span>
            </h2>

            <p className="text-lg text-primary-100 mb-10">
              Authorized access only. Log in to manage clinic operations, doctors directory, and patient medical files.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 p-6 rounded-2xl">
                <h3 className="text-3xl font-bold">Secure</h3>
                <p className="text-sm text-primary-200">JWT Encrypted</p>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl">
                <h3 className="text-3xl font-bold">Full</h3>
                <p className="text-sm text-primary-200">System Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 sm:space-y-7">

            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Admin Login</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">Please enter your administrator credentials</p>
            </div>

            {/* USERNAME FIELD */}
            <div>
              <label className="font-bold text-slate-600 text-xs sm:text-sm block mb-1.5 ml-1">Admin Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-450 group-focus-within:text-teal-600 transition-colors">
                  <FaShieldAlt />
                </span>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white rounded-2xl text-sm outline-none transition-all duration-300 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="font-bold text-slate-600 text-xs sm:text-sm block mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-450 group-focus-within:text-teal-600 transition-colors">
                  <FaLock />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white rounded-2xl text-sm outline-none transition-all duration-300 font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3.5 rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-md hover:shadow-lg hover:shadow-teal-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>

            <div className="text-center pt-2 flex flex-col gap-2">
              <a
                href="/super-admin/login"
                className="text-teal-600 hover:text-teal-700 hover:underline text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                🔐 Super Admin Portal (/super-admin/login) →
              </a>
              <a
                href="/"
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
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

export default Login;

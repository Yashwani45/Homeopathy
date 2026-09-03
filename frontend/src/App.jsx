import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import RouteLoader from "./components/RouteLoader";
import PageLoader from "./components/PageLoader";

import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import SuperAdminDashboard from "./pages/Admin/SuperAdminDashboard";
import SuperAdminLogin from "./pages/Admin/SuperAdminLogin";
import Appointment from "./pages/Admin/Appointment";
import PatientDashboard from "./pages/Patient/Dashboard";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import PatientRecord from "./pages/Patient/Record";
import PatientReportPage from "./pages/Patient/ReportPage";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OnlineConsultation from "./pages/OnlineConsultation";
import Homeopathy from "./pages/Homeopathy";
import AppointmentSection from "./pages/Home/Appointment";
import CustomClinicUI from "./pages/CustomClinicUI";

const App = () => {
  const [initialLoading, setInitialLoading] = useState(true);

  const location = useLocation();

  // 🔥 FIX: hide Header/Footer on admin, super-admin, login, doctor, patient, and clinic-specific custom UI paths
  const isAdminRoute =
    location.pathname.toLowerCase().startsWith("/admin") ||
    location.pathname.toLowerCase().startsWith("/super-admin") ||
    location.pathname.toLowerCase().startsWith("/login") ||
    location.pathname.toLowerCase().startsWith("/doctor") ||
    location.pathname.toLowerCase().startsWith("/patient") ||
    location.pathname.toLowerCase().startsWith("/clinic");

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* HEADER ONLY FOR NON-PORTAL */}
      {!isAdminRoute && <Header />}

      <ScrollToTop />
      <RouteLoader />

      <main className="flex-grow">
        <Routes>

          {/* WEBSITE ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/Online-Consultation" element={<OnlineConsultation />} />
          <Route path="/Homeopathy" element={<Homeopathy />} />

          
          {/* CUSTOM TENANT CLINIC LANDING PAGE & BOOKING UI */}
          <Route path="/clinic/:adminId" element={<CustomClinicUI />} />

          {/* PORTALS & AUTH ROUTES */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin/appointment" element={<Appointment />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/patient/:patientId" element={<PatientRecord />} />
          <Route path="/patient/report/:patientId" element={<PatientReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          

        </Routes>
      </main>

      {/* FOOTER ONLY FOR NON-ADMIN */}
      {!isAdminRoute && <Footer />}

    </div>
  );
};

export default App;

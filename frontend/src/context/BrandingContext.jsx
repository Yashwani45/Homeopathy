import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BrandingContext = createContext();

const DEFAULT_COLOR = "#CA6180";

const adjustBrightness = (hex, percent) => {
  if (!hex || !hex.startsWith("#")) return hex;
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.min(255, Math.max(0, parseInt((R * (100 + percent)) / 100)));
  G = Math.min(255, Math.max(0, parseInt((G * (100 + percent)) / 100)));
  B = Math.min(255, Math.max(0, parseInt((B * (100 + percent)) / 100)));

  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    clinic_name: "Homeopathy World",
    logo_url: null,
    theme_color: DEFAULT_COLOR,
    theme_hover: adjustBrightness(DEFAULT_COLOR, -12),
    theme_dark: adjustBrightness(DEFAULT_COLOR, -40),
    logo_width: 120,
    logo_height: 120,
    clinic_address: null,
    clinic_phone: null,
    clinic_details: null
  });

  // Core function: apply CSS variables + update state
  const applyTheme = (themeColor, clinicName = "Homeopathy World", logoUrl = null, logoWidth = 120, logoHeight = 120, clinicAddress = null, clinicPhone = null, clinicDetails = null) => {
    const root = document.documentElement;
    const cleanColor = themeColor || DEFAULT_COLOR;
    const hoverColor = adjustBrightness(cleanColor, -12);
    const darkColor  = adjustBrightness(cleanColor, -40);

    root.style.setProperty("--primary-color", cleanColor);
    root.style.setProperty("--primary-hover", hoverColor);
    root.style.setProperty("--primary-dark",  darkColor);

    const resolved = {
      clinic_name: clinicName || "Homeopathy World",
      logo_url: logoUrl || null,
      theme_color: cleanColor,
      theme_hover: hoverColor,
      theme_dark: darkColor,
      logo_width: parseInt(logoWidth) || 120,
      logo_height: parseInt(logoHeight) || 120,
      clinic_address: clinicAddress || null,
      clinic_phone: clinicPhone || null,
      clinic_details: clinicDetails || null
    };
    setBranding(resolved);

    // Persist to localStorage for instant reload
    localStorage.setItem("clinic_name",     resolved.clinic_name);
    localStorage.setItem("theme_color",     resolved.theme_color);
    localStorage.setItem("logo_url",        resolved.logo_url || "");
    localStorage.setItem("logo_width",      resolved.logo_width);
    localStorage.setItem("logo_height",     resolved.logo_height);
    localStorage.setItem("clinic_address",  resolved.clinic_address || "");
    localStorage.setItem("clinic_phone",    resolved.clinic_phone || "");
    localStorage.setItem("clinic_details",  resolved.clinic_details || "");
  };

  // Reset to default (e.g. on logout)
  const resetTheme = () => {
    localStorage.removeItem("clinic_name");
    localStorage.removeItem("theme_color");
    localStorage.removeItem("logo_url");
    localStorage.removeItem("logo_width");
    localStorage.removeItem("logo_height");
    localStorage.removeItem("clinic_address");
    localStorage.removeItem("clinic_phone");
    localStorage.removeItem("clinic_details");
    applyTheme(DEFAULT_COLOR, "Homeopathy World", null, 120, 120, null, null, null);
  };

  // Fetch branding from server by adminId
  const fetchBranding = async (adminId) => {
    if (!adminId) return;
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.get(`${base}/api/auth/branding/${adminId}`);
      if (res.data && res.data.success) {
        const b = res.data.branding;
        applyTheme(b.theme_color, b.clinic_name, b.logo_url, b.logo_width, b.logo_height, b.clinic_address, b.clinic_phone, b.clinic_details);
      }
    } catch (err) {
      console.warn("Could not load clinic branding, using defaults:", err.message);
    }
  };

  // On app start: restore from localStorage or fetch from server
  useEffect(() => {
    const role    = localStorage.getItem("role");
    const adminId = localStorage.getItem("adminId");

    const savedColor   = localStorage.getItem("theme_color");
    const savedName    = localStorage.getItem("clinic_name");
    const savedLogo    = localStorage.getItem("logo_url");
    const savedWidth   = localStorage.getItem("logo_width");
    const savedHeight  = localStorage.getItem("logo_height");
    const savedAddress = localStorage.getItem("clinic_address");
    const savedPhone   = localStorage.getItem("clinic_phone");
    const savedDetails = localStorage.getItem("clinic_details");

    if (savedColor || savedName) {
      // Instant restore from cache
      applyTheme(
        savedColor, 
        savedName, 
        savedLogo, 
        parseInt(savedWidth) || 120, 
        parseInt(savedHeight) || 120,
        savedAddress || null,
        savedPhone || null,
        savedDetails || null
      );
    } else if (adminId && role !== "super_admin") {
      // Fetch from server if no cache
      fetchBranding(adminId);
    }
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, applyTheme, resetTheme, fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);

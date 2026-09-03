import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Hero from "../components/Background";
import Info from "./Contact/InfoCards";
import Map from "./Contact/Map";
import Form from "./Contact/ContactForm";

const Contact = () => {
  return (
    <div className=" mt-28">
      {/* ================= HERO ================= */}
     <Hero title="Contact" breadcrumb="Contact" />


      {/* ================= INFO CARDS ================= */}
      <Info />

      {/* ================= MAP ================= */}
      <Map />

      {/* ================= CONTACT FORM ================= */}
      
     <Form />

    </div>
  );
};

export default Contact;

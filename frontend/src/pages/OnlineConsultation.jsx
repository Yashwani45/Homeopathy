import React, { useState } from "react";
import online from "../Images/OnlineConsultation/Homeopathy-2.webp"
import Hero from "../components/Background";
import Main from "./OnlineConsultation/Main";
import ConsultationServices from "./OnlineConsultation/ConsultationServices";
import Info from "./OnlineConsultation/Info";



const OnlineConsultation = () => {
 

  return (
    <div className=" mt-28">
      {/* ================= HERO ================= */}
      <Hero title="Online Consultation" breadcrumb="Online Consultation" />

      {/* ================= MAIN BANNER ================= */}
     <Main />

      {/* ================= SPECIALTY TREATMENTS ================= */}
     <ConsultationServices />

      {/* ================= INFO CARDS ================= */}
     <Info />
 </div>
  );
};

export default OnlineConsultation;

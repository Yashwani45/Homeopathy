import React from "react";
import {
  FaCheckCircle,
  FaUsers,
  FaSmile,
  FaClock,
  FaHospital,
} from "react-icons/fa";

import Hero from "../components/Background"
import Abouut from "./About/AboutContent";
import Stats from "./About/StatsSection";
import Why from "./About/Why";
import Experience from "./About/Experience";

const About = () => {
  return (
    <div className=" mt-28">
     <Hero title="About Us" breadcrumb="About Us" />

      {/* ================= ABOUT CONTENT ================= */}
      <Abouut />

      {/* ================= STATS SECTION ================= */}
      <Stats />

      {/* ================= WHY CHOOSE US ================= */}
      <Why />

      {/* ================= EXPERIENCE ================= */}
      <Experience />
    </div>
  );
};

export default About;

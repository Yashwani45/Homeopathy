import React from "react";
import Appointment from "./Home/Appointment";
import About from "./Home/Aboutsection";
import CaseStudies from "./Home/CaseStudies";
import Faq from "./Home/Faq";
import Hero from "./Home/HeroSection";
import RemedyCabinet from "./Home/RemedyCabinet";
import Stats from "./Home/Stats";
import SymptomTool from "./Home/SymptomTool";
import WhyChooseUs from "./Home/WhyChooseUs";
import Service from "./Home/ServiceHome";
import { ScrollProgress } from "../components/MicroInteractions";

const Home = () => (
  <div className="mt-28 w-full bg-[#e9fbff]">
    <ScrollProgress />
    <Hero />
    <Appointment />
    <About />
    <Stats />
    <SymptomTool />
    <WhyChooseUs />
    <Service />
    <RemedyCabinet />
    <CaseStudies />
    <Faq />
  </div>
);

export default Home;

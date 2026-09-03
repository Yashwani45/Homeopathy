import React from "react";
import { motion as Motion } from "framer-motion";
import { FaArrowRight, FaCalendarAlt, FaStar, FaUsers } from "react-icons/fa";
import HeroImage from "../../Images/Home/Home.png";
import AppointmentSection from "../Home/Appointment"
import { AvailabilityDot, BotanicalParticles, MagneticLink, RevealText, SpotlightCard } from "../../components/MicroInteractions";

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-[#f5fffb] via-white to-[#e9fbff] pt-40 pb-24">
    <BotanicalParticles />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent" />

    <div className="container-main relative">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <Motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary-100 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
            <AvailabilityDot label="Online consultations open" />
          </div>
 
         <div className="max-w-[650px]">
  <RevealText
    text="Natural Healing,
Better Living"
    className="text-5xl font-bold leading-tight text-slate-950 lg:text-6xl xl:text-7xl"
    as="h1"
  />
</div>
       

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Experience safe, gentle and effective homeopathic treatment focused on identifying and treating the root cause of illness.
            Personalized healthcare solutions for long-term wellness and vitality.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <MagneticLink
              to="/Online-Consultation"
              className="inline-flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-8 py-4 font-bold text-sky-700 shadow-lg shadow-sky-500/10"
            >
              Explore Consultation
              <FaArrowRight />
            </MagneticLink>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              ["8K+", "Patients served", FaUsers],
              ["80%", "Client satisfaction", FaStar],
              ["14+", "Years of care", FaCalendarAlt],
            ].map(([number, label, Icon]) => {
              const statIcon = React.createElement(Icon, {
                className: "mx-auto mb-3 text-2xl text-sky-500",
              });

              return (
                <SpotlightCard className="rounded-2xl border border-white bg-white/75 p-5 text-center shadow-lg backdrop-blur" key={label}>
                  {statIcon}
                  <h3 className="text-2xl font-bold text-slate-950">{number}</h3>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </Motion.div>

        <Motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="absolute inset-8 rounded-full bg-primary-100 blur-2xl" />
          <img src={HeroImage} alt="Homeopathy doctor" className="relative z-10 mx-auto w-full max-w-2xl object-contain" />

          <SpotlightCard className="absolute left-0 top-10 z-20 hidden rounded-2xl border border-white/80 bg-white/85 px-5 py-4 shadow-2xl backdrop-blur md:block">
            <AvailabilityDot label="Available Now" />
          </SpotlightCard>

          <SpotlightCard className="absolute bottom-10 right-0 z-20 hidden rounded-2xl border border-white/80 bg-white/85 px-6 py-4 shadow-2xl backdrop-blur md:block">
            <h4 className="text-xl font-bold text-primary-600">+91 91091 02650</h4>
            <p className="text-sm text-slate-500">Consultation desk</p>
          </SpotlightCard>
        </Motion.div>
      </div>
    </div>
  </section>
);

export default Hero;

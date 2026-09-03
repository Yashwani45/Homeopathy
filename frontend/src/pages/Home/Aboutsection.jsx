import React from "react";
import { FaAward, FaCheckCircle, FaPhoneAlt, FaUserMd } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Fav from "../../Images/Home/About-4.png";
import Img from "../../Images/Home/About-5.png";
import Top from "../../Images/Home/About-6.png";
import Background from "../../Images/Home/Background.png";
import { MagneticLink, ParallaxLayer, RevealText } from "../../components/MicroInteractions";

const checklist = [
  "Expert Homeopathic Professional",
  "Advanced Diagnostic Approach",
  "Comprehensive Patient Care",
  "Compassionate Support & Accessibility",
];

const About = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${Background})` }} />
    <div className="absolute inset-0 bg-[#CDF0EA] backdrop-blur-sm" />

    <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
      <div className="relative min-h-[560px]">
        <div className="absolute -left-8 top-6 h-40 w-40 rounded-full bg-sky-100 blur-3xl" />
        <ParallaxLayer distance={54} className="absolute left-0 top-20 w-[58%]">
          <img src={Top} alt="Clinic care" className="h-[420px] w-full rounded-[28px] object-cover shadow-2xl" />
        </ParallaxLayer>
        <ParallaxLayer distance={-34} className="absolute right-0 top-0 w-[48%]">
          <img src={Fav} alt="Homeopathy remedy" className="h-64 w-full rounded-[24px] object-cover shadow-xl" />
        </ParallaxLayer>
        <ParallaxLayer distance={26} className="absolute bottom-0 right-8 w-[52%]">
          <img src={Img} alt="Patient consultation" className="h-72 w-full rounded-[24px] object-cover shadow-xl" />
        </ParallaxLayer>

        <Motion.a
          href="tel:+919109102650"
          className="absolute bottom-12 left-8 z-20 inline-flex items-center gap-3 rounded-2xl border border-primary-100 bg-white/90 px-5 py-4 font-bold text-primary-700 shadow-2xl backdrop-blur"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <FaPhoneAlt />
          </span>
          Consult Now: +91 91091 02650
        </Motion.a>
      </div>

      <div>
        <span className="text-sm font-bold uppercase tracking-[0.28em] text-sky-500">ABOUT Sumitra Homeopathy Clinic</span>
        <RevealText
          text="Redefining Healthcare with the Expertise of Homeopathic Advancements"
          className="mt-4 text-4xl font-bold leading-tight text-slate-950 lg:text-5xl"
        />
        <p className="mt-6 text-lg leading-8 text-slate-600">
          For over 18 years, we have been offering comprehensive homeopathic services across the USA with a careful blend of clinical
          experience, individualized case-taking, and compassionate continuity of care.
        </p>

        <div className="mt-8 grid gap-4">
          {checklist.map((item, index) => (
            <Motion.div
              className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-sm backdrop-blur"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              key={item}
            >
              <FaCheckCircle className="text-primary-500" />
              <span className="font-semibold text-slate-700">{item}</span>
            </Motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticLink to="/about" className="inline-flex items-center gap-3 rounded-xl bg-slate-950 px-8 py-4 font-bold text-white">
            <FaUserMd />
            Learn More
          </MagneticLink>
          <Link to="/contact" className="inline-flex items-center gap-3 rounded-xl border border-primary-200 bg-white px-8 py-4 font-bold text-primary-700">
            <FaAward />
            Book Consultation
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default About;

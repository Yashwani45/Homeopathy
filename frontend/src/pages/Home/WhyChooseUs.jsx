import React from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { FaLeaf, FaMicroscope, FaUserMd, FaHandsHelping, FaGlobeAmericas, FaClipboardCheck } from "react-icons/fa";
import { RevealText, SpotlightCard } from "../../components/MicroInteractions";

const blocks = [
  {
    icon: FaUserMd,
    title: "Expert Homeopathic Professional",
    text: "Experienced practitioners focused on gentle, individualized care.",
  },
  {
    icon: FaMicroscope,
    title: "Advanced Diagnostic Approach",
    text: "Detailed case-taking and modern review methods before treatment plans begin.",
  },
  {
    icon: FaClipboardCheck,
    title: "Comprehensive Patient Care",
    text: "Support across chronic concerns, skin health, pediatrics, stress, and family wellness.",
  },
  {
    icon: FaHandsHelping,
    title: "Compassionate Support",
    text: "Accessible guidance before, during, and after each consultation.",
  },
  {
    icon: FaGlobeAmericas,
    title: "Consultations Across The USA",
    text: "Remote care workflows built for patients who need continuity from home.",
  },
  {
    icon: FaLeaf,
    title: "Root-Cause Wellness",
    text: "Treatment paths designed around the whole person, not isolated symptoms.",
  },
];

const TiltCard = ({ item, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 220, damping: 18 });
  const Icon = item.icon;

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <SpotlightCard
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="rounded-2xl border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,118,110,0.10)] backdrop-blur-xl"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <div className="relative z-10">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-xl text-sky-500 ring-1 ring-sky-100">
          <Icon />
        </div>
        <h3 className="text-xl font-bold text-slate-950">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
      </div>
    </SpotlightCard>
  );
};

const WhyChooseUs = () => (
  <section className="relative overflow-hidden bg-[#f7fdff] py-24">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
    <div className="container-main relative">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <span className="text-sm font-bold uppercase tracking-[0.28em] text-sky-500">Why Choose Us</span>
        <RevealText
          text="Healthcare shaped around trust, time, and root-cause clarity"
          className="mt-4 text-4xl font-bold leading-tight text-slate-950 lg:text-5xl"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((item, index) => (
          <TiltCard item={item} index={index} key={item.title} />
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;

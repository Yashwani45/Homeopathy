import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { FaSeedling, FaTint, FaMoon, FaSun, FaWind, FaHandSparkles } from "react-icons/fa";
import { RevealText } from "../../components/MicroInteractions";

const remedies = [
  {
    name: "Calendula",
    icon: FaSun,
    tone: "from-amber-100 to-orange-50",
    property: "Skin comfort",
    detail: "Often discussed for topical recovery support and sensitive skin care conversations.",
    dosage: "Guided by clinician",
  },
  {
    name: "Arnica",
    icon: FaSeedling,
    tone: "from-lime-100 to-primary-50",
    property: "Muscle stress",
    detail: "Used in homeopathic planning around strain, impact, and recovery support.",
    dosage: "Case dependent",
  },
  {
    name: "Nux Vomica",
    icon: FaMoon,
    tone: "from-slate-100 to-sky-50",
    property: "Lifestyle balance",
    detail: "Considered in stress, digestive pattern, and overwork-led wellness reviews.",
    dosage: "After consultation",
  },
  {
    name: "Pulsatilla",
    icon: FaWind,
    tone: "from-cyan-100 to-secondary-50",
    property: "Respiratory patterns",
    detail: "Reviewed for changing symptoms and constitutional care discussions.",
    dosage: "Individualized",
  },
  {
    name: "Apis Mellifica",
    icon: FaTint,
    tone: "from-rose-100 to-sky-50",
    property: "Inflammatory response",
    detail: "Explored where swelling, heat, and sensitivity patterns are part of a case.",
    dosage: "Clinician-led",
  },
  {
    name: "Silicea",
    icon: FaHandSparkles,
    tone: "from-violet-100 to-primary-50",
    property: "Long-term vitality",
    detail: "Used in deeper constitutional reviews where resilience and recurring concerns matter.",
    dosage: "Personal plan",
  },
];

const RemedyCard = ({ remedy }) => {
  const [flipped, setFlipped] = useState(false);
  const Icon = remedy.icon;

  return (
    <Motion.button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className="group h-64 cursor-pointer rounded-2xl text-left [perspective:1200px] w-full"
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`View details for ${remedy.name}`}
    >
      <Motion.div
        className="relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
      >
        <div className={`absolute inset-0 rounded-2xl border border-white/80 bg-gradient-to-br ${remedy.tone} p-6 shadow-[0_24px_70px_rgba(8,47,73,0.10)] [backface-visibility:hidden]`}>
          <div className="flex h-full flex-col justify-between">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-2xl text-primary-600 shadow-inner">
              <Icon />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{remedy.property}</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">{remedy.name}</h3>
              <span className="mt-4 inline-flex text-sm font-semibold text-sky-600">Tap to inspect</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_24px_70px_rgba(8,47,73,0.14)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary-600">{remedy.property}</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-950">{remedy.name}</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">{remedy.detail}</p>
          <div className="mt-5 rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
            Dosage: {remedy.dosage}
          </div>
        </div>
      </Motion.div>
    </Motion.button>
  );
};

const RemedyCabinet = () => (
  <section className="relative overflow-hidden bg-white py-24">
    <div className="container-main">
      <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-[0.28em] text-primary-500">Remedy Cabinet</span>
          <RevealText
            text="Botanical intelligence, presented with clinical restraint"
            className="mt-4 text-4xl font-bold leading-tight text-slate-950 lg:text-5xl"
          />
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          Tap any cabinet tile to flip it. Remedy selection and dosage should always be personalized by a qualified clinician.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {remedies.map((remedy) => (
          <RemedyCard remedy={remedy} key={remedy.name} />
        ))}
      </div>
    </div>
  </section>
);

export default RemedyCabinet;

import React from "react";
import { motion as Motion } from "framer-motion";
import { FaHeartbeat, FaRegSmile, FaBrain, FaChartLine } from "react-icons/fa";
import { RevealText, SpotlightCard } from "../../components/MicroInteractions";

const cases = [
  {
    icon: FaHeartbeat,
    title: "Cardiac Wellness Support",
    duration: "16-week care timeline",
    result: "Improved routine comfort and adherence confidence",
    chart: [35, 48, 54, 67, 74, 82],
    text: "A structured constitutional review helped align lifestyle notes, stress triggers, and follow-up cadence with ongoing physician care.",
  },
  {
    icon: FaRegSmile,
    title: "Eczema Pattern Management",
    duration: "12-week skin review",
    result: "Reduced flare frequency reported during follow-ups",
    chart: [28, 36, 49, 58, 69, 77],
    text: "The plan focused on recurring triggers, sleep quality, digestive patterns, and gentle long-term symptom tracking.",
  },
  {
    icon: FaBrain,
    title: "Stress & Sleep Balance",
    duration: "10-week wellness plan",
    result: "More stable sleep rhythm and daytime energy",
    chart: [30, 42, 57, 62, 76, 84],
    text: "Consultations mapped emotional load, work routine, caffeine timing, and constitutional tendencies into a guided plan.",
  },
];

const reviews = [
  "The follow-up process felt calm and personal.",
  "Clear explanations and gentle guidance at every step.",
  "Online consultation made continuity easy.",
  "The team listened before recommending anything.",
  "A thoughtful approach to long-term wellness.",
];

const CaseStudies = () => (
  <section className="relative overflow-hidden bg-[#ecfbff] py-24">
    <div className="container-main">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <span className="text-sm font-bold uppercase tracking-[0.28em] text-sky-500">Case Studies</span>
        <RevealText
          text="Patient stories with measurable, human progress"
          className="mt-4 text-4xl font-bold leading-tight text-slate-950 lg:text-5xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cases.map((item, index) => {
          const Icon = item.icon;

          return (
            <SpotlightCard
              className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-[0_24px_70px_rgba(8,47,73,0.10)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              key={item.title}
            >
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl text-primary-600">
                    <Icon />
                  </span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                    {item.duration}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                <div className="mt-6 flex h-28 items-end gap-2 rounded-2xl bg-slate-950 p-4">
                  {item.chart.map((height, chartIndex) => (
                    <Motion.span
                      className="flex-1 rounded-t-full bg-gradient-to-t from-primary-400 to-sky-300"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: chartIndex * 0.08, duration: 0.55 }}
                      key={chartIndex}
                    />
                  ))}
                </div>
                <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <FaChartLine />
                  {item.result}
                </p>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      <div className="trust-marquee mt-12 overflow-hidden border-y border-sky-100 bg-white/55 py-4 backdrop-blur">
        <div className="trust-marquee-track">
          {[...reviews, ...reviews].map((review, index) => (
            <span className="mx-4 inline-flex rounded-full border border-sky-100 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm" key={`${review}-${index}`}>
              {review}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CaseStudies;

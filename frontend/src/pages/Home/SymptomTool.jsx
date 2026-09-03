import React, { useMemo, useState } from "react";
import { FaArrowRight, FaCheck, FaNotesMedical } from "react-icons/fa";
import { MagneticLink, RevealText, SpotlightCard } from "../../components/MicroInteractions";

const symptoms = [
  "Skin flare-ups",
  "Hair fall",
  "Digestive stress",
  "Sleep imbalance",
  "Child wellness",
  "Allergy patterns",
];

const pathways = {
  "Skin flare-ups": "Skin and sensitivity review",
  "Hair fall": "Hair and scalp constitutional review",
  "Digestive stress": "Digestive pattern consultation",
  "Sleep imbalance": "Stress and sleep balance plan",
  "Child wellness": "Pediatric and family care",
  "Allergy patterns": "Allergy and immune pattern review",
};

const SymptomTool = () => {
  const [selected, setSelected] = useState(["Skin flare-ups", "Sleep imbalance"]);
  const pathway = useMemo(() => selected.map((item) => pathways[item]).slice(0, 3), [selected]);

  const toggle = (symptom) => {
    setSelected((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  return (
    <section className="bg-white py-24">
      <div className="container-main">
        <SpotlightCard className="grid gap-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-primary-50 p-6 shadow-[0_26px_80px_rgba(8,47,73,0.10)] md:p-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="relative z-10">
            <span className="text-sm font-bold uppercase tracking-[0.28em] text-sky-500">Symptom Matcher</span>
            <RevealText
              text="Choose what you are noticing, then book the right consult"
              className="mt-4 text-4xl font-bold leading-tight text-slate-950 lg:text-5xl"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              {symptoms.map((symptom) => {
                const isSelected = selected.includes(symptom);

                return (
                  <button
                    type="button"
                    onClick={() => toggle(symptom)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                      isSelected
                        ? "border-primary-300 bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                        : "border-sky-100 bg-white text-slate-600 hover:border-sky-300"
                    }`}
                    key={symptom}
                  >
                    {isSelected && <FaCheck className="text-xs" />}
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 rounded-2xl bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                <FaNotesMedical />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sky-200">Suggested pathway</p>
                <h3 className="text-xl font-bold text-white">Consultation fit</h3>
              </div>
            </div>

            <div className="space-y-3">
              {(pathway.length ? pathway : ["General homeopathy consultation"]).map((item) => (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100" key={item}>
                  {item}
                </div>
              ))}
            </div>

            <MagneticLink
              to="/contact"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-4 font-bold text-slate-950 shadow-lg shadow-sky-400/25"
            >
              Consult Now
              <FaArrowRight />
            </MagneticLink>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};

export default SymptomTool;

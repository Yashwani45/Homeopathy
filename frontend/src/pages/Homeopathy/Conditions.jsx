import React from "react";

const Conditions = () => {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-[#d2f4fc] via-[#e6fffa] to-[#bae6fd] text-slate-800">
      
      {/* Subtle tech grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Decorative glowing blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 text-center mb-16 relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100 shadow-sm inline-block">
          Sumitra Homeopathy Clinic Services
        </span>
        <h2 className="text-4xl md:text-5xl font-bold font-serif mt-5 leading-tight text-slate-800">
          Conditions We Treat
        </h2>
      </div>

      <div className="container mx-auto px-6 grid md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
        {[
          "Female Complaints",
          "Skin Complaints",
          "Pediatric Diseases",
          "Bones & Joints",
          "Stomach Problems",
          "ENT Problems",
          "Neurology",
          "Dermatology",
        ].map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-7 text-left hover:-translate-y-1.5 hover:bg-primary-100 hover:border-primary-300 hover:shadow-medical-lg transition-all duration-500 ease-out group cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-50 rounded-full blur-xl pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-500" />
            
            <div>
              <h4 className="text-xl font-bold mb-2.5 text-slate-800 transition-colors duration-300 group-hover:text-primary-800">
                {item}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed font-sans">
                Effective homeopathic treatment focused on long-term relief.
              </p>
            </div>
            
            <span className="inline-flex items-center gap-1 mt-5 text-primary-600 text-sm font-semibold transition-all duration-300 group-hover:text-primary-800">
              <span>Read More</span>
              <span className="transform translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Conditions;
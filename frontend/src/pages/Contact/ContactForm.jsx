 import React from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

const Form = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#e9fbff]/20 to-white">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Content - Card Sized */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ease-out h-full flex flex-col justify-between">
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-primary-100/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-sky-100/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-sm font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full shadow-sm inline-block">
              Trusted Care • Proven Excellence
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-800 mt-5 leading-tight">
              Get <span className="text-primary-600">10% flat discount</span> on
              your first appointment!
            </h2>
            <p className="text-slate-600 mt-5 text-base md:text-lg leading-relaxed font-sans">
              At Sumitra Homeopathy Clinic, we are dedicated to delivering
              exceptional healthcare. For over 18 years, we have been offering
              comprehensive homeopathic services in India.
            </p>

            <ul className="mt-8 space-y-3.5 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-700">✓</span>
                <span>18+ Years of Holistic Treatment Experience</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-700">✓</span>
                <span>Root-Cause Focused Healing Therapy</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-700">✓</span>
                <span>100% Safe, Natural and Non-Toxic Medicines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-slate-50/50 to-sky-100 border border-primary-100/60 rounded-3xl p-8 shadow-xl">
          {/* Decorative Glow blobs */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary-100/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

          <form className="space-y-4 relative z-10">
            <input 
              className="w-full px-4 py-3 bg-white/80 border border-slate-200 focus:border-primary-500 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary-100/60 text-slate-700 placeholder-slate-400" 
              placeholder="Name*" 
            />
            <input 
              className="w-full px-4 py-3 bg-white/80 border border-slate-200 focus:border-primary-500 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary-100/60 text-slate-700 placeholder-slate-400" 
              placeholder="Email*" 
            />
            <input 
              className="w-full px-4 py-3 bg-white/80 border border-slate-200 focus:border-primary-500 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary-100/60 text-slate-700 placeholder-slate-400" 
              placeholder="Subject" 
            />
            <textarea
              className="w-full px-4 py-3 bg-white/80 border border-slate-200 focus:border-primary-500 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary-100/60 text-slate-700 placeholder-slate-400 h-28 resize-none"
              placeholder="Text"
            />

            <button className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-bold shadow-md shadow-primary-600/10 hover:shadow-lg hover:shadow-primary-600/15 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-98">
              <FaPaperPlane className="text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Send Mail</span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default Form;
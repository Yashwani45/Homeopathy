import React from "react";
import { FaPhoneAlt, FaRegClock, FaMapMarkerAlt } from "react-icons/fa";

const Info = () => {
  return (
    <section className="pb-20 bg-white">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8">
        
        {/* Visit Center */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-slate-50/50 to-primary-100 text-slate-800 rounded-3xl p-8 border border-sky-100/80 shadow-md transition-transform duration-300 hover:scale-[1.01] flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-xl text-primary-600 border border-primary-100">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-2xl font-bold font-serif text-slate-800 mb-3">Visit Our Center</h3>
            <p className="text-slate-600 mb-5 leading-relaxed">
              We are committed to delivering the best homeopathic care. Stop by our clinic for personalized diagnosis and long-term health consultations.
            </p>
            <div className="p-4 bg-white/50 border border-sky-100/30 rounded-2xl shadow-sm backdrop-blur-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Office Address</span>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                Office: 301, Near 11 No. Stop, E-7, Arera Colony, Bhopal, MP
              </p>
            </div>
          </div>

          <button className="mt-8 w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-md shadow-sky-600/10">
            <span>Share your Homeopathy Medicines</span>
            <span className="transform translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Opening Hours */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-slate-50/50 to-sky-100 text-slate-800 rounded-3xl p-8 border border-primary-100/80 shadow-md transition-transform duration-300 hover:scale-[1.01]">
          {/* Internal Glow overlays */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-xl text-sky-600 border border-sky-100">
              <FaRegClock />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-6 text-slate-800">Opening Hours</h3>
            
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <span className="font-medium text-slate-600">Monday – Thursday</span>
                <span className="font-semibold text-sky-800 bg-sky-50/80 border border-sky-100/50 px-3 py-1 rounded-lg text-xs">17:30 PM – 21:00</span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <span className="font-medium text-slate-600">Friday</span>
                <span className="font-semibold text-sky-800 bg-sky-50/80 border border-sky-100/50 px-3 py-1 rounded-lg text-xs">17:30 PM – 21:00</span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <span className="font-medium text-slate-600">Saturday</span>
                <span className="font-semibold text-sky-800 bg-sky-50/80 border border-sky-100/50 px-3 py-1 rounded-lg text-xs">17:30 PM – 21:00</span>
              </li>
              <li className="flex justify-between items-center pb-1">
                <span className="font-medium text-slate-600">Sunday</span>
                <span className="font-bold text-primary-700 bg-primary-100 px-3 py-1 rounded-full text-xs border border-primary-200/50">
                  WhatsApp Only
                </span>
              </li>
            </ul>

            <button className="mt-8 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-md shadow-primary-600/10">
              <span>24/7 Emergency Service</span>
              <span className="transform translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Info;
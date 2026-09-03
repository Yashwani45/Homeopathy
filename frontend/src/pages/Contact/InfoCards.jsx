import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Info = () => {
  return (
    <section className="bg-gradient-to-b from-[#e9fbff] via-[#e9fbff]/40 to-white py-20">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        
        {/* Address */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-8 shadow-card hover:shadow-medical-lg hover:-translate-y-2 hover:bg-primary-100 hover:border-primary-200 transition-all duration-500 ease-out group cursor-pointer flex flex-col items-start">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100/50 flex items-center justify-center text-primary-600 text-2xl mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <FaMapMarkerAlt />
          </div>
          <h3 className="text-2xl font-bold font-serif text-slate-800 mb-2">Address</h3>
          <div className="w-10 h-1 bg-gradient-to-r from-primary-500 to-sky-500 mb-5 group-hover:w-20 transition-all duration-500 ease-out rounded-full"></div>
          <p className="text-[16px] text-slate-600 leading-relaxed font-sans">
            301, Near 11 No Stop, Next to Juice Bar, E-7 Area Colony,  
            Bhopal, Madhya Pradesh 462016
          </p>
        </div>

        {/* Phone */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-8 shadow-card hover:shadow-medical-lg hover:-translate-y-2 hover:bg-sky-100 hover:border-sky-200 transition-all duration-500 ease-out group cursor-pointer flex flex-col items-start">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 text-2xl mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]">
            <FaPhoneAlt />
          </div>
          <h3 className="text-2xl font-bold font-serif text-slate-800 mb-2">Phone</h3>
          <div className="w-10 h-1 bg-gradient-to-r from-primary-500 to-sky-500 mb-5 group-hover:w-20 transition-all duration-500 ease-out rounded-full"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">
            Call & WhatsApp
          </p>
          <p className="text-lg font-bold text-primary-700 group-hover:text-primary-600 transition-colors duration-300 font-sans">
            +91 91091 02650
          </p>
        </div>

        {/* Email */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-8 shadow-card hover:shadow-medical-lg hover:-translate-y-2 hover:bg-indigo-100 hover:border-indigo-200 transition-all duration-500 ease-out group cursor-pointer flex flex-col items-start">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 text-2xl mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <FaEnvelope />
          </div>
          <h3 className="text-2xl font-bold font-serif text-slate-800 mb-2">Email</h3>
          <div className="w-10 h-1 bg-gradient-to-r from-primary-500 to-sky-500 mb-5 group-hover:w-20 transition-all duration-500 ease-out rounded-full"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">
            Email Consultation
          </p>
          <p className="text-lg font-bold text-primary-700 group-hover:text-primary-600 transition-colors duration-300 font-sans break-all">
            contact@homeopathy-world.com
          </p>
        </div>

      </div>
    </section>
  );
};

export default Info;
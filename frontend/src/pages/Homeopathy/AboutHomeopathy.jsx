

// const About = () => {
// return (
// <section className="py-20 bg-gray-50">
//         <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
//           {/* Images */}
//           <div className="grid grid-cols-2 gap-4">
//             <img
//               src="https://images.unsplash.com/photo-1580281657521-6c6f3c57c9aa"
//               className="rounded-2xl shadow"
//               alt=""
//             />
//             <img
//               src="https://images.unsplash.com/photo-1600959907703-bfbd4ed49f44"
//               className="rounded-2xl shadow"
//               alt=""
//             />
//             <img
//               src="https://images.unsplash.com/photo-1584515933487-779824d29309"
//               className="rounded-2xl shadow col-span-2"
//               alt=""
//             />
//           </div>

//           {/* Content */}
//           <div>
//             <span className="text-cyan-600 uppercase text-sm">
//               About Sumitra Homeopathy Clinic
//             </span>
//             <h3 className="text-3xl font-bold mt-3 mb-4">
//               Advance Homeopathic Care
//             </h3>
//             <p className="text-gray-600 mb-6">
//               With over 18 years of clinical experience, we deliver trusted,
//               natural, and holistic healing using safe and effective homeopathic
//               treatments.
//             </p>

//             <ul className="space-y-3 text-sm text-gray-700">
//               <li>✔ Root Cause Based Treatment</li>
//               <li>✔ Modern Diagnostic Support</li>
//               <li>✔ Non-Invasive Healing</li>
//               <li>✔ Chronic Disease Management</li>
//             </ul>

//             <div className="flex gap-4 mt-8">
//               <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full">
//                 About Us →
//               </button>
//               <div className="text-sm font-semibold text-gray-700 flex items-center">
//                 📞 +91 91091 02650
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//       );
//     };
//     export default About;
import React from "react";

const About = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-cyan-50">

      {/* Background Blur Effects (Theme System) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center z-10">

        {/* ================= IMAGES ================= */}
        <div className="grid grid-cols-2 gap-4">

          <img
            src="https://images.unsplash.com/photo-1580281657521-6c6f3c57c9aa"
            className="rounded-2xl shadow-xl hover:scale-105 transition duration-300"
            alt=""
          />

          <img
            src="https://images.unsplash.com/photo-1600959907703-bfbd4ed49f44"
            className="rounded-2xl shadow-xl hover:scale-105 transition duration-300"
            alt=""
          />

          <img
            src="https://images.unsplash.com/photo-1584515933487-779824d29309"
            className="rounded-2xl shadow-xl col-span-2 hover:scale-105 transition duration-300"
            alt=""
          />

        </div>

        {/* ================= CONTENT ================= */}
        <div>

          {/* Badge */}
          <span className="inline-flex items-center px-5 py-2 rounded-full bg-primary-100 text-primary-700 font-medium">
            🌿 About Sumitra Homeopathy Clinic
          </span>

          {/* Heading */}
          <h3 className="text-5xl font-bold text-slate-900 mt-4">
            Advanced Homeopathic Care
          </h3>

          {/* Description */}
          <p className="text-slate-600 mt-5 text-lg leading-relaxed">
            With over 18+ years of clinical experience, we deliver trusted,
            natural, and holistic healing using safe and effective homeopathic
            treatments focused on root-cause recovery.
          </p>

          {/* Features */}
          <ul className="mt-6 space-y-3 text-slate-700">
            <li>✔ Root Cause Based Treatment</li>
            <li>✔ Modern Diagnostic Support</li>
            <li>✔ Non-Invasive Healing</li>
            <li>✔ Chronic Disease Management</li>
          </ul>

          {/* Buttons */}
          <div className="flex items-center gap-4 mt-8">

            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl shadow-lg transition">
              About Us →
            </button>

            <div className="text-slate-700 font-semibold flex items-center gap-2">
              📞 +91 91091 02650
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
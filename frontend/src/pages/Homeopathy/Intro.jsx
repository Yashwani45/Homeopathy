

// const Intro = () => {
// return (
// <section className="py-20 bg-white text-center">
//         <div className="container mx-auto px-6 max-w-4xl">
//           <span className="text-cyan-600 uppercase text-sm tracking-wide">
//             Welcome to Sumitra Homeopathy Clinic
//           </span>
//           <h2 className="text-3xl md:text-4xl font-bold mt-4">
//             World-Class Homeopathy Treatment for Comprehensive Healing and Wellness
//           </h2>
//           <p className="text-gray-600 mt-6 leading-relaxed">
//             Sumitra Homeopathy Clinic provides compassionate, personalized care
//             using classical homeopathy principles. We focus on identifying root
//             causes and promoting long-lasting wellness for patients of all ages.
//           </p>
//         </div>
//       </section>
//       );
//     };
//     export default Intro;

import React from "react";
import { FaLeaf, FaHeartbeat, FaUserMd } from "react-icons/fa";

const Intro = () => {
  return (
    <section className="py-24 bg-white">

      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          <FaLeaf />
          Welcome to Sumitra Homeopathy Clinic
        </span>

        {/* Heading */}
        <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          World-Class Homeopathy Treatment
          <span className="block text-primary-600 mt-2">
            For Complete Healing & Wellness
          </span>
        </h2>

        {/* Description */}
        <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-600 leading-relaxed">
          At Sumitra Homeopathy Clinic, we provide compassionate,
          personalized healthcare rooted in classical homeopathy.
          Our treatments focus on identifying the root cause of illness,
          restoring balance, and promoting long-term wellness for
          patients of all ages.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-14">

          <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition">
            <FaUserMd className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">
              Expert Care
            </h3>
            <p className="text-slate-600">
              Experienced homeopathic specialists providing
              personalized treatment plans.
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition">
            <FaHeartbeat className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">
              Holistic Healing
            </h3>
            <p className="text-slate-600">
              Treating the root cause of disease rather than
              just managing symptoms.
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition">
            <FaLeaf className="text-4xl text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">
              Natural Treatment
            </h3>
            <p className="text-slate-600">
              Safe, gentle and effective remedies designed
              to support long-term health.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};

export default Intro;
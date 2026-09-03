// import React from "react";
// import { FaArrowRight, FaHeartbeat, FaLeaf, FaUserFriends } from "react-icons/fa";
// import chronicImg from "../../Images/Home/foot.jpg";
// import stressImg from "../../Images/Home/Fav.jpg";
// import pediatricImg from "../../Images/Home/Log.jpg";
// import Back from "../../Images/Home/bg.jpg";
// import { RevealText, SpotlightCard } from "../../components/MicroInteractions";

// const services = [
//   {
//     title: "Chronic Disease Management",
//     image: chronicImg,
//     description: "Long-term treatment conversations focused on root-cause patterns and steady follow-up.",
//     icon: FaHeartbeat,
//   },
//   {
//     title: "Stress & Lifestyle Care",
//     image: stressImg,
//     description: "Holistic care to restore balance, sleep rhythm, and everyday wellbeing.",
//     icon: FaLeaf,
//   },
//   {
//     title: "Pediatric & Family Health",
//     image: pediatricImg,
//     description: "Gentle, individualized care pathways for children and families.",
//     icon: FaUserFriends,
//   },
// ];

// const Service = () => (
//   <section className="relative overflow-hidden py-24 text-white">
//     <img src={Back} alt="Services background" className="absolute inset-0 h-full w-full object-cover" />
//     <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-primary-950/85" />

//     <div className="relative z-10 mx-auto max-w-7xl px-6">
//       <div className="mx-auto mb-12 max-w-3xl text-center">
//         <span className="text-sm font-bold uppercase tracking-[0.28em] text-sky-200">Services</span>
//         <RevealText text="Have a look at our services" className="mt-4 text-4xl font-bold text-white lg:text-5xl" />
//       </div>

//       <div className="grid gap-8 md:grid-cols-3">
//         {services.map((service) => {
//           const Icon = service.icon;

//           return (
//             <SpotlightCard className="group min-h-[420px] overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-0 shadow-2xl backdrop-blur" key={service.title}>
//               <img src={service.image} alt={service.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
//               <div className="relative z-10 p-6">
//                 <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-300/15 text-xl text-sky-200">
//                   <Icon />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white">{service.title}</h3>
//                 <p className="mt-3 text-sm leading-6 text-white/75">{service.description}</p>
//                 <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-200">
//                   Explore care
//                   <FaArrowRight />
//                 </span>
//               </div>
//             </SpotlightCard>
//           );
//         })}
//       </div>
//     </div>
//   </section>
// );

// export default Service;

import React from "react";
import {
  FaArrowRight,
  FaHeartbeat,
  FaLeaf,
  FaUserFriends,
} from "react-icons/fa";
import { SpotlightCard } from "../../components/MicroInteractions";

import chronicImg from "../../Images/Home/foot.jpg";
import stressImg from "../../Images/Home/Fav.jpg";
import pediatricImg from "../../Images/Home/Log.jpg";

const services = [
  {
    title: "Chronic Disease Management",
    image: chronicImg,
    description:
      "Personalized treatment plans focused on identifying and treating the root cause of chronic illnesses.",
    icon: FaHeartbeat,
  },
  {
    title: "Stress & Lifestyle Care",
    image: stressImg,
    description:
      "Natural solutions to restore emotional balance, improve sleep, and enhance overall wellbeing.",
    icon: FaLeaf,
  },
  {
    title: "Pediatric & Family Health",
    image: pediatricImg,
    description:
      "Gentle homeopathic care tailored for children and family wellness needs.",
    icon: FaUserFriends,
  },
];

const Service = () => {
  return (
    <section className="relative overflow-hidden py-24 ECFAE5">

      {/* Decorative Blur Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-200/50 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">

          <span className="inline-block px-5 py-2 bg-white border border-primary-200 rounded-full text-primary-700 text-sm font-semibold shadow-sm">
            🌿 Our Specialized Services
          </span>

          <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900">
            Comprehensive Homeopathic
            <span className="block text-primary-700">
              Healthcare Solutions
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-700 leading-relaxed">
            We provide personalized homeopathic treatments designed to
            restore health, balance and long-term wellbeing through
            safe and natural healing methods.
          </p>

        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {services.map((service) => {
            const Icon = service.icon;

            return (
              <SpotlightCard
                key={service.title}
                tint="rgba(52, 211, 153, 0.45)"
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  bg-white
                  border border-primary-100/80
                  shadow-xl
                  hover:-translate-y-3
                  hover:shadow-[0_20px_50px_rgba(16,185,129,0.22)]
                  hover:border-primary-300
                  transition-all
                  duration-500
                  ease-out
                  flex
                  flex-col
                  h-full
                "
              >

                {/* Image */}
                <div className="overflow-hidden relative flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="
                      h-64
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-110
                    "
                  />
                  {/* Subtle dark vignette on image hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="p-7 relative z-10 flex-grow flex flex-col justify-between transition-all duration-500 bg-white group-hover:bg-gradient-to-br group-hover:from-primary-100 group-hover:to-sky-200">
                  
                  <div>
                    {/* ICON CONTAINER WITH DYNAMIC GLOW */}
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100/50 flex items-center justify-center text-primary-600 text-2xl mb-5 transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <Icon />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-primary-950">
                      {service.title}
                    </h3>

                    <p className="mt-4 text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors duration-300">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    <button
                      className="
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        text-primary-600
                        font-semibold
                        group-hover:text-primary-900
                        transition-colors
                        duration-300
                      "
                    >
                      Learn More
                      <FaArrowRight className="transform translate-x-0 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </button>
                  </div>

                </div>

              </SpotlightCard>
            );
          })}

        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-4xl font-bold text-primary-700">
              15K+
            </h3>
            <p className="text-slate-600 mt-2">
              Happy Patients
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-4xl font-bold text-primary-700">
              25+
            </h3>
            <p className="text-slate-600 mt-2">
              Years Experience
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-4xl font-bold text-primary-700">
              98%
            </h3>
            <p className="text-slate-600 mt-2">
              Success Rate
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Service;

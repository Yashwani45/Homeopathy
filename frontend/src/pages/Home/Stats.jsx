// import React from "react";
// import { motion as Motion } from "framer-motion";
// import { FaAward, FaHeartbeat, FaSmile, FaUsers } from "react-icons/fa";

// const stats = [
//   {
//     icon: FaUsers,
//     number: "8 K+",
//     label: "Patients have served",
//   },
//   {
//     icon: FaSmile,
//     number: "80 %",
//     label: "Client Satisfaction through personalized care",
//   },
//   {
//     icon: FaAward,
//     number: "14 +",
//     label: "Years of trusted homeopathic experience",
//   },
//   {
//     icon: FaHeartbeat,
//     number: "88 %",
//     label: "Prompt resolution of a persistent illness",
//   },
// ];

// const Stats = () => (
//   <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.26),transparent_42%)]" />
//     <div className="relative mx-auto grid max-w-7xl grid-cols-1 px-6 sm:grid-cols-2 lg:grid-cols-4">
//       {stats.map((item, index) => {
//         const Icon = item.icon;

//         return (
//           <Motion.div
//             className="group relative p-8 text-center"
//             initial={{ opacity: 0, y: 18 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, amount: 0.4 }}
//             transition={{ delay: index * 0.07 }}
//             key={item.label}
//           >
//             {index > 0 && (
//               <span className="absolute left-0 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-white/15 transition-all duration-300 group-hover:h-36 group-hover:bg-sky-300 group-hover:shadow-[0_0_22px_rgba(125,211,252,0.8)] lg:block" />
//             )}
//             <Icon className="mx-auto mb-4 text-3xl text-sky-300" />
//             <h3 className="text-5xl font-bold text-white">{item.number}</h3>
//             <p className="mx-auto mt-3 max-w-48 text-sm leading-6 text-slate-300">{item.label}</p>
//           </Motion.div>
//         );
//       })}
//     </div>
//   </section>
// );

// export default Stats;
import React from "react";
import { motion as Motion } from "framer-motion";
import {
  FaAward,
  FaHeartbeat,
  FaSmile,
  FaUsers,
} from "react-icons/fa";

const stats = [
  {
    icon: FaUsers,
    number: "8K+",
    label: "Patients Served",
  },
  {
    icon: FaSmile,
    number: "80%",
    label: "Patient Satisfaction",
  },
  {
    icon: FaAward,
    number: "14+",
    label: "Years Experience",
  },
  {
    icon: FaHeartbeat,
    number: "88%",
    label: "Recovery Success Rate",
  },
];

const Stats = () => {
  return (
    <section className="relative py-20 bg-[#E4EFE7] overflow-hidden">

      {/* Decorative Blurs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-200/50 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <Motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                className="
                  bg-white
                  rounded-3xl
                  p-8
                  shadow-lg
                  hover:shadow-2xl
                  hover:-translate-y-2
                  transition-all
                  duration-300
                  text-center
                "
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <Icon className="text-primary-600 text-3xl" />
                </div>

                <h3 className="text-4xl font-bold text-slate-900">
                  {item.number}
                </h3>

                <p className="mt-3 text-slate-600 leading-relaxed">
                  {item.label}
                </p>
              </Motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default Stats;
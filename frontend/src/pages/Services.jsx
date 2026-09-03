import React from "react";
import Hero from "../components/Background";

// Images
import Hair from "../Images/Service/Hair.jpg";
import Dermatology from "../Images/Service/Dermatology.jpg";
import Neurology from "../Images/Service/Neurology.jpg";
import Pediatric from "../Images/Service/Pediatric.jpg";
import Female from "../Images/Service/Female.webp";
import Bones from "../Images/Service/Bones.webp";

// Icons
import HairIcon from "../Images/Icon/Hair.png";
import DermatologyIcon from "../Images/Icon/Dermatology.png";
import NeurologyIcon from "../Images/Icon/Neurology.png";
import PediatricIcon from "../Images/Icon/Pediatric.png";
import FemaleIcon from "../Images/Icon/Female.jpg";
import BonesIcon from "../Images/Icon/Bones.png";

const Services = () => {
  const services = [
    {
      title: "Skin & Hair Treatment",
      description: "Natural homeopathic care for skin disorders and hair loss.",
      image: Hair,
      icon: HairIcon,
    },
    {
      title: "Dermatology",
      description: "Treatment for acne, eczema, pigmentation & allergies.",
      image: Dermatology,
      icon: DermatologyIcon,
    },
    {
      title: "Neurology",
      description: "Care for migraine, stress, anxiety & nerve pain.",
      image: Neurology,
      icon: NeurologyIcon,
    },
    {
      title: "Pediatric Diseases",
      description: "Safe treatment for immunity, digestion & growth.",
      image: Pediatric,
      icon: PediatricIcon,
    },
    {
      title: "Female Complaints",
      description: "Hormonal imbalance, menopause & infertility care.",
      image: Female,
      icon: FemaleIcon,
    },
    {
      title: "Bones & Joints",
      description: "Relief from arthritis, stiffness & joint pain.",
      image: Bones,
      icon: BonesIcon,
    },
  ];

  return (
    <div className="relative mt-28 overflow-hidden bg-gradient-to-b from-[#fdfcfb] via-[#f9f9ff] to-white">

      {/* Floating Gradient Blobs */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-pink-200 to-purple-200 blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gradient-to-tr from-cyan-200 to-blue-200 blur-3xl opacity-40 animate-pulse" />

      <Hero title="Services" breadcrumb="Services" />

      <section className="relative z-10 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">

          {/* Section Heading */}
          <div className="mb-14 text-center">
            <span className="inline-flex items-center rounded-full border border-purple-200 bg-white/70 px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm backdrop-blur-md">
              ✨ Our Expertise
            </span>

            <h2 className="mt-6 text-4xl font-extrabold text-slate-800 md:text-5xl tracking-tight">
              Explore Our Treatments
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
              Personalized homeopathic care designed to heal naturally and holistically.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative rounded-3xl overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl h-80"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${service.image})` }}
                />

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                  <div
                    className="rounded-xl p-4 transition-colors duration-500 group-hover:bg-[#d7f4dc]"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-200 to-pink-200 shadow-md mb-4 group-hover:rotate-6 transition-transform duration-500">
                      <img src={service.icon} alt={service.title} className="h-8 w-8 object-contain" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Services;

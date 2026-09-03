import React from "react";

// Images
import Hair from "../../Images/Service/Hair.jpg";
import Dermatology from "../../Images/Service/Dermatology.jpg";
import Neurology from "../../Images/Service/Neurology.jpg";
import Pediatric from "../../Images/Service/Pediatric.jpg";
import Female from "../../Images/Service/Female.webp";
import Bones from "../../Images/Service/Bones.webp";

// Icons
import HairIcon from "../../Images/Icon/Hair.png";
import DermatologyIcon from "../../Images/Icon/Dermatology.png";
import NeurologyIcon from "../../Images/Icon/Neurology.png";
import PediatricIcon from "../../Images/Icon/Pediatric.png";
import FemaleIcon from "../../Images/Icon/Female.jpg";
import BonesIcon from "../../Images/Icon/Bones.png";

const ConsultationServices = () => {
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
    <section className="py-16 bg-white relative z-10">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Heading */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700 shadow-sm">
            ✨ Our Specialty Treatments
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-slate-800 md:text-4xl tracking-tight font-serif">
            Conditions We Treat Online
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 leading-relaxed">
            Get personalized homeopathic care from the comfort of your home. Select any condition to learn more or consult with us.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl h-72 cursor-pointer"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${service.image})` }}
              />

              {/* Content */}
              <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                <div
                  className="rounded-xl p-4 transition-colors duration-500 group-hover:bg-[#d7f4dc] flex flex-col justify-start"
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-200 to-pink-200 shadow-md mb-3 group-hover:rotate-6 transition-transform duration-500 flex-shrink-0">
                    <img src={service.icon} alt={service.title} className="h-6 w-6 object-contain" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ConsultationServices;

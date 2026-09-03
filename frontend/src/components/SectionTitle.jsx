import React from "react";
import DocImage from "../Images/Icons/doc.jpg";


const Hero = ({ title, subtitle }) => {
  return (
    <section className="relative h-[320px] md:h-[380px] flex items-center justify-center text-white overflow-hidden">
      
      {/* Background Image */}
 <img
  src={DocImage}
  alt="Doctor"
  className="absolute inset-0 w-full h-full object-cover"
/>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-blue-800/80"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          {title}
        </h1>

        {subtitle && (
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default Hero;

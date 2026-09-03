import React from "react";
import { Link } from "react-router-dom";


const Hero = ({ title, breadcrumb }) => {
  return (
    <section className="relative h-[130px] md:h-[170px] flex items-center overflow-hidden bg-gradient-to-br from-[#0c1a40] via-[#094d7c] to-[#0f766e]">
      
      {/* Subtle tech grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Decorative glowing blobs */}
      <div className="absolute -top-20 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />

      {/* Decorative wave lines */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 z-0">
        <svg
          viewBox="0 0 600 400"
          fill="none"
          className="h-full w-full"
        >
          <path
            d="M0 300 C150 200 300 400 600 250"
            stroke="#34d399"
            strokeWidth="1.5"
          />
          <path
            d="M0 340 C200 220 350 420 600 300"
            stroke="#38bdf8"
            strokeWidth="1"
          />
          <path
            d="M0 380 C180 260 380 460 600 340"
            stroke="#34d399"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="container-main relative z-10 flex justify-between items-center w-full px-6">
        
        {/* Left Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
          {title}
        </h1>

        {/* Breadcrumb */}
        <div className="hidden md:flex text-sm font-semibold text-white/80 space-x-2">
          <Link to="/" className="hover:text-primary-300 transition-colors duration-300">
            Home
          </Link>
          <span className="text-white/40">›</span>
          <span className="text-primary-300">{breadcrumb}</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;

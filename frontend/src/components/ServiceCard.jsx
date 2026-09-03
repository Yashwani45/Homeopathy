import React from "react";

const ServiceCard = ({ service }) => {
  const Icon = service.icon;

  return (
    <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
      
      {/* Icon */}
      <div className="mb-6 text-cyan-400 text-4xl">
        <Icon />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-3">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-white/70 leading-relaxed">
        {service.description}
      </p>

      {/* Read More */}
      <span className="inline-block mt-4 text-sm text-cyan-400 group-hover:underline">
        Read More →
      </span>
    </div>
  );
};

export default ServiceCard;

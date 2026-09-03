  import React from "react";

  const HoverImageCard = ({ image, title, description }) => {
    return (
      <div className="group relative h-[380px] overflow-hidden rounded-2xl bg-black shadow-lg cursor-pointer">
        
        {/* IMAGE */}
        <img
          src={image}
          alt={title}
          className="
            absolute inset-0 w-full h-full object-cover
            scale-110 translate-y-10 opacity-0
            transition-all duration-700 ease-out
            group-hover:scale-100 group-hover:translate-y-0 group-hover:opacity-100
          "
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/50 z-10 transition-opacity duration-500 group-hover:bg-black/30" />

        {/* CONTENT */}
        <div className="relative z-20 h-full flex flex-col justify-end p-6 text-white">
          <h3 className="text-xl font-semibold mb-2 text-white">
            {title}
          </h3>
          <p className="text-sm text-white/80">
            {description}
          </p>
        </div>
      </div>
    );
  };

  export default HoverImageCard;

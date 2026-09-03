import { useRef, useState } from "react";
import { FaStethoscope } from "react-icons/fa";

const getHoverDirection = (e, element) => {
  const { width, height, top, left } = element.getBoundingClientRect();
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  const angle = Math.atan2(y, x) * (180 / Math.PI);

  if (angle >= -45 && angle < 45) return "right";
  if (angle >= 45 && angle < 135) return "bottom";
  if (angle >= -135 && angle < -45) return "top";
  return "left";
};

const ServiceCard = ({ title, description, image, icon }) => {
  const cardRef = useRef(null);
  const [direction, setDirection] = useState("");
  const [hovered, setHovered] = useState(false);

  const handleEnter = (e) => {
    setDirection(getHoverDirection(e, cardRef.current));
    setHovered(true);
  };

  const handleLeave = (e) => {
    setDirection(getHoverDirection(e, cardRef.current));
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative h-[380px] overflow-hidden rounded-2xl bg-white shadow-lg cursor-pointer"
    >
      {/* ===== Hover Image ===== */}
      <div
        className={`
          absolute inset-0 transition-transform duration-500 ease-in-out
          ${
            hovered
              ? "translate-x-0 translate-y-0"
              : direction === "left"
              ? "-translate-x-full"
              : direction === "right"
              ? "translate-x-full"
              : direction === "top"
              ? "-translate-y-full"
              : "translate-y-full"
          }
        `}
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* ===== Content ===== */}
      <div
        className={`
          relative z-10 h-full flex flex-col justify-end p-6
          transition-colors duration-300
          ${hovered ? "text-white" : "text-black"}
        `}
      >
        {/* ICON */}
        <div className="mb-3">
          {icon ? (
            <img src={icon} alt="" className="w-12 h-12" />
          ) : (
            <FaStethoscope
              className={`text-2xl transition-colors duration-300 ${
                hovered ? "text-white" : "text-primary-600"
              }`}
            />
          )}
        </div>

        {/* TITLE */}
        <h1 className={`text-3xl transition-colors duration-300 ${
            hovered ? "text-white/90" : "text-gray-600"
          }`}
          >
          {title}
        </h1>

        {/* DESCRIPTION */}
        <p
          className={`text-sm transition-colors duration-300 ${
            hovered ? "text-white/90" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;

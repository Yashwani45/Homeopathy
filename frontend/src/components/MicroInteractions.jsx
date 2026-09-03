import React, { useRef, useState } from "react";
import { motion as Motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

const MotionLink = Motion.create(Link);

export const AvailabilityDot = ({ label = "Available Now", light = false }) => (
  <span className={`inline-flex items-center gap-2 ${light ? "text-white" : "text-primary-700"}`}>
    <span className="availability-dot" />
    <span className="text-sm font-semibold">{label}</span>
  </span>
);

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <Motion.div
      className="fixed left-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-sky-300 via-cyan-400 to-primary-300 shadow-[0_0_18px_rgba(14,165,233,0.65)]"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export const MagneticLink = ({ to, href, className = "", children, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.35 });

  const handleMouseMove = (event) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < Math.max(bounds.width, bounds.height) / 2 + 40) {
      x.set(distanceX * 0.18);
      y.set(distanceY * 0.18);
    }
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const sharedProps = {
    ref,
    className: `magnetic-cta ${className}`,
    style: { x: springX, y: springY },
    onMouseMove: handleMouseMove,
    onMouseLeave: reset,
    whileTap: { scale: 0.97 },
    ...props,
  };

  if (href) {
    return (
      <Motion.a href={href} {...sharedProps}>
        {children}
      </Motion.a>
    );
  }

  return (
    <MotionLink to={to} {...sharedProps}>
      {children}
    </MotionLink>
  );
};

export const SpotlightCard = ({ children, className = "", tint = "rgba(14,165,233,0.16)", onMouseMove, style, ...props }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
    onMouseMove?.(event);
  };

  return (
    <Motion.div
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        "--spotlight-x": `${position.x}%`,
        "--spotlight-y": `${position.y}%`,
        "--spotlight-color": tint,
        ...style,
      }}
      {...props}
    >
      {children}
    </Motion.div>
  );
};

export const RevealText = ({ text, className = "", as: Tag = "h2" }) => {
  const characters = Array.from(text);

  return React.createElement(
    Tag,
    { className, "aria-label": text },
    characters.map((character, index) => (
        <Motion.span
          aria-hidden="true"
          className="inline-block"
          initial={{ y: "0.85em", opacity: 0, rotateX: -35 }}
          whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{
            duration: 0.45,
            delay: index * 0.018,
            ease: [0.22, 1, 0.36, 1],
          }}
          key={`${character}-${index}`}
        >
          {character === " " ? "\u00A0" : character}
        </Motion.span>
      ))
  );
};

export const BotanicalParticles = () => {
  const particles = [
    { left: "8%", delay: "0s", duration: "18s", size: 22, type: "leaf" },
    { left: "18%", delay: "2s", duration: "22s", size: 14, type: "drop" },
    { left: "32%", delay: "4s", duration: "20s", size: 18, type: "leaf" },
    { left: "51%", delay: "1s", duration: "24s", size: 12, type: "drop" },
    { left: "68%", delay: "5s", duration: "19s", size: 20, type: "leaf" },
    { left: "82%", delay: "3s", duration: "23s", size: 15, type: "drop" },
    { left: "94%", delay: "6s", duration: "21s", size: 16, type: "leaf" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle, index) => (
        <span
          className={`botanical-particle botanical-particle--${particle.type}`}
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
          key={index}
        />
      ))}
    </div>
  );
};

export const ParallaxLayer = ({ children, className = "", distance = 40 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <Motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </Motion.div>
  );
};

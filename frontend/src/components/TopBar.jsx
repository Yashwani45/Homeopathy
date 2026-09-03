// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   FaClock,
//   FaEnvelope,
//   FaMapMarkerAlt,
//   FaFacebookF,
//   FaTwitter,
//   FaInstagram,
//   FaLinkedinIn,
// } from "react-icons/fa";

// const TopBar = () => {
//   const [visible, setVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;

//       if (currentScrollY > lastScrollY && currentScrollY > 50) {
//         // scrolling down → hide
//         setVisible(false);
//       } else {
//         // scrolling up → show
//         setVisible(true);
//       }

//       setLastScrollY(currentScrollY);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [lastScrollY]);

//   return (
//     <motion.div
//       className="hidden md:block bg-cyan-500 text-white text-sm"
//       initial={{ opacity: 0, y: -10 }}
//       animate={{
//         opacity: visible ? 1 : 0,
//         y: visible ? 0 : -10,
//       }}
//       transition={{
//         duration: 0.4,
//         ease: "easeInOut",
//       }}
//     >
//       <div className="container-main flex justify-between items-center h-10">
        
//         {/* Left Details */}
//         <div className="flex items-center space-x-6">
//           <span className="flex items-center gap-2">
//             <FaClock className="text-xs" />
//             Mon - Sat : 5:30 PM - 9:00 PM
//           </span>

//           <span className="flex items-center gap-2">
//             <FaEnvelope className="text-xs" />
//             contact@homeopathy-world.com
//           </span>

//           <span className="flex items-center gap-2">
//             <FaMapMarkerAlt className="text-xs" />
//             301, Near 11 No Stop, E-7, Arera Colony, Bhopal
//           </span>
//         </div>

//         {/* Right Social Icons */}
//         <div className="flex items-center space-x-4">
//           <a href="#" className="hover:text-gray-200 transition">
//             <FaFacebookF />
//           </a>
//           <a href="#" className="hover:text-gray-200 transition">
//             <FaInstagram />
//           </a>
//           <a href="#" className="hover:text-gray-200 transition">
//             <FaTwitter />
//           </a>
//           <a href="#" className="hover:text-gray-200 transition">
//             <FaLinkedinIn />
//           </a>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default TopBar;
import React, { useEffect, useState } from "react";
import {
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const TopBar = () => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScrollY && current > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(current);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`hidden bg-gradient-to-r from-primary-700 to-secondary-600 text-white transition-all duration-300 xl:block ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="h-12 flex items-center justify-between">

          {/* Left Side */}
          <div className="flex items-center gap-8 text-sm">

            <div className="flex items-center gap-2">
              <FaClock className="text-xs" />
              <span>Mon - Sat : 5:30 PM - 9:00 PM</span>
            </div>

            <div className="flex items-center gap-2">
              <FaEnvelope className="text-xs" />
              <span>contact@homeopathy-world.com</span>
            </div>

            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-xs" />
              <span>Bhopal, Madhya Pradesh</span>
            </div>

          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">

            <a
              href="#"
              className="hover:text-green-200 transition duration-300"
            >
              <FaFacebookF />
            </a>

            <a
              href="#"
              className="hover:text-green-200 transition duration-300"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              className="hover:text-green-200 transition duration-300"
            >
              <FaTwitter />
            </a>

            <a
              href="#"
              className="hover:text-green-200 transition duration-300"
            >
              <FaLinkedinIn />
            </a>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TopBar;

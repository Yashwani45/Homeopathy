// export default Header;
import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { FaWhatsapp, FaChevronDown, FaClinicMedical } from "react-icons/fa";
import axios from "axios";
import TopBar from "./TopBar";
import Logo from "../Images/Navbar/logo-3.png";
import { Menu , X } from "lucide-react";



const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [foldAngle, setFoldAngle] = useState(0);


  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const menuRef = useRef(null);

  const navItems = [
    { path: "/", label: "Home", end: true },
    { path: "/about", label: "About" },
    { path: "/Online-Consultation", label: "Consultation" },
    { path: "/Homeopathy", label: "Homeopathy" },
    { path: "/contact", label: "Contact" },
  ];



  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          if (currentY > lastScrollY.current && currentY > 120) {
            setHidden(true);
            setFoldAngle(90);
          } else {
            setHidden(false);
            setFoldAngle(0);
          }

          lastScrollY.current = currentY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50">

      {/* Top Bar */}
      <div
        className={`transition-all duration-300 ${
          hidden
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <TopBar />
      </div>

      {/* Navbar */}
      <div
        className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-primary-100 origin-top transition-transform duration-500"
        style={{
          transform: `perspective(1200px) rotateX(-${foldAngle}deg)`,
        }}
      >
        <div className="container-main">

          <div className="flex items-center h-20 xl:h-24">

            {/* Logo */}
            <NavLink
              to="/"
              className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-3"
            >
              <img
                src={Logo}
                alt="Homeopathy World"
                className="h-12 w-12 object-contain sm:h-14 sm:w-14 xl:h-16 xl:w-16"
              />

              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight text-primary-700 sm:text-xl xl:text-2xl">
                  HOMEOPATHY
                </h2>

                <p className="text-[10px] tracking-[3px] text-slate-500 sm:text-xs sm:tracking-[4px]">
                  WORLD
                </p>
              </div>
            </NavLink>

            {/* Desktop Section */}
            <div className="ml-auto hidden items-center gap-8 xl:flex">

              {/* Navigation */}
              <nav className="flex items-center gap-6 2xl:gap-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative pb-1 text-sm font-medium transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:rounded-full after:bg-primary-500 after:transition-all after:duration-300 ${
                        isActive
                          ? "text-primary-600 after:w-full"
                          : "text-slate-700 hover:text-primary-600 after:w-0 hover:after:w-full"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}


              </nav>

              {/* Buttons */}
              <div className="flex items-center gap-3">

                <a
                  href="https://wa.me/919109102650"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-green-600"
                >
                  <FaWhatsapp className="text-base" />
                  WhatsApp
                </a>



              </div>

            </div>

            {/* Mobile Menu Button */}
            
       <button
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm xl:hidden"
  aria-label="Toggle menu"
>
  {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
</button>

          </div>

        </div>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 xl:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 z-50 h-full w-[min(18rem,calc(100vw-2rem))] transform bg-white shadow-2xl transition-transform duration-300 xl:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b">
          <h3 className="font-bold text-xl text-primary-700">
            Menu
          </h3>
        </div>

        <nav className="flex flex-col p-6 gap-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-primary-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}




        </nav>
      </div>



    </header>
  );
};

export default Header;

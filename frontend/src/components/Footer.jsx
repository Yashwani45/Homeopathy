
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-[#C7EABB]">

      {/* ================= MAIN FOOTER ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

          {/* ABOUT */}
          <div>

            <h2 className="text-3xl font-bold text-primary-700">
              Homeopathy World
            </h2>

            <p className="mt-4 text-slate-600 leading-relaxed text-sm">
              Sumitra Homeopathy Clinic provides safe, natural and
              personalized homeopathic treatment focused on
              long-term wellness and holistic healing.
            </p>

            <div className="flex gap-3 mt-5">

              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="/"
                    className="
                      w-9 h-9
                      bg-white
                      border
                      border-primary-200
                      rounded-lg
                      flex items-center justify-center
                      text-primary-600
                      hover:bg-primary-600
                      hover:text-white
                      hover:-translate-y-1
                      transition-all
                      duration-300
                      shadow-sm
                      text-sm
                    "
                  >
                    <Icon />
                  </a>
                )
              )}

            </div>

          </div>

          {/* QUICK LINKS */}
          <div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm text-slate-600">

              <li>
                <Link to="/" className="hover:text-primary-600">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-primary-600">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/services" className="hover:text-primary-600">
                  Services
                </Link>
              </li>

              <li>
                <Link
                  to="/Online-Consultation"
                  className="hover:text-primary-600"
                >
                  Online Consultation
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-primary-600">
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to="/" className="hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/" className="hover:text-primary-600">
                  Terms & Conditions
                </Link>
              </li>

            </ul>

          </div>

          {/* SERVICES */}
          <div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Our Services
            </h3>

            <ul className="space-y-2 text-sm text-slate-600">

              <li>Chronic Disease Management</li>
              <li>Pediatric Care</li>
              <li>Women’s Health</li>
              <li>Skin & Hair Treatment</li>
              <li>Stress & Lifestyle Care</li>

            </ul>

          </div>

          {/* CONTACT */}
          <div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm text-slate-600">

              <li className="flex gap-3">
                <FaWhatsapp className="text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">
                    Consultation Number
                  </p>
                  <p className="font-semibold text-slate-800">
                    +91 91091 02650
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <FaEnvelope className="text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>
                  <p className="font-semibold text-slate-800 break-all">
                    contact@homeopathy-world.com
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">
                    Address
                  </p>
                  <p className="font-semibold text-slate-800 leading-snug">
                    301, Near 11 No. Stop, E-7,
                    Arera Colony, Bhopal
                  </p>
                </div>
              </li>

            </ul>

          </div>

        </div>

      </div>

      {/* ================= COPYRIGHT ================= */}
      <div className="border-t border-primary-200/60">

        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-slate-650 text-xs md:text-sm">
            © 2025 Homeopathy World. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-slate-650">

            <span className="text-primary-700 font-semibold select-none">
              Developed by TechnoVani Pvt Ltd
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;
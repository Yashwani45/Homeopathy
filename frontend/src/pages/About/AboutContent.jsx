import React from "react";
import {
  FaCheckCircle,
  FaUsers,
  FaSmile,
  FaAward,
} from "react-icons/fa";

import Image from "../../Images/About/About-4.png";
import Img from "../../Images/About/About-6.png";

const About = () => {
  return (
   
<section className="relative py-24 bg-gradient-to-b from-[#F8FFFD] to-[#EAFBF7] overflow-hidden">

  {/* Background Shapes */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-[#BDEEE4] rounded-full blur-3xl opacity-30"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D6F8F1] rounded-full blur-3xl opacity-40"></div>

  <div className="relative max-w-7xl mx-auto px-6">
    <div className="grid lg:grid-cols-2 gap-16 items-center">

      {/* LEFT IMAGES */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-5">

          <img
            src={Image}
            alt=""
            className="rounded-3xl shadow-lg h-[300px] w-full object-cover"
          />

          <img
            src={Img}
            alt=""
            className="rounded-3xl shadow-lg h-[300px] w-full object-cover mt-12"
          />

          <div className="col-span-2 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-3 text-center">

              <div>
                <h3 className="text-3xl font-bold text-[#16A085]">
                  15K+
                </h3>
                <p className="text-gray-500 mt-1">
                  Happy Patients
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#16A085]">
                  25+
                </h3>
                <p className="text-gray-500 mt-1">
                  Years Experience
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#16A085]">
                  98%
                </h3>
                <p className="text-gray-500 mt-1">
                  Success Rate
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div>

        <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#E8F9F4] text-[#16A085] rounded-full font-semibold">
          🌿 About Sumitra Homeopathy Clinic
        </span>

        <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Redefining Healthcare with
          <span className="block text-[#16A085] mt-2">
            Natural Homeopathy
          </span>
        </h2>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          At Sumitra Homeopathy Clinic, we provide safe, gentle and
          personalized homeopathic treatments designed to heal the root
          cause of illness. Our mission is to help every patient achieve
          lasting wellness through holistic healthcare.
        </p>

        {/* Features */}
        <div className="mt-8 space-y-5">

          {[
            "Expert Homeopathic Practitioners",
            "Advanced Diagnostic Approach",
            "Personalized Treatment Plans",
            "Long-Term Wellness & Prevention",
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
              <FaCheckCircle className="text-[#16A085] text-xl" />
              <span className="font-medium text-gray-700">
                {item}
              </span>
            </div>
          ))}

        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-4 mt-10">

          <div className="bg-white p-5 rounded-2xl shadow-md text-center">
            <FaUsers className="mx-auto text-[#16A085] text-2xl mb-2" />
            <h3 className="font-bold text-xl">15K+</h3>
            <p className="text-sm text-gray-500">
              Patients
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md text-center">
            <FaAward className="mx-auto text-[#16A085] text-2xl mb-2" />
            <h3 className="font-bold text-xl">25+</h3>
            <p className="text-sm text-gray-500">
              Experience
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md text-center">
            <FaSmile className="mx-auto text-[#16A085] text-2xl mb-2" />
            <h3 className="font-bold text-xl">98%</h3>
            <p className="text-sm text-gray-500">
              Satisfaction
            </p>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-10">

          <button className="bg-[#16A085] hover:bg-[#13856f] text-white px-8 py-4 rounded-xl font-semibold shadow-lg">
            Learn More
          </button>

          <button className="bg-white border-2 border-[#16A085] text-[#16A085] px-8 py-4 rounded-xl font-semibold hover:bg-[#F3FFFC]">
            Call: +91 91091 02650
          </button>

        </div>

      </div>
    </div>
  </div>
</section>
  );
};

export default About;


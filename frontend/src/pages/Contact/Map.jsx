import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Map = () => {
return (
<section className="relative">
        <iframe
          title="map"
          src="https://www.google.com/maps?q=E-7%20Area%20Colony%20Bhopal&output=embed"
          className="w-full h-[450px]"
          loading="lazy"
        ></iframe>

        {/* Opening Hours */}
        <div className="absolute top-10 right-10 bg-gradient-to-b from-blue-950 to-indigo-900 text-white rounded-xl shadow-xl w-72">
          <div className="p-4 space-y-2 text-sm">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day) => (
              <div key={day} className="flex justify-between border-b border-white/10 pb-1">
                <span>{day}</span>
                <span>05:30 PM - 09:00 PM</span>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <span>Sunday</span>
              <span className="text-cyan-400">WhatsApp Only</span>
            </div>
          </div>
        </div>
      </section>
      );
    };
    export default Map;
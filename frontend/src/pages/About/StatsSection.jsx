import React from "react";
import {
  FaCheckCircle,
  FaUsers,
  FaSmile,
  FaClock,
  FaHospital,
} from "react-icons/fa";

const Stats = () =>{

const Stat = ({ icon, value, label }) => (
  <div>
    <div className="text-4xl mb-1 mx-auto">{icon}</div>
    <h3 className="text-3xl font-bold text-white">{value}</h3>
    <p className="text-gray-200 mt-1">{label}</p>
  </div>
);
return (
 <section className="relative bg-gradient-to-r from-green-300 to-blue-300 py-10 text-white">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-4 text-center">
          <Stat icon={<FaUsers />} value="8K+" label="Patients Served" />
          <Stat icon={<FaSmile />} value="95%" label="Happy Clients" />
          <Stat icon={<FaClock />} value="15+" label="Years of Experience" />
          <Stat icon={<FaHospital />} value="100%" label="Holistic Care" />
        </div>
      </section>
      );
    };
    export default Stats;
import React from 'react'
import Fav from "../../Images/About/About-1.png"

const Why  = () => {

    const Feature = ({ title, desc }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600">{desc}</p>
  </div>
);
  return (
    <div> <section className="py-20 bg-blue-200">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <span className="inline-block mb-3 px-4 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Reason Patients Trust Us
            </h2>

            <div className="space-y-5 hover:space-y-6 transition-all duration-300 cursor-pointer bg-gradient-to-r from-green-300 to-blue-300 p-6 rounded-xl">
              <Feature
                title="Hygienic & Safe Environment"
                desc="We maintain a clean, safe, and comforting atmosphere throughout treatment."
              />
              <Feature
                title="Focused on Lifelong Wellness"
                desc="We go beyond symptoms to ensure long-term holistic health."
              />
              <Feature
                title="Collaborative Care Approach"
                desc="Our team works together to provide personalized treatment plans."
              />
            </div>
          </div>

          <div>
            <img
              src={Fav}
              alt="team"
              className="rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section></div>
  )
}

export default Why;
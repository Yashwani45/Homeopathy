import React, { useState } from "react";

const Faq = () => {

  const faqs = [
    {
      q: "How do I book an online consultation with Sumitra Homeopathy Clinic?",
      a: "You can book an online consultation through our website or via phone/WhatsApp. After booking, you will receive a confirmation message with the consultation link."
    },
    {
      q: "What documents or information do I need?",
      a: "Basic medical history, previous prescriptions, reports (if any), and current symptoms."
    },
    {
      q: "How is the online consultation conducted?",
      a: "Consultation is conducted via video call or phone call as per your convenience."
    },
    {
      q: "How do I receive medicines after consultation?",
      a: "Medicines are couriered to your address or can be collected from the clinic."
    },
    {
      q: "Is online consultation effective?",
      a: "Yes, online homeopathic consultations are effective for most acute and chronic conditions."
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-50 to-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow"
            >
              <button
                onClick={() =>
                  setOpenIndex(index === openIndex ? null : index)
                }
                className="w-full flex justify-between items-center p-5 font-medium text-left"
              >
                {item.q}
                <span className="text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;

import React, { useState } from "react";

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Is homeopathy safe for children and elderly?",
      a: "Yes, homeopathy is generally considered gentle and safe for both children and elderly patients when prescribed by a qualified practitioner.",
    },
    {
      q: "How long does it take to see results?",
      a: "The response time depends on the condition, its severity, and how long it has been present. Some people notice changes quickly, while chronic cases may take longer.",
    },
    {
      q: "Can homeopathy be combined with other medicine?",
      a: "In many cases, yes. It is always best to inform your doctor about all medicines you are taking so the treatment plan can be guided safely.",
    },
    {
      q: "Do I need consultation before treatment?",
      a: "Yes, a consultation is recommended before starting treatment so the remedy can be selected based on your symptoms and overall health.",
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;

          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-base font-semibold text-slate-900">
                  {item.q}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff6ea] text-lg font-bold text-[#0c8f64]">
                  {isOpen ? "<" : ">"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Faq;

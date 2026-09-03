

import Image from "../../Images/Homeopathy/Homeopathymedicine-2.webp"
const Why = () => {
return (
<section className="py-10 bg-gray-50">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-80 items-center ">
          
          <div>
            <span className="text-cyan-600 uppercase text-sm">
              Why Choose Homeopathy
            </span>
            <h3 className="text-3xl font-bold mt-3 mb-6">
              Safe • Natural • Effective
            </h3>

            <ul className="space-y-4">
              <li>
                <strong>Natural Approach:</strong> Stimulates the body’s own healing mechanism.
              </li>
              <li>
                <strong>Individualized Treatment:</strong> Tailored remedies for each patient.
              </li>
              <li>
                <strong>Zero Side Effects:</strong> Gentle medicines without harmful reactions.
              </li>
            </ul>
          </div>

          <img
            src={Image}
            alt=""
            className="rounded-3xl shadow-xl"
          />
        </div>
      </section>
      );
    };
    export default Why;
const Stat = () => {
return (
<section className="relative bg-gradient-to-r from-indigo-900 to-blue-800 py-10 text-white">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
          {[
            ["5k+", "Patients Served"],
            ["100%", "Client Satisfaction"],
            ["18+", "Years of Experience"],
            ["98%", "Prompt Resolution"],
          ].map((stat, i) => (
            <div key={i}>
              <h3 className="text-3xl font-bold text-white">{stat[0]}</h3>
              <p className="text-white text-sm mt-2">{stat[1]}</p>
            </div>
          ))}
        </div>
      </section>
      );
    };
    export default Stat;
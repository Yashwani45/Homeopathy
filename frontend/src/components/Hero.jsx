import React from 'react'
import { Link } from 'react-router-dom';
import Home from "../Images/Home/Home.png";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-primary-50">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl animate-float animate-delay-1000"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl animate-float animate-delay-2000"></div>
      </div>
      
      <div className="container-main section">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="animate-fade-in">
            
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Natural Healing with{' '}
              <span className="text-gradient">Classical Homeopathy</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Treating the root cause of diseases with safe, gentle, and effective 
              homeopathic medicine. Restoring health and vitality naturally for 
              over 25 years.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary">
                Book Free Consultation
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
             
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">25+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">15,000+</div>
                <div className="text-sm text-gray-600">Patients Treated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Image/Illustration */}
          <div className="relative animate-slide-up">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-1">
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="aspect-video rounded-xl overflow-hidden relative">
                    {/* Main Image */}
                    <img 
                      src={Home} 
                      alt="Homeopathy treatment - natural healing with herbs and medicine"
                      className="w-full h-full "
                    />                    
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-100 rounded-full animate-float"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full animate-float animate-delay-300"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
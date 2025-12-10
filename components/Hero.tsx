"use client";
import React from "react";
import WalletConnect from "./WalletConnect";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[45vh] sm:min-h-[40vh] flex items-center justify-center text-center px-4 py-8 sm:py-12 overflow-hidden">
      {/* Doodles - ajustés pour mobile */}
      <div className="absolute top-4 sm:top-8 left-2 sm:left-6 w-12 sm:w-20 h-12 sm:h-20 bg-pink-200 rounded-full opacity-60 animate-float" />
      <div className="absolute top-16 sm:top-24 right-4 sm:right-12 w-10 sm:w-16 h-10 sm:h-16 bg-blue-200 rounded-full opacity-60 animate-wiggle" />
      <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-10 w-16 sm:w-24 h-16 sm:h-24 bg-green-200 rounded-full opacity-60 animate-float-delayed" />
      <div className="absolute bottom-10 sm:bottom-16 right-2 sm:right-6 w-8 sm:w-10 h-8 sm:h-10 bg-purple-200 rounded-full opacity-60 animate-wiggle" />
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[120%] h-32 bg-gradient-to-t from-white to-transparent z-0" />

      <div className="relative z-10">
        <div className="relative inline-block">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-pangolin font-black text-black mb-3 sm:mb-4">
            <span className="relative z-10 inline-block bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 animate-gradient">Oinkonomics</span>
            <span className="absolute -top-1 -left-1 text-5xl sm:text-6xl md:text-8xl font-pangolin font-black text-black opacity-10">Oinkonomics</span>
            <span className="absolute -bottom-1 -right-1 text-5xl sm:text-6xl md:text-8xl font-pangolin font-black text-black opacity-10">Oinkonomics</span>
          </h1>
          <div className="absolute -top-4 -left-6 w-8 h-8 bg-yellow-300 opacity-70 animate-sparkle shape-star rotate-12" />
          <div className="absolute -bottom-2 -right-4 w-6 h-6 bg-pink-300 opacity-70 animate-float shape-star -rotate-12" />
        </div>
        
        <p className="text-lg sm:text-xl md:text-2xl font-pangolin text-gray-800 relative mb-6 sm:mb-8 px-2 max-w-2xl mx-auto">
          <span className="relative z-10 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent font-bold">
            Turning wallet data into oinks and insights
          </span>
        </p>

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-auto inline-block">
            <WalletConnect variant="compact" />
          </div>
          
          <div className="mx-auto max-w-[280px] sm:max-w-md md:max-w-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-yellow-200 to-pink-200 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            <a href="https://ibb.co/d4rmMS7Z" target="_blank" rel="noopener noreferrer" className="block relative">
              <img
                src="https://i.ibb.co/HTVh40XZ/image.png"
                alt="Hero artwork"
                className="w-full h-auto rounded-2xl border-2 border-black shadow-hard hover:scale-[1.02] transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

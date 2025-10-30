"use client";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[40vh] flex items-center justify-center text-center px-4 py-10">
      {/* Doodles */}
      <div className="absolute top-8 left-6 w-20 h-20 bg-pink-200 rounded-full opacity-60 animate-float" />
      <div className="absolute top-24 right-12 w-16 h-16 bg-blue-200 rounded-full opacity-60 animate-wiggle" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-green-200 rounded-full opacity-60 animate-float" />
      <div className="absolute bottom-16 right-6 w-10 h-10 bg-purple-200 rounded-full opacity-60 animate-wiggle" />
      <div className="absolute top-28 left-1/3 w-10 h-10 bg-yellow-300 opacity-70 animate-sparkle shape-star" />

      <div>
        <h1 className="text-5xl md:text-7xl font-pangolin font-bold text-black mb-4 relative">
          <span className="relative z-10 animate-wiggle text-gradient-pink">Oinkonomics</span>
          <span className="absolute top-1 left-1 text-5xl md:text-7xl font-pangolin font-bold text-pink-300 -z-10">Oinkonomics</span>
        </h1>
        <p className="text-xl md:text-2xl font-pangolin text-gray-800 relative mb-6">
          <span className="relative z-10 text-gradient-sun">Turning wallet data into oinks and insights</span>
          <span className="absolute top-0.5 left-0.5 text-xl md:text-2xl font-pangolin text-yellow-200 -z-10">Turning wallet data into oinks and insights</span>
        </p>
        <div className="mx-auto max-w-md md:max-w-2xl">
          <a href="https://ibb.co/d4rmMS7Z" target="_blank" rel="noopener noreferrer" className="block">
            <img
              src="https://i.ibb.co/HTVh40XZ/image.png"
              alt="Hero artwork"
              className="w-full h-auto outline-sticker card-glass hover-wobble"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

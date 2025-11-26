"use client";
import React from "react";
import WalletConnect from "./WalletConnect";

const Header: React.FC = () => {
  return (
    <header className="w-full mx-auto max-w-6xl py-4 px-4 flex items-center justify-between font-grotesk">
      <div className="flex items-center gap-2 sm:gap-3 card-neon px-2 sm:px-3 py-2 rotate-slight">
        <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-[#9945FF] opacity-80 animate-sparkle" />
        <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-[#14F195] opacity-80 animate-float" />
        <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-[#8752F3] opacity-80 animate-wiggle" />
        <a href="/" className="block">
          <img
            src="https://i.ibb.co/HTVh40XZ/image.png"
            alt="Oinkonomics logo"
            className="h-5 sm:h-6 md:h-8 lg:h-10 w-auto object-contain max-h-10 hover-wobble"
          />
        </a>
      </div>

      {/* Single wallet button responsive to all screens */}
      <div className="flex-shrink-0 relative">
        <WalletConnect />
      </div>
    </header>
  );
};

export default Header;

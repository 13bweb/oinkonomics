"use client";
import React from "react";
import WalletConnect from "./WalletConnect";

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 md:px-8 flex items-center justify-between font-grotesk">
      <div className="flex items-center gap-3 card-neon px-3 py-2 rotate-slight">
        <span className="w-3 h-3 rounded-full bg-[#9945FF] opacity-80 animate-sparkle" />
        <span className="w-3 h-3 rounded-full bg-[#14F195] opacity-80 animate-float" />
        <span className="w-3 h-3 rounded-full bg-[#8752F3] opacity-80 animate-wiggle" />
        <a href="/" className="block">
          <img
            src="https://i.ibb.co/HTVh40XZ/image.png"
            alt="Oinkonomics logo"
            className="h-8 md:h-10 w-auto object-contain hover-wobble"
          />
        </a>
      </div>
      <WalletConnect />
    </header>
  );
};

export default Header;

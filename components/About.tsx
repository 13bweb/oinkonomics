'use client';
import React from 'react';

const About = () => {
  return (
    <div className="space-y-8">
      {/* About the Project */}
      <div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-6 rounded-3xl shadow-lg border-2 border-black transform rotate-1">
        <h2 className="text-2xl font-pangolin font-bold mb-4 text-black">About the Project</h2>
        <p className="text-gray-800 leading-relaxed">
          Oinkonomics is more than just an NFT collection; it's a social and artistic experience. 
          The project aims to create a playful mirror of Solana's financial ecosystem, where wallet 
          value doesn't determine paid access, but rather a unique visual identity. There's no sale, 
          no treasury to fill. Minting is free (users only pay Solana network fees) because the goal 
          isn't commercial. It's about celebrating participation in the ecosystem, transforming raw 
          data into "oinks and insights", and building a community around a fun and original idea.
        </p>
      </div>

      {/* About the Creators */}
      <div className="bg-gradient-to-r from-pink-200 to-purple-200 p-6 rounded-3xl shadow-lg border-2 border-black transform -rotate-1">
        <h2 className="text-2xl font-pangolin font-bold mb-4 text-black">About the Creators</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-pangolin font-bold text-black">Sia Skateson</h3>
            <p className="text-gray-800 leading-relaxed">
              Born in Belgrade in 2014, Sia Paradinović (alias Sia Skateson) is a bubbling creative force. 
              From the age of six, she actively explores painting, digital illustration, animation, and sculpture. 
              In 2023, with her parents' support, she launched her first NFT collection on the Solana blockchain, 
              "Gummy Buddy". This series of digital avatars allowed her to build a global community of collectors. 
              She created all the NFTs for Oinkonomics.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-pangolin font-bold text-black">TreizeB (Kamel)</h3>
            <p className="text-gray-800 leading-relaxed">
              TreizeB, also known as Kamel, is a developer from Tunisia focused on the Solana ecosystem. Active on X as @TreizeB__, he’s built a name in Web3 by shipping on-chain apps and mint tooling (Metaplex/Candy Machine) with a strong emphasis on mint UX. He is the developer behind Oinkonomics.
            </p>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="bg-gradient-to-r from-green-200 to-blue-200 p-6 rounded-3xl shadow-lg border-2 border-black transform rotate-1">
        <h2 className="text-2xl font-pangolin font-bold mb-4 text-black">Credits</h2>
        <p className="text-gray-800 leading-relaxed">
          Built by the 10 & 14 y/o @solana duo @siaskateson & @TreizeB__. All NFTs by @siaskateson. All development by @TreizeB__.
          Supported by @SuperteamBLKN & @SuperteamFRANCE.
        </p>
      </div>
    </div>
  );
};

export default About;

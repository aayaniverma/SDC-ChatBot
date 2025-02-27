"use client";

import Image from "next/image";

export default function WelcomeAnimation() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-[#E67E22]">
      {/* Circular Image - Moved Higher */}
      <div className="w-44 h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-full bg-white shadow-xl flex items-center justify-center mt-[-80px]">
        <Image
          src="\images\manipal-university-jaipur-featured.jpg" // Replace with actual image
          width={300}
          height={300}
          alt="Chatbot Avatar"
          className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full object-cover"
        />
      </div>

      {/* Heading & Text - Moved Slightly Up */}
      <div className="mt-4">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white soft-glow-text">
          Welcome to MUJ CSE Chatbot
        </h1>
        <p className="text-white text-base md:text-lg mt-2">
          Your AI-powered assistant is here!
        </p>
      </div>

      {/* Soft Glow Effect for Text */}
      <style jsx>{`
        .soft-glow-text {
          text-shadow: 0 0 6px rgba(255, 140, 0, 0.5), 0 0 12px rgba(255, 100, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

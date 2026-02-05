import React from "react";
import ShortenInput from "./ShortenInput";

export default function Landing() {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 md:py-32 lg:py-40">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight text-white leading-tight">
          Shorten Your Links
        </h1>

        <p className="mt-4 sm:mt-6 font-mono text-gray-400 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg tracking-tighter px-4">
          Transform your long URLs into clean, sharable links.
        </p>

        <div className="mt-6 sm:mt-8">
          <ShortenInput />
        </div>
      </div>
    </header>
  );
}

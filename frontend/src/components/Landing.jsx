import React from "react";
import ShortenInput from "./ShortenInput";

export default function Landing() {
  return (
    <header className="w-full max-w-6xl mx-auto px-12 py-40">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white">
          Shorten Your Links
        </h1>

        <p className="mt-6 font-mono text-gray-400 max-w-2xl mx-auto text-lg tracking-tighter">
          Transform your long URLs into clean, sharable links.
        </p>

        <div className="mt-8">
          <ShortenInput />
        </div>
      </div>
    </header>
  );
}

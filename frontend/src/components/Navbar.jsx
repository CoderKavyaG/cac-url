import React from "react";
import { FaGithub } from "react-icons/fa";


export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-10">
      <div className="text-white text-4xl font-bold tracking-tight font-mono">cac-url</div>
      <div className="flex items-center gap-4">
        <div className="cursor-pointer text-4xl text-white hover:text-gray-300 transition">
          <FaGithub />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 font-semibold text-white text-lg font-mono px-6 py-2 rounded-full transition">
          Sign In
        </button>
      </div>
    </nav>
  );
}

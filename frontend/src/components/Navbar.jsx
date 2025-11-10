import React from "react";
import { FaGithub } from "react-icons/fa";


export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-10">
      <div className="text-white text-4xl font-bold tracking-tight font-mono">cac-url</div>
      <ul className="hidden md:flex font-mono font-semibold gap-8 text-2xl text-gray-200 items-center">
        <li className="cursor-pointer">Home</li>
        <li className="cursor-pointer">About</li>
        <li className="cursor-pointer"><FaGithub /></li>
      </ul>
      <button className="ml-4 bg-blue-600 font-semibold text-white text-xl font-mono px-6 py-2 rounded-full">
        Sign In
      </button>
    </nav>
  );
}

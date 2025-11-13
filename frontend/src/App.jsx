import React, { useState } from "react";
import "./index.css";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";

function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");

  // Show home/landing page
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-stone-900 via-neutral-800 to-gray-900 text-white">
      <div className="backdrop-blur-sm bg-gradient-to-b from-black/10 via-black/5 to-transparent">
        <Navbar setCurrentPage={setCurrentPage} />
        <main className="px-6 py-8">
          <Landing />
        </main>
      </div>
    </div>
  );
}

export default App;

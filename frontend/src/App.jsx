import React, { useState, useEffect } from "react";
import "./index.css";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/Dashboard/DashboardPage";
import LinkDetailsPage from "./components/Dashboard/LinkDetailsPage";

import RedirectHandler from "./components/RedirectHandler";

function App() {
  const { user, logout, loading, signInWithGoogle } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedLink, setSelectedLink] = useState(null);

  // Check for short URL redirection (e.g. /abc1234)
  const path = window.location.pathname;
  // Ignore Vercel internal paths or assets
  if (path && path !== '/' && path !== '/index.html' && !path.startsWith('/assets') && !path.startsWith('/@')) {
    const shortId = path.substring(1);
    return <RedirectHandler shortId={shortId} />;
  }

  // Force re-render when auth state changes
  useEffect(() => {
    if (!loading && !user && (currentPage === 'dashboard' || currentPage === 'linkDetails')) {
      setCurrentPage('home');
      signInWithGoogle(); // Prompt login
    }
  }, [user, loading, currentPage]);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {currentPage === 'home' && (
        <>
          <div className="neon-glow-top"></div>
          <div className="neon-glow-secondary"></div>
        </>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar setCurrentPage={setCurrentPage} />

        <div className="flex flex-1 overflow-hidden">
          {currentPage !== "linkDetails" && (
            <Sidebar
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onLogout={() => {
                logout();
                setCurrentPage("home");
              }}
              user={user}
              onShowAuthModal={signInWithGoogle}
            />
          )}

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto pb-24 md:pb-8 md:ml-16 lg:ml-20">
            {currentPage === "home" && (
              <main className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                <Landing />
              </main>
            )}

            {currentPage === "dashboard" && (
              <div className="w-full">
                <DashboardPage
                  setCurrentPage={setCurrentPage}
                  onViewLink={(link) => {
                    setSelectedLink(link);
                    setCurrentPage("linkDetails");
                  }}
                  onShowAuthModal={signInWithGoogle}
                />
              </div>
            )}

            {currentPage === "linkDetails" && selectedLink && (
              <div className="w-full">
                <LinkDetailsPage
                  link={selectedLink}
                  onBack={() => setCurrentPage("dashboard")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

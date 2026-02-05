import React, { useState, useEffect } from "react";
import "./index.css";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/Dashboard/DashboardPage";
import LinkDetailsPage from "./components/Dashboard/LinkDetailsPage";

function App() {
  const { user, logout, loading, signInWithGoogle } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedLink, setSelectedLink] = useState(null);

  // Force re-render when auth state changes
  useEffect(() => {
    if (!loading && !user && (currentPage === 'dashboard' || currentPage === 'linkDetails')) {
      setCurrentPage('home');
      signInWithGoogle(); // Prompt login
    }
  }, [user, loading, currentPage]);

  return (
    <div className="min-h-screen w-full bg-black text-white">


      {/* Content wrapper with sidebar and main area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar - Constant across all pages */}
        <Navbar setCurrentPage={setCurrentPage} />

        {/* Main content area with sidebar and page content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Hidden on stats page */}
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

          {/* Page Content - Responsive padding for sidebar and mobile nav */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto pb-24 md:pb-8 md:ml-16 lg:ml-20">
            {/* Home / Landing Page */}
            {currentPage === "home" && (
              <main className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                <Landing />
              </main>
            )}

            {/* Dashboard Page */}
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

            {/* Link Details Page */}
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

import React, { useState, useEffect } from "react";
import "./index.css";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/Dashboard/DashboardPage";
import LinkDetailsPage from "./components/Dashboard/LinkDetailsPage";
import SignUpModal from "./components/SignUpModal";

function App() {
  const { user, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedLink, setSelectedLink] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChanged, setAuthChanged] = useState(false);

  // Force re-render when auth state changes
  useEffect(() => {
    if (user) {
      setAuthChanged(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Neon purple glow from top */}
      <div className="neon-glow-top"></div>
      <div className="neon-glow-secondary"></div>

      {/* Content wrapper with sidebar and main area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar - Constant across all pages */}
        <Navbar setCurrentPage={setCurrentPage} onShowAuthModal={() => setShowAuthModal(true)} />

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
              onShowAuthModal={() => setShowAuthModal(true)}
            />
          )}

          {/* Page Content - Shifted right to account for fixed sidebar */}
          <div className="flex-1 px-8 py-8 overflow-y-auto pb-20 md:pb-8 md:ml-0">
            {/* Home / Landing Page */}
            {currentPage === "home" && (
              <main className="px-6 py-8">
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
                  onShowAuthModal={() => setShowAuthModal(true)}
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

      {/* Auth Modal */}
      {showAuthModal && (
        <SignUpModal 
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState } from "react";
import "./index.css";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/Dashboard/DashboardPage";
import LinkDetailsPage from "./components/Dashboard/LinkDetailsPage";
import SignUpModal from "./components/SignUpModal";

function App() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedLink, setSelectedLink] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-stone-900 via-neutral-800 to-gray-900 text-white">
      {/* Backdrop blur effect */}
      <div className="backdrop-blur-sm bg-gradient-to-b from-black/10 via-black/5 to-transparent min-h-screen w-full fixed inset-0 pointer-events-none"></div>

      {/* Content wrapper with sidebar and main area */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
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

        {/* Main Content Area */}
        <div className="flex-1 pl-32 pr-8 py-8 overflow-auto">
          {/* Home / Landing Page */}
          {currentPage === "home" && (
            <>
              <Navbar setCurrentPage={setCurrentPage} onShowAuthModal={() => setShowAuthModal(true)} />
              <main className="px-6 py-8">
                <Landing />
              </main>
            </>
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

      {/* Auth Modal */}
      {showAuthModal && (
        <SignUpModal 
          onClose={() => setShowAuthModal(false)}
          testUser={{ email: 'admin@gmail.com', password: '1233' }}
        />
      )}
    </div>
  );
}

export default App;

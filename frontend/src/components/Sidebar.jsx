import React, { useState } from 'react';
import { FiHome, FiBarChart2, FiLogOut, FiLock } from 'react-icons/fi';

export default function Sidebar({ currentPage, onNavigate, onLogout, user, onShowAuthModal }) {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { name: 'home', icon: FiHome, label: 'Home' },
    { name: 'dashboard', icon: FiBarChart2, label: 'Dashboard', locked: !user },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleNavClick = (item) => {
    if (item.locked) {
      onShowAuthModal();
    } else {
      onNavigate(item.name);
    }
  };

  return (
    <>
      {/* Sidebar - Fixed on left side, vertically centered */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50">
        {/* Sidebar Container */}
        <div className="bg-slate-900/40 border border-gray-500/20 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-8 shadow-xl">
          {/* Navigation Icons */}
          <div className="flex flex-col gap-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.name;

              return (
                <div key={item.name} className="relative group">
                  <button
                    onClick={() => handleNavClick(item)}
                    disabled={item.locked}
                    className={`
                      w-12 h-12 rounded-lg transition-all duration-200 flex items-center justify-center relative
                      ${item.locked ? 'cursor-not-allowed' : 'hover:scale-105'}
                      ${
                        isActive
                          ? 'bg-gray-700/50 text-gray-100 border border-gray-400/30'
                          : item.locked
                          ? 'bg-transparent text-gray-600 border border-transparent'
                          : 'bg-transparent text-gray-400 hover:text-gray-200 border border-transparent hover:border-gray-400/20'
                      }
                    `}
                    onMouseEnter={() => setHoveredIcon(item.name)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    title={item.label}
                  >
                    <IconComponent size={22} />
                    
                    {/* Lock Overlay */}
                    {item.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiLock size={20} className="text-red-400/80" />
                      </div>
                    )}
                  </button>

                  {/* Tooltip */}
                  {hoveredIcon === item.name && (
                    <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-black/80 text-gray-200 text-xs px-3 py-1 rounded-lg whitespace-nowrap pointer-events-none animate-fadeIn border border-gray-400/20">
                      {item.locked ? 'Sign In to unlock' : item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-500/20"></div>

          {/* Logout Button - Only show when logged in */}
          {user && (
            <div className="relative group">
              <button
                onClick={handleLogoutClick}
                className="w-12 h-12 rounded-lg bg-transparent text-gray-400 hover:text-gray-200 transition-all duration-200 flex items-center justify-center border border-transparent hover:border-gray-400/20 hover:scale-105"
                title="Logout"
                onMouseEnter={() => setHoveredIcon('logout')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <FiLogOut size={22} />
              </button>

              {/* Tooltip */}
              {hoveredIcon === 'logout' && (
                <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-black/80 text-gray-200 text-xs px-3 py-1 rounded-lg whitespace-nowrap pointer-events-none animate-fadeIn border border-gray-400/20">
                  Logout
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="bg-slate-900/60 border border-gray-500/30 rounded-2xl p-8 w-96">
            <h3 className="text-gray-100 text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-200 px-4 py-2 rounded-lg transition border border-gray-500/20"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-100 px-4 py-2 rounded-lg transition border border-gray-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
      {/* Desktop Sidebar - Fixed on left side, vertically centered */}
      <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-50">
        {/* Sidebar Container */}
        <div className="bg-black border border-gray-800/60 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center gap-6 shadow-2xl shadow-purple-900/20">
          {/* Navigation Icons */}
          <div className="flex flex-col gap-5">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.name;

              return (
                <div key={item.name} className="relative group">
                  <button
                    onClick={() => handleNavClick(item)}
                    disabled={item.locked}
                    className={`
                      w-11 h-11 rounded-xl transition-all duration-200 flex items-center justify-center relative
                      ${item.locked ? 'cursor-not-allowed' : 'hover:scale-105'}
                      ${
                        isActive
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/20'
                          : item.locked
                          ? 'bg-transparent text-gray-600 border border-transparent'
                          : 'bg-transparent text-gray-400 hover:text-purple-300 border border-transparent hover:border-purple-500/30'
                      }
                    `}
                    onMouseEnter={() => setHoveredIcon(item.name)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    title={item.label}
                  >
                    <IconComponent size={20} />
                    
                    {/* Lock Overlay */}
                    {item.locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                        <FiLock size={14} className="text-red-500" />
                      </div>
                    )}
                  </button>

                  {/* Tooltip */}
                  {hoveredIcon === item.name && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-purple-200 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none animate-fadeIn border border-purple-500/30 shadow-lg shadow-purple-500/10">
                      {item.locked ? 'Sign In to unlock' : item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-800"></div>

          {/* Logout Button - Only show when logged in */}
          {user && (
            <div className="relative group">
              <button
                onClick={handleLogoutClick}
                className="w-11 h-11 rounded-xl bg-transparent text-gray-400 hover:text-purple-300 transition-all duration-200 flex items-center justify-center border border-transparent hover:border-purple-500/30 hover:scale-105"
                title="Logout"
                onMouseEnter={() => setHoveredIcon('logout')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <FiLogOut size={20} />
              </button>

              {/* Tooltip */}
              {hoveredIcon === 'logout' && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-purple-200 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none animate-fadeIn border border-purple-500/30 shadow-lg shadow-purple-500/10">
                  Logout
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tablet Sidebar - Smaller, positioned left */}
      <div className="hidden md:block lg:hidden fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-black border border-gray-800/60 backdrop-blur-md rounded-xl p-3 flex flex-col items-center gap-4 shadow-2xl shadow-purple-900/20">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                disabled={item.locked}
                className={`
                  w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center relative
                  ${item.locked ? 'cursor-not-allowed' : 'active:scale-95'}
                  ${
                    isActive
                      ? 'bg-purple-900/40 text-purple-300 shadow-md shadow-purple-500/20'
                      : item.locked
                      ? 'text-gray-600'
                      : 'text-gray-400 hover:text-purple-300'
                  }
                `}
              >
                <IconComponent size={18} />
                {item.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                    <FiLock size={12} className="text-red-500" />
                  </div>
                )}
              </button>
            );
          })}
          
          {user && (
            <>
              <div className="w-6 h-px bg-gray-800"></div>
              <button
                onClick={handleLogoutClick}
                className="w-10 h-10 rounded-lg text-gray-400 hover:text-purple-300 transition-all duration-200 flex items-center justify-center active:scale-95"
              >
                <FiLogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Fixed at bottom with safe area */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-black border-t border-gray-800/80 shadow-2xl shadow-purple-900/30">
          <div className="flex items-stretch justify-around max-w-md mx-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  disabled={item.locked}
                  className={`
                    flex flex-col items-center justify-center gap-1 py-3 px-4 flex-1 transition-all duration-200 min-h-[64px] relative
                    ${item.locked ? 'cursor-not-allowed' : 'active:bg-purple-900/20'}
                    ${isActive ? 'text-purple-400' : 'text-gray-500'}
                  `}
                >
                  {/* Active background glow */}
                  {isActive && (
                    <div className="absolute inset-x-2 top-1 bottom-1 bg-purple-900/30 rounded-xl border border-purple-500/30"></div>
                  )}
                  <div className="relative z-10">
                    <IconComponent size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {item.locked && (
                      <div className="absolute -top-1 -right-2 bg-black rounded-full p-0.5">
                        <FiLock size={10} className="text-red-500" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-purple-300' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {/* Active indicator line */}
                  {isActive && <div className="w-4 h-0.5 rounded-full bg-purple-500 mt-0.5 relative z-10"></div>}
                </button>
              );
            })}

            {/* Logout Button - Mobile */}
            {user && (
              <button
                onClick={handleLogoutClick}
                className="flex flex-col items-center justify-center gap-1 py-3 px-4 flex-1 text-gray-500 transition-all duration-200 min-h-[64px] active:bg-purple-900/20"
              >
                <FiLogOut size={22} strokeWidth={2} />
                <span className="text-[10px] font-medium">Logout</span>
              </button>
            )}
          </div>
          {/* Safe area padding for notched phones */}
          <div className="h-safe-area-inset-bottom bg-black"></div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
          <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-sm mx-auto shadow-2xl shadow-purple-900/20">
            <h3 className="text-white text-lg font-bold mb-3">Confirm Logout</h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-200 px-4 py-2.5 rounded-lg font-medium transition border border-gray-700 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 px-4 py-2.5 rounded-lg font-medium transition border border-purple-500/30 text-sm sm:text-base"
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

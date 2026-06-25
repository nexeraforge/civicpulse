import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MapPin, LayoutDashboard, Compass, Home, User, PlusCircle, LogOut, Award } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logoutUser } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const activeStyle = "flex items-center gap-1.5 px-4 py-2 rounded-btn text-primary-blue font-bold bg-primary-blue/5 border border-primary-blue/10 shadow-glow-primary transition-all duration-200";
  const inactiveStyle = "flex items-center gap-1.5 px-4 py-2 rounded-btn text-brand-textSecondary hover:text-brand-text hover:bg-slate-100/60 border border-transparent transition-all duration-200";

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full glass-navbar shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center shadow-premium transform group-hover:scale-105 transition-transform duration-200">
                <MapPin className="text-white w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-poppins font-extrabold text-lg leading-tight tracking-tight text-brand-text group-hover:text-primary-blue transition-colors duration-200">
                  CivicPulse
                </span>
                <span className="text-[9px] text-primary-green font-bold tracking-widest uppercase -mt-0.5">
                  Community Solver
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-1.5 font-inter text-xs">
                <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </NavLink>
                <NavLink to="/explore" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                  <Compass className="w-4 h-4" />
                  <span>Explore</span>
                </NavLink>
                <NavLink to="/maps" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                  <MapPin className="w-4 h-4" />
                  <span>Maps</span>
                </NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </NavLink>
              </div>
            )}

            {/* Actions & Avatar */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  {/* Reputation Badge Display */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 shadow-sm text-amber-700 text-xs font-semibold">
                    <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse-slow" />
                    <span>{currentUser.reputation} Points</span>
                  </div>

                  {/* Report Action Button */}
                  <Link
                    to="/report"
                    className="gradient-btn flex items-center gap-1.5 px-4 py-2.5 rounded-btn text-xs font-bold shadow-premium transform active:scale-95 duration-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Report Issue</span>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1 focus:outline-none p-0.5 rounded-full hover:ring-2 hover:ring-primary-soft/55 transition-all duration-200 cursor-pointer"
                    >
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-brand-card shadow-premium border border-slate-100 py-1.5 text-xs text-brand-text">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-bold truncate text-brand-text">{currentUser.name}</p>
                          <p className="text-[10px] text-brand-textSecondary truncate">{currentUser.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors duration-150"
                        >
                          <User className="w-4 h-4 text-brand-textSecondary" />
                          <span>My Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-650 transition-colors duration-150 text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="gradient-btn px-5 py-2.5 rounded-btn text-xs font-semibold shadow-premium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-t border-slate-100/80 flex justify-around items-center md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-4">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 w-14 h-full text-[9px] font-bold transition-all duration-200 ${
                isActive ? 'text-primary-blue' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Home className="w-4.5 h-4.5" />
            <span>Home</span>
          </NavLink>

          <NavLink 
            to="/explore" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 w-14 h-full text-[9px] font-bold transition-all duration-200 ${
                isActive ? 'text-primary-blue' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Explore</span>
          </NavLink>

          <NavLink 
            to="/maps" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 w-14 h-full text-[9px] font-bold transition-all duration-200 ${
                isActive ? 'text-primary-blue' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <MapPin className="w-4.5 h-4.5" />
            <span>Maps</span>
          </NavLink>

          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 w-14 h-full text-[9px] font-bold transition-all duration-200 ${
                isActive ? 'text-primary-blue' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 w-14 h-full text-[9px] font-bold transition-all duration-200 ${
                isActive ? 'text-primary-blue' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile</span>
          </NavLink>
        </div>
      )}
    </>
  );
}

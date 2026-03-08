import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Upload, User, LogOut, Shield, BookOpen, ChevronRight } from 'lucide-react';
import ChatWidget from '../Buttom-navbR/AI';
import ChatNotification from './ChatNotification';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, show: true },
    { to: '/upload', label: 'Upload', icon: Upload, show: isAuthenticated },
    { to: '/profile', label: 'Profile', icon: User, show: isAuthenticated },
    { to: '/admin', label: 'Admin', icon: Shield, show: isAuthenticated && isAdmin },
  ];

  return (
    <>
      <nav className="bg-gradient-to-r to-black from-blue-800 shadow-lg sticky top-0 z-50 border-b border-blue-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-lg blur-md group-hover:blur-lg transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-blue-800 to-cyan-500 p-2 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">code4You</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(({ to, label, icon: Icon, show }) => 
                show && (
                  <Link
                    key={to}
                    to={to}
                    className="text-blue-100 hover:text-cyan-300 transition-all duration-200 flex items-center space-x-1.5 group relative"
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{label}</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300" />
                  </Link>
                )
              )}

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                    <ChatNotification />
                    <span className="text-blue-100 text-sm font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-black px-5 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 font-semibold hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <ChatNotification />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-blue-100 hover:text-cyan-300 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Beautiful Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="relative">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-black/60 to-black/80 backdrop-blur-xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            
            <div className="relative px-4 pb-6 pt-4 space-y-4">
              {/* User Profile Card - Beautiful Glassmorphic Design */}
              

              {/* Navigation Links */}
              <div className="space-y-2">
                <Link
                  to="/"
                  className="group relative flex items-center space-x-3 p-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-cyan-500/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all group-hover:scale-110">
                    <Home className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                  </div>
                  <span className="text-blue-100 font-semibold text-base group-hover:text-white transition-colors">
                    Home
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-all ml-auto group-hover:translate-x-1" />
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/upload"
                      className="group relative flex items-center space-x-3 p-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-cyan-500/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all group-hover:scale-110">
                        <Upload className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                      </div>
                      <span className="text-blue-100 font-semibold text-base group-hover:text-white transition-colors">
                        Upload
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-all ml-auto group-hover:translate-x-1" />
                    </Link>

                    <Link
                      to="/profile"
                      className="group relative flex items-center space-x-3 p-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-cyan-500/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all group-hover:scale-110">
                        <User className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                      </div>
                      <span className="text-blue-100 font-semibold text-base group-hover:text-white transition-colors">
                        Profile
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-all ml-auto group-hover:translate-x-1" />
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="group relative flex items-center space-x-3 p-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-purple-500/20"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all group-hover:scale-110">
                          <Shield className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                        </div>
                        <span className="text-blue-100 font-semibold text-base group-hover:text-white transition-colors">
                          Admin
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-all ml-auto group-hover:translate-x-1" />
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Auth Actions */}
              <div className="pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full group relative flex items-center space-x-3 p-3.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/40 hover:border-orange-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
                  >
                    <div className="h-11 w-11 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-all group-hover:scale-110">
                      <LogOut className="h-5 w-5 text-orange-400 group-hover:text-orange-300" />
                    </div>
                    <span className="text-orange-400 font-semibold text-base group-hover:text-orange-300 transition-colors">
                      Logout
                    </span>
                    <ChevronRight className="h-5 w-5 text-orange-400/50 group-hover:text-orange-400 transition-all ml-auto group-hover:translate-x-1" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-3.5 px-4 rounded-xl border-2 border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all duration-300 font-semibold text-base hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="relative block w-full text-center py-3.5 px-4 rounded-xl font-bold text-base overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative text-black flex items-center justify-center space-x-2">
                        <span>Get Started</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer Badge */}
              <div className="pt-4 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                    Powered by code4You
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <ChatWidget />
    </>
  );
};

export default Navbar;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Upload, User, LogOut, Shield, BookOpen } from 'lucide-react';
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
//  console.log("object",user.name.split(" ")[0]);
//  var mn=user?.name.split(" ")[0];
//  console.log(mn);
  return (
    <nav className="bg-gradient-to-r to-black via-blue-900 from-blue-900 shadow-md sticky top-0 z-50 border-b border-blue-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-800 to-cyan-500 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">code4You</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6  ">
            <Link
              to="/"
              className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center space-x-1  "
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/upload"
                  className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center space-x-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
                <Link
                  to="/profile"
                  className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {/* <div className="relative">
                    
                    {user?.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-black"></span>
                    )}
                  </div> */}
                    <ChatNotification/>
                  <span className="text-blue-100 text-sm">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-all duration-800 flex items-center space-x-1 shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-blue-100 hover:text-cyan-300 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-black px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-blue-100 hover:text-cyan-300 flex items-center space-x-1  flex-row-reverse "
            >
            {isOpen ? <X className="h-6 w-6 " /> : <Menu className="h-6 w-6 bg-gradient-to-br from-cyan-400 to-blue-400 text-black rounded-md " />}
              <div className='flex flex-row-reverse px-4'>

              <ChatNotification/>
              </div>
         
          </button>
        
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 bg-black/40 rounded-lg p-4 py- ">
            
            <Link
              to="/"
              className="block text-blue-100 hover:text-cyan-300 pl-2 border-r-2 rounded-lg  text-lg font-medium text-center"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </div>
            </Link>
            
            {isAuthenticated &&  (
              <>
                <Link
                  to="/upload"
                  className="block text-blue-100 hover:text-cyan-300 pl-2 border-r-2 rounded-lg  text-lg font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className="block text-blue-100 hover:text-cyan-300 pl-2 border-r-2 rounded-lg  text-lg font-medium text-center-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block text-blue-100 hover:text-cyan-300 pl-2 border-r-2 rounded-lg  text-lg font-medium text-center-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left text-blue-100 hover:text-orange-400 pl-2 border-r-2 rounded-lg  text-lg font-medium text-center-2"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="block text-blue-100 hover:text-cyan-300 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block bg-gradient-to-r from-cyan-400 to-blue-400 text-black px-4 py-2 rounded-lg text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
      <ChatWidget/>
    </nav>
  );
};

export default Navbar;

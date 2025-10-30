import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/icons/logo2.png';

const Navbar = ({ isLoggedIn, userType }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (isLoggedIn) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-grey-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={logo} 
                alt="Quizify Logo" 
                className="h-12 w-12 object-cover rounded-full shadow-sm border-2 border-white 
                hover:border-red-200 transition-all"
              />
              <h1 className="ml-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 font-montserrat tracking-wide">
                QUIZIFY
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLink 
                to="/"
                className={({ isActive }) => 
                  `px-1 py-2 text-base font-medium transition-colors duration-200 relative
                  ${isActive 
                    ? 'text-orange-600 font-semibold' 
                    : 'text-gray-700 hover:text-orange-600'
                  } after:absolute after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-600 after:to-pink-600 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300
                  ${isActive ? 'after:w-full' : ''}`
                }
              >
                Student
              </NavLink>
              <NavLink 
                to="/teacher"
                className={({ isActive }) => 
                  `px-1 py-2 text-base font-medium transition-colors duration-200 relative
                  ${isActive 
                    ? 'text-orange-600 font-semibold' 
                    : 'text-gray-700 hover:text-orange-600'
                  } after:absolute after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-600 after:to-pink-600 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300
                  ${isActive ? 'after:w-full' : ''}`
                }
              >
                Faculty
              </NavLink>
              <NavLink 
                to="/admin"
                className={({ isActive }) => 
                  `px-1 py-2 text-base font-medium transition-colors duration-200 relative
                  ${isActive 
                    ? 'text-orange-600 font-semibold' 
                    : 'text-gray-700 hover:text-orange-600'
                  } after:absolute after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-600 after:to-pink-600 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300
                  ${isActive ? 'after:w-full' : ''}`
                }
              >
                Admin
              </NavLink>
              <NavLink 
                to="/about"
                className={({ isActive }) => 
                  `px-1 py-2 text-base font-medium transition-colors duration-200 relative
                  ${isActive 
                    ? 'text-orange-600 font-semibold' 
                    : 'text-gray-700 hover:text-orange-600'
                  } after:absolute after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-600 after:to-pink-600 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300
                  ${isActive ? 'after:w-full' : ''}`
                }
              >
                About Us
              </NavLink>
              
            </div>
          </div>
        
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <NavLink
            to="/student"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? 'text-white bg-gradient-to-r from-orange-600 to-pink-600' : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
              }`
            }
            onClick={toggleMenu}
          >
            Student
          </NavLink>
          <NavLink
            to="/teacher"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? 'text-white bg-gradient-to-r from-orange-600 to-pink-600' : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
              }`
            }
            onClick={toggleMenu}
          >
            Faculty
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? 'text-white bg-gradient-to-r from-orange-600 to-pink-600' : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
              }`
            }
            onClick={toggleMenu}
          >
            Admin
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? 'text-white bg-gradient-to-r from-orange-600 to-pink-600' : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
              }`
            }
            onClick={toggleMenu}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? 'text-white bg-gradient-to-r from-orange-600 to-pink-600' : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
              }`
            }
            onClick={toggleMenu}
          >
            Contact Us
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
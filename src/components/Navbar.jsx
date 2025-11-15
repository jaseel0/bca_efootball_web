// Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation items
  const navItems = [
    { path: "/", name: "Home" },
    { path: "/league", name: "League" },
    { path: "/players", name: "Players" },
  ];

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                e football
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-gray-800 hover:text-blue-400"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-800 transition duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition duration-300 ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 hover:text-blue-400"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
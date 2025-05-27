import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import CreateWorkspaceModal from '../pages/workspace/createWorkSpaceModal';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);



  const handleCreateWorkspace = (name) => {
    console.log("Creating workspace:", name);

    // API call to create workspace
    fetch('http://localhost:8000/workspace/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: name })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Workspace created successfully:", data);
      // Close the modal
      setShowModal(false);
      // Navigate to workspace page
      navigate('/workspace');
    })
    .catch(error => {
      console.error('Create workspace failed:', error);
      alert('Failed to create workspace. Please try again.');
    });
  };

  useEffect(() => {
    // Check if user is authenticated by looking for token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Call the logout endpoint
    fetch('http://localhost:8000/user/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      if (response.ok) {
        // Remove token and user information from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        navigate('/login');
      }
    })
    .catch(error => {
      console.error('Logout failed:', error);
    });
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800 animate-fade-in">
          Task Flow
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-gray-600 hover:text-blue-500 transition-colors duration-300 ${
                isActive ? 'text-blue-500 font-semibold' : ''
              }`
            }
          >
            Home
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              data-create-workspace
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Create Workspace
            </button>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-blue-500 transition-colors duration-300"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-gray-600 hover:text-blue-500 transition-colors duration-300 ${
                    isActive ? 'text-blue-500 font-semibold' : ''
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 ${
                    isActive ? 'bg-blue-700' : ''
                  }`
                }
              >
                Sign Up
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <div className="px-4 py-2 space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block text-gray-600 hover:text-blue-500 transition-colors duration-300 py-2 ${
                  isActive ? 'text-blue-500 font-semibold' : ''
                }`
              }
              onClick={toggleMenu}
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setShowModal(true);
                  toggleMenu();
                }}
                data-create-workspace-mobile
                className="block w-full text-left bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 my-2"
              >
                Create Workspace
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="block w-full text-left text-gray-600 hover:text-blue-500 transition-colors duration-300 py-2"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `block text-gray-600 hover:text-blue-500 transition-colors duration-300 py-2 ${
                      isActive ? 'text-blue-500 font-semibold' : ''
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                      isActive ? 'bg-blue-700' : ''
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      )}
      <CreateWorkspaceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateWorkspace}
      />
    </header>
  );
};

export default Navbar;

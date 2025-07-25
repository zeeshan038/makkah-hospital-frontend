import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="bg-gray-700 p-6 text-white flex justify-around items-center">
      <div className="flex items-center">
        <span className="text-2xl mr-2">🏥</span>
        <span className="text-xl font-semibold">MMC</span>
      </div>
      <div className="relative">
        <span className="text-2xl cursor-pointer" onClick={toggleDropdown}>👤</span>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <Link to={'/dashboard'} className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">Admin Panel</Link>
            <button className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100" onClick={handleLogout}>Logout</button>

          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
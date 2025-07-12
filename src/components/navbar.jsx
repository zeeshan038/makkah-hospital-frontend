import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="bg-[#1a4b52] p-6 text-white flex justify-around items-center">
      <div className="flex items-center">
        {/* Placeholder for an icon. You can replace this with an actual icon library like Font Awesome or Material Icons. */}
        <span className="text-2xl mr-2">🏥</span>
        <span className="text-xl font-semibold">MMC</span>
      </div>
       <div className=''> 
        <ul className='flex gap-10 items-center'>
          <Link to={'/'}>Home</Link>
          <Link to={'/pos'}>POS Screen</Link>
          
        </ul>
       </div>
      <div className="relative">
        <span className="text-2xl cursor-pointer" onClick={toggleDropdown}>👤</span>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <Link to={'/dashboard'} className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">Admin Panel</Link>
            <button className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">Logout</button>

          </div>
        )}
      </div>
    </nav>
  )
}

export default navbar
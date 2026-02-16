/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { IoIosHome } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaCalculator } from "react-icons/fa6";
const ButtomNav = () => {
  const navigate=useNavigate();
  const [activeNav, setActiveNav] = useState('books');

  return (
    <>
    <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeNav === 'search' ? 'active' : ''}`}
          onClick={() => navigate('/')}
          aria-label="Search"
        >
            <IoIosHome  />
        </button>

        <button 
          className={`nav-item ${activeNav === 'explore' ? 'active' : ''}`}
          // onClick={() => navigate('/compiler')}
          onClick={()=>navigate('/code-compiler')}
          aria-label="Explore"
        >
          <FaCode />
        </button>

        <button 
          onClick={()=>navigate('/upload')}
          className="nav-item center"
        >
          <FaPlus size={32} className='' />
        </button>

        <button 
          className={`nav-item ${activeNav === 'saved' ? 'active' : ''}`}
          onClick={() => navigate('/calculator')}
          aria-label="Saved"
        >
          <FaCalculator />
        </button>

        <button 
          className="nav-item"
          onClick={() =>navigate('/profile')}
          
        >
          <FaUserCircle/>
        </button>
      </nav>
    </>
  )
}

export default ButtomNav
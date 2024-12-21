import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="main-nav">
      <div className="nav-left">
        <Link to="/dashboard" className="nav-logo">Social Media Poster</Link>
      </div>
      <div className="nav-right">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/settings">Settings</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navigation; 
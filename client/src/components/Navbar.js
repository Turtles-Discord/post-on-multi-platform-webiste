import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Social Media Poster
      </div>
      <div className="navbar-menu">
        <a href="/" className="navbar-item active">
          Dashboard
        </a>
      </div>
    </nav>
  );
}

export default Navbar; 
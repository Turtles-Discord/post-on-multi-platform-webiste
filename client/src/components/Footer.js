import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <span className="divider">|</span>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} Social Media Poster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer; 
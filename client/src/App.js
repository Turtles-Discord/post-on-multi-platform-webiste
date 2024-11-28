import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import TikTokVerification from './components/TikTokVerification';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route 
            path="/terms.html/tiktokFQuoYvwPHR7OuUaw2MOfyUJ0Ygt2jJZF.txt" 
            element={<TikTokVerification fileName="tiktokFQuoYvwPHR7OuUaw2MOfyUJ0Ygt2jJZF.txt" />} 
          />
          <Route 
            path="/privacy.html/tiktokp6bAaJLqM2vOHBaj4to8mtBiL71ZI6FM.txt" 
            element={<TikTokVerification fileName="tiktokp6bAaJLqM2vOHBaj4to8mtBiL71ZI6FM.txt" />} 
          />
        </Routes>
        <Footer />
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </BrowserRouter>
  );
}

export default App; 
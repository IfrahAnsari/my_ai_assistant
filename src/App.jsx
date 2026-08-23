import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user session exists in local storage
    const session = localStorage.getItem('infi_current_user');
    if (session) {
      setIsAuthenticated(true);
    }
    // Initialize default Gemini API key if not present
    if (!localStorage.getItem('infi_gemini_key')) {
      localStorage.setItem('infi_gemini_key', 'AQ.Ab8RN6JkEvbYYV-Mp0_iwCQIsgHTKmg4Cvs3UCMwsUIHK3_QVw');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('infi_current_user');
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;

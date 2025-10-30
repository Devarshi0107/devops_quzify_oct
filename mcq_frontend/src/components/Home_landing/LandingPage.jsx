import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="welcome-text">
        <h1>Welcome to the Quiz App</h1>
      </div>
      <div className="login-options">
        <div className="login-card">
          <h2>Teacher</h2>
          <button className="login-button">Login as Teacher</button>
        </div>
        <div className="login-card">
          <h2>Student</h2>
          <button className="login-button">Login as Student</button>
        </div>
        <div className="login-card">
          <h2>Admin</h2>
          <button className="login-button">Login as Admin</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

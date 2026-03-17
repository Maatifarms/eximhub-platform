import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicNav({ showFeatureLink = false }) {
  return (
    <nav className="landing-nav">
      <Link to="/" className="logo-text">EximHub AI</Link>
      <div className="nav-links">
        {showFeatureLink ? <a href="#features">Features</a> : <Link to="/">Home</Link>}
        <Link to="/pricing">Pricing</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login" className="btn-secondary">Login</Link>
        <Link to="/signup" className="btn-primary">Start Searching</Link>
      </div>
    </nav>
  );
}

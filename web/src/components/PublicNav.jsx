import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function PublicNav({ showFeatureLink = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`landing-nav ${menuOpen ? 'menu-open' : ''}`}>
      <div className="nav-brand-row">
        <Link to="/" className="logo-text" onClick={closeMenu}>EximHub AI</Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {showFeatureLink ? (
          <a href="#features" onClick={closeMenu}>Features</a>
        ) : (
          <Link to="/" onClick={closeMenu}>Home</Link>
        )}
        <Link to="/pricing" onClick={closeMenu}>Pricing</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
        <Link to="/login" className="btn-secondary" onClick={closeMenu}>Login</Link>
        <Link to="/contact" className="btn-primary" onClick={closeMenu}>Request Access</Link>
      </div>
    </nav>
  );
}

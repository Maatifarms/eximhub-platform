import React from 'react';
import { Link } from 'react-router-dom';
import { officeLocations, primaryContact } from '../siteContent';

export default function SiteFooter() {
  return (
    <footer className="main-footer site-footer">
      <div className="site-footer-grid">
        <div className="footer-column footer-brand">
          <p className="footer-kicker">EximHub Global Trade Intelligence</p>
          <h3>Turn buyer search into real conversations and paid growth.</h3>
          <p>
            EximHub helps exporters and sourcing teams find buyers, validate markets,
            and move faster with practical trade intelligence.
          </p>
          <div className="footer-contact-stack">
            <a href={`mailto:${primaryContact.email}`} className="footer-contact-link">{primaryContact.email}</a>
            <a href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`} className="footer-contact-link">{primaryContact.phone}</a>
          </div>
        </div>

        <div className="footer-column">
          <p className="footer-column-title">Quick Links</p>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund-policy">Refund Policy</Link>
          <Link to="/login">Login</Link>
          <Link to="/contact">Request Access</Link>
        </div>

        <div className="footer-column">
          <p className="footer-column-title">How We Help</p>
          <span>Buyer discovery across 170+ countries</span>
          <span>Market intelligence for exporters</span>
          <span>Trade-ready supplier and importer search</span>
          <span>Direct support for plan selection and onboarding</span>
        </div>

        <div className="footer-column">
          <p className="footer-column-title">Our Offices</p>
          <div className="footer-office-list">
            {officeLocations.map((office) => (
              <div key={office.country} className="footer-office-card">
                <strong>{office.country}</strong>
                {office.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                {office.phone && <span>{office.phone}</span>}
                <span>{office.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom-row">
        <span>&copy; 2026 EximHub. All rights reserved.</span>
        <span>Built for practical trade growth and better buyer conversion.</span>
      </div>
    </footer>
  );
}

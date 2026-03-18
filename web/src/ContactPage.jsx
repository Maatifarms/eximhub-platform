import React from 'react';
import { Clock3, Mail, MapPin, PhoneCall } from 'lucide-react';
import PublicNav from './components/PublicNav';
import SiteFooter from './components/SiteFooter';
import ContactForm from './components/ContactForm';
import { officeLocations, primaryContact } from './siteContent';

export default function ContactPage() {
  return (
    <div className="landing-page page-shell">
      <PublicNav />

      <main className="page-content">
        <section className="page-hero">
          <span className="support-pill">Talk to EximHub</span>
          <h1>Reach us for plans, buyer search support, and market intelligence.</h1>
          <p>
            Send us your requirement and our team will contact you.
          </p>
          <div className="page-hero-links">
            <a href={`mailto:${primaryContact.email}`}><Mail size={16} /> {primaryContact.email}</a>
            <a href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`}><PhoneCall size={16} /> {primaryContact.phone}</a>
          </div>
        </section>

        <section className="contact-grid">
          <ContactForm
            title="Request a callback or demo"
            subtitle="Share your product, target market, or buyer requirement. We will guide you to the right plan."
            buttonLabel="Request Support"
          />

          <div className="contact-sidebar">
            <div className="contact-side-card">
              <h3>What happens next</h3>
              <div className="contact-step">
                <Clock3 size={18} />
                <span>We review your inquiry and suggest the right plan or workflow.</span>
              </div>
              <div className="contact-step">
                <PhoneCall size={18} />
                <span>We can follow up directly by phone or email.</span>
              </div>
              <div className="contact-step">
                <MapPin size={18} />
                <span>We support customers through India, Germany, UAE, and Tanzania.</span>
              </div>
            </div>

            <div className="contact-side-card">
              <h3>Our offices</h3>
              <div className="office-list">
                {officeLocations.map((office) => (
                  <div className="office-card" key={office.country}>
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
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

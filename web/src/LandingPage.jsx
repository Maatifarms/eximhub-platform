import React from 'react';
import {
  Globe,
  Zap,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Building2,
  Mail,
  PhoneCall,
  MessageSquareMore,
  Truck,
  Boxes,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNav from './components/PublicNav';
import SiteFooter from './components/SiteFooter';
import ContactForm from './components/ContactForm';
import { Helmet } from 'react-helmet-async';
import { officeLocations, primaryContact } from './siteContent';

export default function LandingPage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EximHub",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "25000",
      "priceCurrency": "INR"
    },
    "description": "EximHub is a global trade intelligence platform for verified buyer discovery and market analysis.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "120"
    }
  };

  return (
    <div className="landing-page">
      <Helmet>
        <title>EximHub - Global Buyer Discovery & Trade Intelligence Hub</title>
        <meta name="description" content="Discover verified buyers, exporters, and market intelligence in one place. EximHub helps you expand your global trade footprint with data-driven insights." />
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>
      <div className="orbital-field" aria-hidden="true">
        <span className="orbital-ring ring-one"></span>
        <span className="orbital-ring ring-two"></span>
        <span className="orbital-ring ring-three"></span>
        <span className="orbital-core"></span>
      </div>
      <PublicNav showFeatureLink={true} />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">World's largest buyer and supplier network across 170+ countries</div>
          <h1><span className="text-gradient">EximHub</span> is your direct gateway to global buyers, suppliers, and market intelligence.</h1>
          <p>
            Search buyers, discover suppliers, and act on trade intelligence from one practical platform built for exporters.
          </p>
          <div className="hero-actions">
            <Link to="/contact" className="btn-primary-lg">Request Access <ArrowRight size={20} /></Link>
            <Link to="/contact" className="btn-outline-lg">Talk to EximHub</Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">195</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat">
              <span className="stat-num">500k+</span>
              <span className="stat-label">Verified Contacts</span>
            </div>
            <div className="stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Trade Intelligence</span>
            </div>
          </div>
          <div className="hero-contact-bar">
            <a href={`mailto:${primaryContact.email}`}><Mail size={16} /> {primaryContact.email}</a>
            <a href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`}><PhoneCall size={16} /> {primaryContact.phone}</a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-stack">
            <div className="hero-panel primary">
              <div className="hero-scanline"></div>
              <div className="hero-panel-header">
                <div>
                  <div className="hero-panel-title">Opportunity score</div>
                  <div className="hero-score">87<span>/100</span></div>
                </div>
                <div className="hero-mini-pill">Germany / Packaging</div>
              </div>
              <div className="hero-meter">
                <div className="hero-meter-fill"></div>
              </div>
              <div className="hero-panel-row">
                <span>Verified sourcing leads</span>
                <strong>142</strong>
              </div>
              <div className="hero-panel-row">
                <span>Active buyer signals</span>
                <strong>24 today</strong>
              </div>
              <div className="hero-panel-row">
                <span>Recommended action</span>
                <strong>Reveal top 10</strong>
              </div>
            </div>
            <div className="hero-panel secondary">
              <div className="hero-panel-title">Trade assistant</div>
              <div className="hero-mini-row">
                <span>HS code guidance</span>
                <strong>Ready</strong>
              </div>
              <div className="hero-mini-row">
                <span>Market entry notes</span>
                <strong>Updated</strong>
              </div>
            </div>
            <div className="hero-panel tertiary">
              <div className="hero-panel-title">Pipeline health</div>
              <div className="hero-mini-row">
                <span>Contacts unlocked</span>
                <strong>38</strong>
              </div>
              <div className="hero-mini-row">
                <span>Shortlisted buyers</span>
                <strong>12</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="live-marquee" aria-label="Platform activity">
        <div className="marquee-track">
          <span>Verified procurement contacts across 195 countries</span>
          <span>HS code intelligence for faster market targeting</span>
          <span>Shipment-level data to track buyers and suppliers</span>
          <span>Decision-maker contacts in packaging, agri, textiles, and more</span>
          <span>Search by country, industry, or product keyword</span>
          <span>Trade Directory — browse companies without spending credits</span>
          <span>Pipeline CRM to manage and follow up with revealed contacts</span>
          <span>Market intelligence across global trade routes</span>
          <span>Verified procurement contacts across 195 countries</span>
          <span>HS code intelligence for faster market targeting</span>
          <span>Shipment-level data to track buyers and suppliers</span>
          <span>Decision-maker contacts in packaging, agri, textiles, and more</span>
        </div>
      </section>

      <section className="signal-strip" aria-label="Live trade signals">
        <div className="signal-card">
          <span className="signal-kicker">Global Reach</span>
          <strong>Buyer and supplier access in 170+ countries</strong>
          <p>Built for exporters who need quick global coverage.</p>
        </div>
        <div className="signal-card">
          <span className="signal-kicker">Core USP</span>
          <strong>Verified business profiles</strong>
          <p>Find decision makers and move to outreach faster.</p>
        </div>
        <div className="signal-card">
          <span className="signal-kicker">Trade Stack</span>
          <strong>Search, insights, and sourcing in one place</strong>
          <p>No more scattered tools and spreadsheets.</p>
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-header">
          <h2>Platform Overview</h2>
          <p>A cleaner workflow for finding buyers, validating markets, and moving faster.</p>
        </div>
        <div className="features-grid">
          <FeatureCard
            icon={<Users className="text-blue-500" />}
            title="Decision-Maker Discovery"
            desc="Reach procurement teams instead of wasting time on generic directories."
            metric="Buyer graph online"
          />
          <FeatureCard
            icon={<Globe className="text-green-500" />}
            title="Buyer and Supplier Mapping"
            desc="Explore companies by country, industry, and product focus."
            metric="195-country mesh"
          />
          <FeatureCard
            icon={<Zap className="text-purple-500" />}
            title="Faster Go-to-Market"
            desc="Turn search into outreach momentum without tool switching."
            metric="Action layer active"
          />
          <FeatureCard
            icon={<BarChart3 className="text-orange-500" />}
            title="Market Intelligence"
            desc="Use market signals to shortlist prospects and act faster."
            metric="Signals refreshing"
          />
        </div>
      </section>

      <section className="services-grid-section">
        <div className="section-header">
          <h2>More Than a Directory</h2>
          <p>EximHub is designed to support trade growth after discovery as well.</p>
        </div>
        <div className="offerings-grid">
          <CompactOfferCard
            icon={<Truck className="text-blue-400" />}
            title="Logistics Support"
            desc="Stay supported after buyer discovery with execution-focused help."
            bullets={['Route optimization', 'Customs support', 'Rate comparison']}
          />
          <CompactOfferCard
            icon={<Boxes className="text-orange-500" />}
            title="Liquidation Network"
            desc="Move slow inventory faster through urgent procurement demand."
            bullets={['Buyer matching', 'Bulk opportunities', 'Faster stock movement']}
          />
          <CompactOfferCard
            icon={<Cpu className="text-green-500" />}
            title="Trade Academy"
            desc="Learn practical sourcing and export playbooks for real use."
            bullets={['Operator-friendly guides', 'Market-entry lessons', 'Action-ready insights']}
          />
        </div>
      </section>

      <section id="pricing" className="features">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>One-time access plans with no hidden fees. Pay once, find buyers in 195 countries.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Market Explorer</h3>
            <div className="price">Rs 25,000</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>~ $300 USD &middot; Annual</p>
            <p>500 credits &mdash; for exporters entering new markets</p>
            <Link to="/pricing" className="btn-primary" style={{ marginTop: '1.5rem' }}>View Plan</Link>
          </div>
          <div className="pricing-card highlighted">
            <h3>Trade Accelerator</h3>
            <div className="price">Rs 45,000</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>~ $540 USD &middot; Semi-Annual</p>
            <p>1,200 credits &mdash; for teams scaling outreach globally</p>
            <Link to="/pricing" className="btn-primary" style={{ marginTop: '1.5rem' }}>View Plan</Link>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <p>Unlimited credits, dedicated consultant, custom workflows</p>
            <Link to="/contact" className="btn-primary" style={{ marginTop: '1.5rem' }}>Contact Sales</Link>
          </div>
        </div>
      </section>

      <section className="contact-proof-strip">
        <div className="contact-proof-card">
          <Mail size={20} />
          <div>
            <strong>Email us directly</strong>
            <span>{primaryContact.email}</span>
          </div>
        </div>
        <div className="contact-proof-card">
          <PhoneCall size={20} />
          <div>
            <strong>Call our team</strong>
            <span>{primaryContact.phone}</span>
          </div>
        </div>
        <div className="contact-proof-card">
          <Building2 size={20} />
          <div>
            <strong>Global presence</strong>
            <span>{officeLocations.length} active office locations</span>
          </div>
        </div>
      </section>

      <section className="contact-conversion-section">
        <div className="contact-conversion-copy">
          <span className="support-pill">Need help choosing a plan?</span>
          <h2>Talk to us before you buy.</h2>
          <p>
            Tell us your product and target market. We will help you choose the right EximHub plan.
          </p>
          <div className="contact-mini-grid">
            <div className="contact-mini-card">
              <MessageSquareMore size={18} />
              <span>Share product and target country</span>
            </div>
            <div className="contact-mini-card">
              <PhoneCall size={18} />
              <span>Get a direct callback</span>
            </div>
            <div className="contact-mini-card">
              <Building2 size={18} />
              <span>Work with a trade-focused team</span>
            </div>
          </div>
        </div>

        <ContactForm
          title="Send your buyer requirement"
          subtitle="We will use this to recommend the right plan, data support, or market-intelligence workflow."
          buttonLabel="Contact EximHub"
        />
      </section>

      <section className="cta-footer">
        <h2>Ready to grow internationally with less friction?</h2>
        <p>Use EximHub to find buyers faster and move with more clarity.</p>
        <div className="footer-actions">
          <Link to="/pricing" className="btn-primary">Buy Access</Link>
          <Link to="/contact" className="btn-secondary">Talk to Sales</Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({ icon, title, desc, metric }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <div className="feature-metric">{metric}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function CompactOfferCard({ icon, title, desc, bullets }) {
  return (
    <div className="offering-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <ul className="offering-list">
        {bullets.map((bullet) => (
          <li key={bullet}>
            <CheckCircle2 size={16} className="text-blue-400" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

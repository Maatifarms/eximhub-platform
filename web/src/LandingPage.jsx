import React from 'react';
import {
  Globe,
  Shield,
  Zap,
  BarChart3,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Building2,
  Mail,
  PhoneCall,
  MessageSquareMore,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNav from './components/PublicNav';
import SiteFooter from './components/SiteFooter';
import ContactForm from './components/ContactForm';
import { officeLocations, primaryContact } from './siteContent';

export default function LandingPage() {
  return (
    <div className="landing-page">
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
            Built as a trade operating system for exporters, importers, sourcing teams, and business owners,
            EximHub gives you buyer search, supplier discovery, and market signals from one fast, usable platform.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary-lg">Start with 100 free credits <ArrowRight size={20} /></Link>
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

      <section className="live-marquee" aria-label="Live market activity">
        <div className="marquee-track">
          <span>Live buyers detected in Europe</span>
          <span>Procurement intent rising in packaging</span>
          <span>New sourcing clusters mapped across 195 countries</span>
          <span>Export operators revealing verified contacts in real time</span>
          <span>Trade Academy assets connected to the sales workflow</span>
          <span>Live buyers detected in Europe</span>
          <span>Procurement intent rising in packaging</span>
          <span>New sourcing clusters mapped across 195 countries</span>
          <span>Export operators revealing verified contacts in real time</span>
          <span>Trade Academy assets connected to the sales workflow</span>
        </div>
      </section>

      <section className="signal-strip" aria-label="Live trade signals">
        <div className="signal-card">
          <span className="signal-kicker">Global Reach</span>
          <strong>Direct buyer and supplier access in 170+ countries</strong>
          <p>One network built for exporters and sourcing teams that need immediate global coverage.</p>
        </div>
        <div className="signal-card">
          <span className="signal-kicker">Core USP</span>
          <strong>World-scale buyer and supplier collection</strong>
          <p>Search verified business profiles, uncover decision makers, and move from research to outreach faster.</p>
        </div>
        <div className="signal-card">
          <span className="signal-kicker">Trade Stack</span>
          <strong>Discovery, supplier sourcing, AI, and trade assets</strong>
          <p>One operating surface instead of disconnected tools, spreadsheets, and scattered directories.</p>
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-header">
          <h2>Platform Overview</h2>
          <p>The EximHub advantage starts with a massive cross-border buyer and supplier network, then turns that reach into a cleaner and faster trade workflow.</p>
        </div>
        <div className="features-grid">
          <FeatureCard
            icon={<Users className="text-blue-500" />}
            title="Decision-Maker Discovery"
            desc="Reach procurement managers and sourcing leaders instead of wasting time on generic directories."
            metric="Buyer graph online"
          />
          <FeatureCard
            icon={<Globe className="text-green-500" />}
            title="Buyer and Supplier Mapping"
            desc="Explore companies by country, industry, and product focus with a clearer trade view."
            metric="195-country mesh"
          />
          <FeatureCard
            icon={<Zap className="text-purple-500" />}
            title="Faster Go-to-Market"
            desc="Turn search intent and lead discovery into outreach momentum without jumping between tools."
            metric="Action layer active"
          />
          <FeatureCard
            icon={<BarChart3 className="text-orange-500" />}
            title="Market Intelligence"
            desc="Use AI-backed context to prioritize markets, shortlist prospects, and plan the next step."
            metric="Signals refreshing"
          />
        </div>
      </section>

      <section className="services-grid-section">
        <div className="service-row">
          <div className="service-info">
            <h3>Logistics and Freight Support</h3>
            <p>We want EximHub to support the full export workflow, not just lead finding. This direction keeps the platform useful after discovery, when execution starts.</p>
            <ul className="service-list">
              <li><CheckCircle2 size={18} className="text-blue-400" /> Route Optimization</li>
              <li><CheckCircle2 size={18} className="text-blue-400" /> Customs Clearance Assistance</li>
              <li><CheckCircle2 size={18} className="text-blue-400" /> Real-time Rate Comparison</li>
            </ul>
          </div>
          <div className="service-visual">
            <div className="glass-card">
              <Globe size={80} className="floating-icon" />
            </div>
          </div>
        </div>

        <div className="service-row reverse">
          <div className="service-info">
            <h3>Inventory Liquidation Network</h3>
            <p>Turn slow-moving stock into working capital with a buyer network tailored for bulk liquidation and urgent procurement opportunities.</p>
            <ul className="service-list">
              <li><CheckCircle2 size={18} className="text-blue-400" /> Instant Buyer Matching</li>
              <li><CheckCircle2 size={18} className="text-blue-400" /> Global Bulk Auctions</li>
              <li><CheckCircle2 size={18} className="text-blue-400" /> Anonymous Bidding</li>
            </ul>
          </div>
          <div className="service-visual">
            <div className="glass-card">
              <Shield size={80} className="floating-icon" />
            </div>
          </div>
        </div>
      </section>

      <section className="features bg-dark-soft">
        <div className="section-header">
          <h2>EximHub AI Trade Assistant</h2>
          <p>Get faster answers on HS codes, buyer targeting, and market-entry questions without leaving your workflow.</p>
        </div>
        <div className="service-row">
          <div className="service-info">
            <h3>Ask practical trade questions. Get useful next steps.</h3>
            <p>We are shaping the AI layer to be operator-friendly: concise recommendations, plain-language guidance, and action-ready insights.</p>
            <Link to="/signup" className="btn-secondary">Try AI Assistant Free</Link>
          </div>
          <div className="service-visual">
            <div className="glass-card">
              <Cpu size={80} className="floating-icon text-blue-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2>Global Sourcing Mastery</h2>
          <p>Learn the playbook behind better buyer discovery, outreach, and trade execution.</p>
        </div>
        <div className="service-row reverse">
          <div className="service-info">
            <h3>Digital Book: Global Trade Secrets</h3>
            <p>Master the art of sourcing from 195 countries with our expert guide for Rs 500.</p>
            <Link to="/book" className="btn-primary">Buy Digital Book</Link>
          </div>
          <div className="service-visual">
            <div className="glass-card">
              <BookOpen size={80} className="floating-icon text-green-500" />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="features">
        <div className="section-header">
          <h2>Scalable Pricing Programs</h2>
          <p>Choose the level of access that matches your team size, search volume, and growth ambition.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Program 1</h3>
            <div className="price">Rs 25,000</div>
            <p>For exporters validating new markets</p>
            <Link to="/signup" className="btn-primary" style={{ marginTop: '1.5rem' }}>Get Started</Link>
          </div>
          <div className="pricing-card highlighted">
            <h3>Program 2</h3>
            <div className="price">Rs 45,000</div>
            <p>For teams actively scaling outreach</p>
            <Link to="/signup" className="btn-primary" style={{ marginTop: '1.5rem' }}>Get Started</Link>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <p>For larger teams needing custom workflows</p>
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
          <h2>Contact us before you buy and we will guide you to the right EximHub access.</h2>
          <p>
            If you are serious about buyer discovery, market entry, or exporter growth, do not guess.
            Tell us what you want to sell and where you want to sell it. We will help you choose the right plan faster.
          </p>
          <div className="contact-mini-grid">
            <div className="contact-mini-card">
              <MessageSquareMore size={18} />
              <span>Share your product and target country</span>
            </div>
            <div className="contact-mini-card">
              <PhoneCall size={18} />
              <span>Get a direct callback from EximHub</span>
            </div>
            <div className="contact-mini-card">
              <Building2 size={18} />
              <span>Work with a team that understands trade operations</span>
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
        <p>We are building EximHub to be the most practical, user-friendly trade growth platform for exporters who care about speed and clarity.</p>
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

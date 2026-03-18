import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from 'react-router-dom';
import { authApi, marketplaceApi } from './api';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import AdminUploadPanel from './AdminUploadPanel';
import LandingPage from './LandingPage';
import BuyerProfilePage from './BuyerProfilePage';
import CompanyDirectory from './CompanyDirectory';
import ContactPage from './ContactPage';
import PolicyPage from './PolicyPage';
import PublicNav from './components/PublicNav';
import SiteFooter from './components/SiteFooter';
import { primaryContact } from './siteContent';
import { privacySections, refundSections } from './legalContent';
import { CheckCircle } from 'lucide-react';
import './index.css';

const PricingPage = ({ user, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const planConfig = {
    program_1: { tier: 'Program 1', points: 500 },
    program_2: { tier: 'Program 2', points: 1200 },
    enterprise: { tier: 'Enterprise', points: 10000 },
  };

  const handleSelectPlan = async (planId) => {
    if (planId === 'enterprise') {
      navigate('/contact');
      return;
    }

    if (!user) {
      navigate('/signup');
      return;
    }

    const selected = planConfig[planId];
    if (!selected) return;

    const confirmed = window.confirm(`Confirm payment and upgrade to ${selected.tier}?`);
    if (!confirmed) return;

    setLoadingPlan(planId);
    try {
      const paymentId = `LOCALPAY-${Date.now()}`;
      const response = await marketplaceApi.upgrade(planId, paymentId);
      if (response.data.success) {
        const nextUser = {
          ...user,
          subscription_tier: selected.tier,
          points_balance: Number(user.points_balance || 0) + selected.points,
        };
        localStorage.setItem('exim_user', JSON.stringify(nextUser));
        onAuthSuccess(nextUser);
        alert(response.data.message || 'Plan upgraded successfully.');
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Payment failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pricing-page">
      <PublicNav />
      <div className="section-header" style={{ marginTop: '4rem' }}>
        <h1>Trade Expansion Programs</h1>
        <p>Clear plans for exporters who want faster buyer discovery, stronger market intelligence, and a smoother path to global growth.</p>
      </div>
      <div className="pricing-grid" style={{ padding: '0 2rem 4rem' }}>
        <PricingCard
          title="Program 1"
          price="Rs 25,000"
          features={['500 Procurement Credits', 'Market Intelligence Access', 'Standard Support']}
          onSelect={() => handleSelectPlan('program_1')}
          loading={loadingPlan === 'program_1'}
        />
        <PricingCard
          title="Program 2"
          price="Rs 45,000"
          highlight={true}
          features={['1,200 Procurement Credits', 'Priority AI Discovery', 'Global Sales Partner Status']}
          onSelect={() => handleSelectPlan('program_2')}
          loading={loadingPlan === 'program_2'}
        />
        <PricingCard
          title="Enterprise"
          price="Custom"
          features={['Unlimited Credits', 'Bespoke Sourcing Strategy', 'Dedicated Trade Consultant']}
          onSelect={() => handleSelectPlan('enterprise')}
          loading={loadingPlan === 'enterprise'}
          buttonLabel="Talk to Sales"
        />
      </div>
      <div className="pricing-support-card">
        <h3>Need help before you pay?</h3>
        <p>
          Tell us your product, target market, or buyer requirement and we will guide you to the right EximHub plan.
        </p>
        <div className="pricing-support-links">
          <a href={`mailto:${primaryContact.email}`}>{primaryContact.email}</a>
          <a href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`}>{primaryContact.phone}</a>
          <Link to="/contact">Open contact form</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

const PricingCard = ({ title, price, features, highlight, onSelect, loading, buttonLabel = 'Select Plan' }) => (
  <div className={`pricing-card ${highlight ? 'highlighted' : ''}`}>
    <h3>{title}</h3>
    <div className="price">{price}</div>
    <ul className="pricing-features">
      {features.map((feature, index) => (
        <li key={index}>
          <CheckCircle size={16} className="text-blue-400" />
          {feature}
        </li>
      ))}
    </ul>
    <button className="btn-primary" onClick={onSelect} disabled={loading} style={{ marginTop: '2rem' }}>
      {loading ? 'Processing Payment...' : buttonLabel}
    </button>
  </div>
);

const BookPage = () => (
  <div className="page-container">
    <h2>Digital Book: Global Trade Secrets</h2>
    <p>Master international sourcing for Rs 500.</p>
  </div>
);

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('exim_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">EximHub Trade Intelligence...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage user={user} onAuthSuccess={(nextUser) => setUser(nextUser)} />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PolicyPage title="Privacy Policy" intro="This page explains how EximHub collects, uses, and protects information when you use our website, create an account, contact us, or purchase services." effectiveDate="March 17, 2026" sections={privacySections} />} />
      <Route path="/refund-policy" element={<PolicyPage title="Refund Policy" intro="This policy explains how refunds, billing issues, cancellations, and digital-service access are handled for EximHub plans and related services." effectiveDate="March 17, 2026" sections={refundSections} />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/admin/upload" element={<AdminUploadPanel />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthUI isLogin={true} onAuthSuccess={(nextUser) => setUser(nextUser)} />} />
      <Route path="/signup" element={<Navigate to="/contact" />} />
      <Route path="/dashboard" element={user ? ((user.subscription_tier?.toLowerCase() === 'enterprise' || user.subscription_tier?.toLowerCase() === 'admin') ? <Dashboard user={user} /> : <UserDashboard user={user} />) : <Navigate to="/login" />} />
      <Route path="/profile/:id" element={user ? <BuyerProfilePage /> : <Navigate to="/login" />} />
      <Route path="/directory" element={user ? <CompanyDirectory /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function AuthUI({ isLogin, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const response = isLogin
        ? await authApi.login(email, password)
        : await authApi.signup({ name, email, password });

      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('exim_token', userData.token);
        localStorage.setItem('exim_user', JSON.stringify(userData));
        onAuthSuccess(userData);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setInfo('Google login is coming soon. Please use email login for now.');
  };

  const handleResetPassword = async () => {
    const targetEmail = (resetEmail || email || '').trim();
    if (!targetEmail) {
      setError('Enter your email to reset password.');
      return;
    }

    setResetLoading(true);
    setError('');
    setInfo('');
    try {
      const response = await authApi.resetPassword(targetEmail);
      setInfo(response.data?.message || 'Password reset request submitted.');
      setShowReset(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Could not process password reset');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">{isLogin ? 'Welcome Back' : 'Join EximHub'}</h2>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          {isLogin ? 'Pick up your buyer discovery workflow where you left off.' : 'Create your account and start exploring trade-ready buyer opportunities.'}
        </p>
        <div className="auth-methods">
          <button className="btn-social" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" width="18" alt="G" />
            Continue with Google
          </button>
        </div>
        {error && <p style={{ color: '#ef4444', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</p>}
        {info && <p style={{ color: '#22c55e', marginBottom: '0.75rem', textAlign: 'center' }}>{info}</p>}
        <div className="divider">or use email</div>
        <form onSubmit={handleEmailAuth}>
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {isLogin && (
            <p style={{ marginTop: '-0.5rem', marginBottom: '1rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowReset((prev) => !prev)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </p>
          )}
          {showReset && (
            <div className="input-group">
              <label>Reset Email</label>
              <input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="you@company.com" />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetPassword}
                disabled={resetLoading}
                style={{ marginTop: '0.5rem' }}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          )}
          <button type="submit" className="login-button">
            {loading ? 'Please wait...' : isLogin ? 'Login to Dashboard' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Need an account?" : 'Already have an account?'}
          <Link to={isLogin ? '/contact' : '/login'} style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>
            {isLogin ? 'Request access' : 'Login'}
          </Link>
        </p>
        <div className="auth-support-row">
          <a href={`mailto:${primaryContact.email}`}>{primaryContact.email}</a>
          <a href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`}>{primaryContact.phone}</a>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div className="auth-legal-row">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund-policy">Refund Policy</Link>
        </div>
        <Link to="/" className="btn-logout" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>Back to Home</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

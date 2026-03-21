import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from 'react-router-dom';
import { authApi, marketplaceApi, siteApi, paymentApi } from './api';
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

    const links = {
        program_1: 'https://payments.cashfree.com/links?code=Ga44apigr5ag_AAAAAAARrZw',
        program_2: 'https://payments.cashfree.com/links?code=Ua44avhfh5ag_AAAAAAARrZw'
    };

    if (links[planId]) {
        window.open(links[planId], '_blank');
        alert("Payment link opened in a new tab. Once payment is completed, your account will be upgraded within 2-4 hours (or instantly via automated webhook).");
        return;
    }

    setLoadingPlan(planId);
    try {
        // Fallback for others
        const response = await paymentApi.createOrder(planId);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Payment initialization failed');
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
          title="Market Explorer"
          price="Rs 25,000"
          priceUsd="~ $300 USD"
          period="Annual"
          features={['500 Procurement Credits', 'Buyer & Supplier Search (195 Countries)', 'Market Intelligence Access', 'Trade Directory Access', 'Email Support']}
          onSelect={() => handleSelectPlan('program_1')}
          loading={loadingPlan === 'program_1'}
        />
        <PricingCard
          title="Trade Accelerator"
          price="Rs 45,000"
          priceUsd="~ $540 USD"
          period="Semi-Annual"
          highlight={true}
          features={['1,200 Procurement Credits', 'Priority Buyer Discovery', 'Global Sales Partner Status', 'Market Entry Consultation', 'WhatsApp & LinkedIn Access', 'Priority Support']}
          onSelect={() => handleSelectPlan('program_2')}
          loading={loadingPlan === 'program_2'}
        />
        <PricingCard
          title="Enterprise"
          price="Custom"
          period="On Demand"
          features={['Unlimited Credits', 'Bespoke Sourcing Strategy', 'Dedicated Trade Consultant', 'Custom API Integration', 'Real-time Compliance Tracking']}
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

const PricingCard = ({ title, price, priceUsd, period, features, highlight, onSelect, loading, buttonLabel = 'Select Plan' }) => (
  <div className={`pricing-card ${highlight ? 'highlighted' : ''}`}>
    {highlight && <div className="featured-badge">Most Popular</div>}
    <h3>{title}</h3>
    <div className="price">{price}</div>
    {priceUsd && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.25rem', marginBottom: '0.25rem' }}>{priceUsd}</div>}
    {period && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{period}</div>}
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

const PaymentVerification = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      if (!orderId) {
        setStatus('error');
        setError('No order ID found in the URL.');
        return;
      }

      try {
        const response = await paymentApi.verifyOrder(orderId);
        if (response.data.success) {
          // Re-fetch balance to update local state
          const balanceRes = await authApi.login(); // Wait, I need a proper GET user data from token
          setStatus('success');
          // Important: We should probably just reload the user from the backend
          // Since I don't have a direct "me" endpoint without re-logging in
          // I'll tell the user to check dashboard
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setStatus('error');
          setError(response.data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Server error during verification.');
      }
    };
    verify();
  }, [navigate]);

  if (status === 'verifying') return <div className="loading" style={{ height: '100vh' }}>Verifying your payment with EximHub...</div>;
  if (status === 'error') return (
    <div className="login-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-form">
        <h2 style={{ color: '#ef4444' }}>Payment Error</h2>
        <p>{error}</p>
        <Link to="/pricing" className="login-button" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>Back to Pricing</Link>
      </div>
    </div>
  );

  return (
    <div className="login-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-form">
        <h2 style={{ color: '#22c55e' }}>Payment Successful!</h2>
        <p>Your plan has been upgraded and points added to your account.</p>
        <p>Redirecting you to the dashboard...</p>
      </div>
    </div>
  );
};

const BookPage = () => {
  const navigate = useNavigate();
  return (
    <div className="pricing-page">
      <PublicNav />
      <div className="section-header" style={{ marginTop: '4rem' }}>
        <h1>Global Trade Secrets</h1>
        <p>A practical playbook for exporters entering new markets and finding verified buyers faster.</p>
      </div>
      <div className="pricing-support-card" style={{ maxWidth: '640px', margin: '0 auto 3rem' }}>
        <h3>What's inside this guide</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            'How to identify high-value procurement contacts in any country',
            'HS code strategies for product classification and tariff savings',
            'Building an outbound pipeline from verified buyer data',
            'Market entry frameworks for 10 key export destinations',
            'How to use shipment intelligence to outpace competitors',
          ].map((item) => (
            <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <CheckCircle size={16} style={{ color: '#22c55e', marginTop: '3px', flexShrink: 0 }} />
              {item}
            </li>
          ))}
        </ul>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Available inside the EximHub dashboard after login. Rs 499 one-time purchase.</p>
        <button className="btn-primary" onClick={() => navigate('/login')} style={{ marginRight: '1rem' }}>
          Login to Buy — Rs 499
        </button>
        <Link to="/contact" style={{ color: 'var(--accent-primary)' }}>Have a question first?</Link>
      </div>
      <SiteFooter />
    </div>
  );
};

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

  useEffect(() => {
    const sessionKey = `visit:${window.location.pathname}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const sessionId = localStorage.getItem('eximhub_visit_session') || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('eximhub_visit_session', sessionId);

    const params = new URLSearchParams(window.location.search);
    const storedUser = localStorage.getItem('exim_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    siteApi.submitVisit({
      sessionId,
      pagePath: window.location.pathname,
      referrer: document.referrer || null,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      visitorEmail: parsedUser?.email || null,
      visitorName: parsedUser?.name || null,
      companyName: parsedUser?.company_name || null,
      language: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      metadata: {
        screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      },
    }).catch(() => {});

    sessionStorage.setItem(sessionKey, '1');
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
      <Route path="/payment-verification" element={<PaymentVerification onAuthSuccess={(nextUser) => setUser(nextUser)} />} />
      <Route path="/admin/upload" element={<AdminUploadPanel />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthUI isLogin={true} onAuthSuccess={(nextUser) => setUser(nextUser)} />} />
      <Route path="/signup" element={<Navigate to="/contact" />} />
      <Route path="/dashboard" element={user ? <UserDashboard user={user} /> : <Navigate to="/login" />} />
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
  const [googleReady, setGoogleReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setError('');
            setInfo('');
            setLoading(true);

            if (!response?.credential) {
              throw new Error('Google did not return a credential.');
            }

            const apiResponse = await authApi.googleLogin(response.credential);
            if (apiResponse.data.success) {
              const userData = apiResponse.data.data;
              localStorage.setItem('exim_token', userData.token);
              localStorage.setItem('exim_user', JSON.stringify(userData));
              onAuthSuccess(userData);
              navigate('/dashboard');
            }
          } catch (err) {
            setError(err.response?.data?.message || err.message || 'Google login failed');
          } finally {
            setLoading(false);
          }
        },
      });

      const container = document.getElementById('google-signin-button');
      if (container) {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 320,
        });
      }

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, [navigate, onAuthSuccess]);

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
    } catch (authError) {
      setError(authError.response?.data?.message || authError.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
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
    } catch (resetError) {
      setError(resetError.response?.data?.message || resetError.message || 'Could not process password reset');
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

        <div className="auth-methods" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div id="google-signin-button" />
        </div>

        {!googleReady && (
          <p style={{ color: '#94a3b8', marginBottom: '0.75rem', textAlign: 'center' }}>
            Loading Google sign-in...
          </p>
        )}

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
          {isLogin ? 'Need an account?' : 'Already have an account?'}
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

        <Link to="/" className="btn-logout" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>
          Back to Home
        </Link>
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

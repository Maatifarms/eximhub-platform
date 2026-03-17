import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from 'react-router-dom';
import { authApi } from './api';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import AdminUploadPanel from './AdminUploadPanel';
import LandingPage from './LandingPage';
import BuyerProfilePage from './BuyerProfilePage';
import CompanyDirectory from './CompanyDirectory';
import { Phone, CheckCircle } from 'lucide-react';
import './index.css';

const PricingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="pricing-page">
      <nav className="landing-nav">
        <Link to="/" className="logo-text">EximHub AI</Link>
        <div className="nav-links">
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </nav>
      <div className="section-header" style={{ marginTop: '4rem' }}>
        <h1>Trade Expansion Programs</h1>
        <p>Clear plans for exporters who want faster buyer discovery and a smoother path to global growth.</p>
      </div>
      <div className="pricing-grid" style={{ padding: '0 2rem 4rem' }}>
        <PricingCard
          title="Program 1"
          price="Rs 25,000"
          features={['500 Procurement Credits', 'Market Intelligence Access', 'Standard Support']}
          onSelect={() => navigate('/signup')}
        />
        <PricingCard
          title="Program 2"
          price="Rs 45,000"
          highlight={true}
          features={['1,200 Procurement Credits', 'Priority AI Discovery', 'Global Sales Partner Status']}
          onSelect={() => navigate('/signup')}
        />
        <PricingCard
          title="Enterprise"
          price="Custom"
          features={['Unlimited Credits', 'Bespoke Sourcing Strategy', 'Dedicated Trade Consultant']}
          onSelect={() => navigate('/signup')}
        />
      </div>
    </div>
  );
};

const PricingCard = ({ title, price, features, highlight, onSelect }) => (
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
    <button className="btn-primary" onClick={onSelect} style={{ marginTop: '2rem' }}>Select Plan</button>
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
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/admin/upload" element={<AdminUploadPanel />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthUI isLogin={true} onAuthSuccess={(nextUser) => setUser(nextUser)} />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <AuthUI isLogin={false} onAuthSuccess={(nextUser) => setUser(nextUser)} />} />
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
  const navigate = useNavigate();

  const handleEmailAuth = async (event) => {
    event.preventDefault();
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
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleGoogleLogin = async () => {
    alert('Google Login will be integrated via Hostinger Social Auth. For now, please use Email login.');
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
          <button className="btn-social">
            <Phone size={18} />
            Continue with Phone
          </button>
        </div>
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
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button type="submit" className="login-button">
            {isLogin ? 'Login to Dashboard' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <Link to={isLogin ? '/signup' : '/login'} style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>
            {isLogin ? 'Sign up' : 'Login'}
          </Link>
        </p>
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

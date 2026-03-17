import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Database, Activity, Users } from 'lucide-react';
import { discoveryApi } from './api';

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('exim_token');
    localStorage.removeItem('exim_user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1><Shield className="text-blue-500" /> EximHub Enterprise Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-sm text-slate-400">{user.email} (Enterprise)</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <aside className="sidebar">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <Activity size={20} /> Advanced Analytics
          </div>
        </aside>
        
        <section className="content-area">
          <div className="welcome-banner">
             <h2>Enterprise Portal</h2>
             <p>Accessing global procurement data at scale.</p>
          </div>
          <div className="stats-grid">
             <div className="stat-card">
                 <h3>Active Discovery Index</h3>
                 <div className="stat-value">Over 500k Contacts</div>
             </div>
             <div className="stat-card">
                 <h3>Export Capacity</h3>
                 <div className="stat-value">Unlimited</div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}



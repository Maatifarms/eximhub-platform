import React, { useState, useEffect, useRef } from 'react';
import { discoveryApi, creditsApi, marketplaceApi, authApi, marketIntelligenceApi } from './api';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Globe, Search, Book, BookOpen, CreditCard, TrendingUp, Cpu, User, LogOut, BarChart as BarChartIcon, MapPin, Briefcase, Unlock, Send, Bot, CheckCircle, ExternalLink, Shield, Mail, Phone, Building2, Database } from 'lucide-react';
import CompanyDirectory from './CompanyDirectory';

export default function UserDashboard({ user }) {
  const [userData, setUserData] = useState(user);
  const [activeView, setActiveView] = useState('Dashboard');
  const [revealedContacts, setRevealedContacts] = useState([]);

  // PERSISTENT SEARCH STATE
  const [searchState, setSearchState] = useState({
      contacts: [],
      selectedLead: null,
      industry: '',
      country: '',
      productKeyword: '',
      companyName: '',
      companySize: '',
      limit: 10,
      loading: false
  });

  // PERSISTENT MARKET INTELLIGENCE STATE
  const [marketState, setMarketState] = useState({
      rows: [],
      filters: {
          keyword: '',
          hsCode: '',
          country: '',
          shipperName: '',
          consigneeName: '',
          marketSegment: '',
          port: '',
          shipmentMode: '',
          limit: 25,
      },
      loading: false
  });

  const fetchBalance = async () => {
    try {
      const res = await creditsApi.getBalance();
      if (res.data.success) {
        setUserData(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (e) {
      console.error("Balance sync error", e);
    }
  };
 
     const fetchRevealed = async () => {
         try {
             const res = await creditsApi.getMyContacts();
             if (res.data.success) setRevealedContacts(res.data.data || []);
         } catch (e) {
             console.error("Revealed fetch error", e);
         }
     };
 
     useEffect(() => {
         setUserData(user);
         fetchBalance();
         fetchRevealed();
    
    // Check for payment verification from return URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const status = params.get('status');
    
    if (orderId && status === 'verify') {
      const verifyPayment = async () => {
        try {
            const res = await paymentApi.verifyOrder(orderId);
            if (res.data.success) {
                alert(res.data.message || "Payment verified successfully!");
                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);
                fetchBalance();
                if (activeView === 'Store') setActiveView('Library');
            } else {
                alert("Payment verification failed or pending.");
            }
        } catch (e) {
            console.error("Verification error", e);
        }
      };
      verifyPayment();
    }

    const interval = setInterval(fetchBalance, 30000); // 30s sync
    return () => clearInterval(interval);
  }, [user]);

  const refreshUserData = () => fetchBalance();

  const handleLogout = () => {
    localStorage.removeItem('exim_token');
    localStorage.removeItem('exim_user');
    window.location.href = '/';
  };

  return (
    <div className="user-dashboard">
      <aside className="user-sidebar">
        <div className="sidebar-header">
            <span className="logo-small">EximHub <span className="text-blue-500">AI</span></span>
        </div>
        <nav className="sidebar-nav">
          <NavItem active={activeView === 'Dashboard'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setActiveView('Dashboard')} />
          <NavItem active={activeView === 'Search'} icon={<Search size={20}/>} label="Procurement Discovery" onClick={() => setActiveView('Search')} />
          <NavItem active={activeView === 'Market Intelligence'} icon={<Database size={20}/>} label="Market Intelligence" onClick={() => setActiveView('Market Intelligence')} />
          <NavItem active={activeView === 'Airlines'} icon={<Truck size={20}/>} label="Carrier Intelligence" onClick={() => setActiveView('Airlines')} />
          <NavItem active={activeView === 'Library'} icon={<Book size={20}/>} label="My Library" onClick={() => setActiveView('Library')} />
          <NavItem active={activeView === 'CRM'} icon={<Briefcase size={20}/>} label="Pipeline CRM" onClick={() => setActiveView('CRM')} />
          <NavItem active={activeView === 'Directory'} icon={<Building2 size={20}/>} label="Trade Directory" onClick={() => setActiveView('Directory')} />
          <NavItem active={activeView === 'Store'} icon={<CreditCard size={20}/>} label="Digital Store" onClick={() => setActiveView('Store')} />
          {/* AI Assistant is currently in maintenance, moved to a button if needed */}
          <div className="sidebar-divider"></div>
          <NavItem active={activeView === 'AI'} icon={<Bot size={20}/>} label="AI Intelligence" onClick={() => setActiveView('AI')} />
          <NavItem active={activeView === 'Profile'} icon={<User size={20}/>} label="Profile" onClick={() => setActiveView('Profile')} />
          <button className="nav-logout" onClick={handleLogout}><LogOut size={20}/> Logout</button>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="content-header">
            <div className="header-left">
                <h2 className="view-title">{activeView === 'Search' ? 'Procurement Discovery' : activeView}</h2>
            </div>
            <div className="header-right">
                <div className="points-container">
                    <span className="points-label">Master Credits</span>
                    <span className="points-value">{userData?.points_balance || 0} Points</span>
                    <Link to="/pricing" className="btn-recharge-small">Buy Access</Link>
                </div>
                <div className="user-info">
                    <span>{userData?.name || user.email}</span>
                    <div className="avatar-placeholder">{userData?.name?.charAt(0) || 'U'}</div>
                </div>
            </div>
        </header>

        <div className="dashboard-main-scroll">
            <section className="dashboard-live-ribbon" aria-label="Live system telemetry">
                <div className="dashboard-live-track">
                    <span>Search engine online</span>
                    <span>Credits synced</span>
                    <span>Marketplace ready</span>
                    <span>AI workspace active</span>
                    <span>Directory indexed</span>
                    <span>Search engine online</span>
                    <span>Credits synced</span>
                    <span>Marketplace ready</span>
                    <span>AI workspace active</span>
                    <span>Directory indexed</span>
                </div>
            </section>
            {activeView === 'Dashboard' && <DashboardHome userData={userData} setActiveView={setActiveView} />}
            {activeView === 'Search' && <GlobalSearchView userData={userData} user={user} refreshUserData={refreshUserData} state={searchState} setState={setSearchState} />}
            {activeView === 'Market Intelligence' && <MarketIntelligenceView state={marketState} setState={setMarketState} />}
            {activeView === 'Airlines' && <AirlinesView />}
            {activeView === 'Library' && <LibraryView userData={userData} user={user} />}
            {activeView === 'CRM' && <CrmView revealedContacts={revealedContacts} />}
            {activeView === 'Directory' && <CompanyDirectory setActiveView={setActiveView} />}
            {activeView === 'Store' && <StoreView userData={userData} />}
            {activeView === 'Profile' && <ProfileView userData={userData} user={user} refreshUserData={refreshUserData} />}
            {activeView === 'AI' && <AIView userData={userData} />}
        </div>
      </main>
    </div>
  );
}

function MarketIntelligenceView({ state, setState }) {
    const [overview, setOverview] = useState(null);
    const { rows, filters, loading } = state;

    useEffect(() => {
        marketIntelligenceApi.getOverview()
            .then(res => {
                if (res.data.success) setOverview(res.data.data);
            })
            .catch(err => console.error('Market overview failed', err));
    }, []);

    const updateFilter = (key, value) => {
        setState(prev => ({ ...prev, filters: { ...prev.filters, [key]: value } }));
    };

    const runSearch = async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            const res = await marketIntelligenceApi.search(filters);
            setState(prev => ({ ...prev, rows: res.data.data || [] }));
        } catch (e) {
            alert('Market intelligence search failed: ' + (e.response?.data?.message || e.message));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="lead-intelligence-layout">
            <aside className="apollo-sidebar-rail">
                <div className="sidebar-section">
                    <h5 className="sidebar-section-title">Trade Filters</h5>
                    <div className="apollo-filter-list">
                        <div className="apollo-filter-item">
                            <label>Keyword</label>
                            <input value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} placeholder="spice, tiles, quartz..." />
                        </div>
                        <div className="apollo-filter-item">
                            <label>HS Code</label>
                            <input value={filters.hsCode} onChange={e => updateFilter('hsCode', e.target.value)} placeholder="09109100" />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Destination Country</label>
                            <input value={filters.country} onChange={e => updateFilter('country', e.target.value)} placeholder="United States" />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Shipper</label>
                            <input value={filters.shipperName} onChange={e => updateFilter('shipperName', e.target.value)} placeholder="MTR Foods" />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Consignee</label>
                            <input value={filters.consigneeName} onChange={e => updateFilter('consigneeName', e.target.value)} placeholder="Buyer name" />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Segment</label>
                            <select value={filters.marketSegment} onChange={e => updateFilter('marketSegment', e.target.value)}>
                                <option value="">All Segments</option>
                                <option value="general">General</option>
                                <option value="building_material">Building Material</option>
                            </select>
                        </div>
                        <div className="apollo-filter-item">
                            <label>Port</label>
                            <input value={filters.port} onChange={e => updateFilter('port', e.target.value)} placeholder="Dubai, Mundra..." />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Shipment Mode</label>
                            <input value={filters.shipmentMode} onChange={e => updateFilter('shipmentMode', e.target.value)} placeholder="Sea, Air, Road..." />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Limit</label>
                            <select value={filters.limit} onChange={e => updateFilter('limit', parseInt(e.target.value, 10))}>
                                {[25, 50, 100].map(num => <option key={num} value={num}>{num} rows</option>)}
                            </select>
                        </div>
                        <button className="enrich-btn-primary" onClick={runSearch} disabled={loading} style={{ marginTop: '1rem' }}>
                            <Search size={16}/> {loading ? 'Searching...' : 'Search Intelligence'}
                        </button>
                    </div>
                </div>
            </aside>

            <div className="lead-intelligence-main">
                <div className="welcome-banner" style={{ marginBottom: '1rem' }}>
                    <h2>Market Intelligence Engine</h2>
                    <p>Search shipment history, buyers, suppliers, destination countries, price bands, and trade routes in one workspace.</p>
                </div>

                <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
                    <DashboardCard
                        title="Total Records"
                        items={[`${overview?.totals?.total_records || 0} shipment rows`, `${overview?.totals?.active_hs_codes || 0} HS codes live`]}
                        icon={<Database size={18} className="text-blue-400" />}
                        tone="sky"
                    />
                    <DashboardCard
                        title="Top Countries"
                        items={(overview?.topCountries || []).slice(0, 3).map(item => `${item.label} (${item.count})`)}
                        icon={<Globe size={18} className="text-green-400" />}
                        tone="emerald"
                    />
                    <DashboardCard
                        title="Top Shippers"
                        items={(overview?.topShippers || []).slice(0, 3).map(item => `${item.label} (${item.count})`)}
                        icon={<Briefcase size={18} className="text-orange-400" />}
                        tone="amber"
                    />
                </div>

                <div className="lead-table-container">
                    <table className="lead-data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>HS Code</th>
                                <th>Buyer</th>
                                <th>Shipper</th>
                                <th>Destination</th>
                                <th>Route</th>
                                <th>Value</th>
                                <th>Segment</th>
                            </tr>
                        </thead>
                        <tbody>
                             {rows.map(row => (
                                 <tr key={row.id}>
                                     <td>{row.product_description}</td>
                                     <td><span className="code-badge">{row.hs_code}</span></td>
                                     <td>{row.consignee_name}</td>
                                     <td>{row.shipper_name}</td>
                                     <td>{row.country_of_destination}</td>
                                     <td>{row.port_of_origin} to {row.port_of_destination}</td>
                                     <td><span className="status-pill unlocked">USD {row.estimated_fob_value_usd || row.quantity_value}</span></td>
                                     <td><span className={`status-pill ${row.market_segment === 'high-fit' ? 'unlocked' : 'pending'}`}>{row.market_segment || 'N/A'}</span></td>
                                 </tr>
                             ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        Run a search to explore buyers, shippers, products, and trade routes from the imported intelligence dataset.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div className={`user-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function DashboardHome({ userData, setActiveView }) {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        discoveryApi.getAnalytics().then(res => {
            if (res.data.success) setAnalytics(res.data.data);
        });
    }, []);

    return (
        <>
            <section className="welcome-banner">
                <h1>Welcome back, {userData?.name || 'Globetrotter'}!</h1>
                <p>You have {userData?.points_balance || 0} procurement credits. Use them to discover verified buyers, reveal contacts, and build your next shortlist.</p>
            </section>

            <section className="mission-strip">
                <div className="mission-card">
                    <span className="mission-kicker">System State</span>
                    <strong>Discovery engine active</strong>
                    <p>Search, library, and marketplace flows are ready for live operator use.</p>
                </div>
                <div className="mission-card">
                    <span className="mission-kicker">Priority Move</span>
                    <strong>Shortlist high-fit buyers</strong>
                    <p>Use country, industry, and company filters to create a clean outbound queue.</p>
                </div>
                <div className="mission-card">
                    <span className="mission-kicker">Asset Layer</span>
                    <strong>Paid ebook now unlocked on purchase</strong>
                    <p>Digital assets live inside the same workflow as your prospecting and research.</p>
                </div>
            </section>

            <section className="quick-search-section">
                <div className="quick-search-glow" aria-hidden="true"></div>
                <div className="search-bar-container">
                    <div className="search-inputs">
                        <div className="input-with-icon">
                            <Search size={18} className="text-muted" />
                            <input type="text" placeholder="Try keywords like cotton, dairy, steel, packaging..." />
                        </div>
                    </div>
                    <button className="btn-search-primary" onClick={() => setActiveView('Search')}>Start Discovery</button>
                </div>
            </section>

            <div className="dashboard-grid">
                <DashboardCard 
                    title="Trending Products" 
                    items={analytics?.trendingProducts?.map(p => p.keyword) || (analytics ? [] : ['...', '...', '...'])} 
                    icon={<TrendingUp size={18} className="text-blue-400" />}
                    tone="sky"
                    onAction={() => setActiveView('Market Intelligence')}
                />
                <DashboardCard 
                    title="Top Importers by Country" 
                    items={analytics?.topCountries?.map(c => `${c.country} (${c.count} Companies)`) || (analytics ? [] : ['...', '...', '...'])} 
                    icon={<Globe size={18} className="text-green-400" />}
                    tone="emerald"
                    onAction={() => setActiveView('Search')}
                />
                <DashboardCard 
                    title="High Demand Industries" 
                    items={analytics?.topIndustries?.map(i => i.keyword) || (analytics ? [] : ['...', '...', '...'])} 
                    icon={<BarChartIcon size={18} className="text-orange-400" />}
                    tone="amber"
                    onAction={() => setActiveView('CRM')}
                />
            </div>
        </>
    );
}

function CrmView({ revealedContacts }) {
    return (
        <div className="crm-view">
             <div className="welcome-banner">
                <h2>CRM & Sales Pipeline</h2>
                <p>Manage your unlocked leads and track outreach progress.</p>
            </div>
            <div className="lead-table-container" style={{ marginTop: '2rem' }}>
                <table className="lead-data-table">
                    <thead>
                        <tr>
                            <th>Contact</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Last Activity</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revealedContacts?.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <strong>{c.full_name}</strong>
                                    <div className="text-xs text-muted">{c.email}</div>
                                </td>
                                <td>{c.company_name}</td>
                                <td><span className="status-pill unlocked">New Lead</span></td>
                                <td>Recently Unlocked</td>
                                <td><button className="view-details-btn">Open Profile</button></td>
                            </tr>
                        ))}
                        {(!revealedContacts || revealedContacts.length === 0) && (
                            <tr><td colSpan="5" className="text-center py-8 text-muted">No unlocked leads in your pipeline yet. Start discovering in the Search workspace.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AirlinesView() {
    const [type, setType] = useState('international');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const suggestions = type === 'international' 
        ? ['Emirates SkyCargo', 'Lufthansa Cargo', 'Qatar Airways', 'Cargolux']
        : ['IndiGo CarGo', 'Air India Cargo', 'SpiceXpress', 'Blue Dart'];

    const filtered = suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="airlines-view">
            <div className="welcome-banner">
                <h2>Carrier Intelligence</h2>
                <p>Lookup domestic and international cargo carriers for your trade routes.</p>
            </div>
            
            <div className="apollo-sidebar-rail" style={{ width: '100%', maxWidth: 'none', flexDirection: 'row', gap: '2rem', height: 'auto', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Flight Scope</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn-toggle ${type === 'domestic' ? 'active' : ''}`} onClick={() => setType('domestic')}>Domestic</button>
                        <button className={`btn-toggle ${type === 'international' ? 'active' : ''}`} onClick={() => setType('international')}>International</button>
                    </div>
                </div>
                <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Search carrier or route...</label>
                    <input 
                        className="apollo-search-input"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={type === 'international' ? "Search Emirates, Qatar..." : "Search IndiGo, Blue Dart..."}
                    />
                </div>
            </div>

            <div className="discovery-grid">
                {filtered.map(name => (
                    <div key={name} className="company-card">
                        <div className="card-top"><h4>{name}</h4><Truck size={18} color="#3b82f6" /></div>
                        <p className="company-text">Authorized Cargo Handler</p>
                        <p className="text-sm text-muted">Active routes: {type === 'international' ? 'Global' : 'PAN India'}</p>
                        <button className="btn-reveal" style={{ marginTop: '1rem' }} onClick={() => alert(`${name} flight schedule lookup...`)}>View Schedules</button>
                    </div>
                ))}
            </div>
        </div>
    );
}


function GlobalSearchView({ userData, user, refreshUserData, state, setState }) {
    const { contacts, selectedLead, industry, country, productKeyword, companyName, companySize, limit, loading } = state;
    const [meta, setMeta] = useState({ countries: [], industries: [] });

    const updateState = (key, value) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        discoveryApi.getMeta().then(res => {
            if (res.data.success) {
                setMeta(res.data.data);
            }
        });
    }, []);

    const handleSearch = async () => {
        if ((userData?.points_balance || 0) < limit) {
            alert(`Insufficient points. You need ${limit} points to perform this discovery search.`);
            return;
        }
        if (!window.confirm(`Perform procurement discovery search? This will deduct ${limit} points.`)) return;

        setState(prev => ({ ...prev, loading: true }));
        try {
            const res = await discoveryApi.search(industry, country, productKeyword, companySize, limit, companyName);
            setState(prev => ({ ...prev, contacts: res.data.data || [] }));
            if (refreshUserData) await refreshUserData();
        } catch (e) {
            alert("Search failed: " + (e.response?.data?.message || e.message));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="lead-intelligence-layout">
            {/* Sidebar Filter Rail */}
            <aside className="apollo-sidebar-rail">
                <div className="sidebar-section">
                    <h5 className="sidebar-section-title">Lead Filters</h5>
                    <div className="apollo-filter-list">
                         <div className="apollo-filter-item">
                             <label>Industry (Optional)</label>
                             <select value={industry} onChange={e => updateState('industry', e.target.value)}>
                                 <option value="">Select Industry</option>
                                 {meta.industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                             </select>
                         </div>
                         <div className="apollo-filter-item">
                             <label>Country (Optional)</label>
                             <input list="countries-list" value={country} onChange={e => updateState('country', e.target.value)} placeholder="Search country..." />
                             <datalist id="countries-list">
                                 {meta.countries.map(c => <option key={c} value={c} />)}
                             </datalist>
                         </div>
                         <div className="apollo-filter-item">
                             <label>Keywords</label>
                             <input value={productKeyword} onChange={e => updateState('productKeyword', e.target.value)} placeholder="e.g. Cotton, Sourcing" />
                         </div>
                         <div className="apollo-filter-item">
                             <label>Company</label>
                             <input value={companyName} onChange={e => updateState('companyName', e.target.value)} placeholder="e.g. EximCorp" />
                         </div>
                         <div className="apollo-filter-item">
                             <label>Limit Leads</label>
                             <select value={limit} onChange={e => updateState('limit', parseInt(e.target.value))}>
                                 {[10, 20, 50, 100].map(num => <option key={num} value={num}>{num} Leads</option>)}
                             </select>
                         </div>
                        <button className="enrich-btn-primary" onClick={handleSearch} disabled={loading} style={{marginTop: '1rem'}}>
                            <Search size={16}/> {loading ? 'Searching...' : 'Search Leads'}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lead-intelligence-main">
                <div className="lead-table-header">
                    <div className="stats-row">
                        <span style={{fontWeight: 600}}>{contacts.length} Leads Found</span>
                    </div>
                </div>

                <div className="lead-table-container">
                    <table className="lead-data-table">
                        <thead>
                            <tr>
                                <th>Name & Title</th>
                                <th>Company</th>
                                <th>Industry</th>
                                <th>Contact Info</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                         {contacts.map(lead => (
                                 <tr key={lead.id} onClick={() => updateState('selectedLead', lead)}>
                                     <td>
                                         <div className="lead-name-cell">
                                             <div className="lead-avatar-sm">{lead.full_name?.charAt(0)}</div>
                                             <div>
                                                 <div className="lead-name-main">{lead.full_name}</div>
                                                 <div className="lead-title-sub">{lead.title}</div>
                                             </div>
                                         </div>
                                     </td>
                                     <td>{lead.company_name}</td>
                                     <td>{lead.industry}</td>
                                     <td>
                                         {lead.email ? (
                                             <span className="status-pill unlocked"><CheckCircle size={12} style={{marginRight: '4px'}}/> Revealed</span>
                                         ) : (
                                             <span className="status-locked"><Shield size={14}/> Locked</span>
                                         )}
                                     </td>
                                     <td>
                                         <button className="view-details-btn" onClick={() => updateState('selectedLead', lead)}>View</button>
                                     </td>
                                 </tr>
                             ))}
                        {contacts.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '4rem', color: '#64748b'}}>
                                        Use the filters to start identifying procurement leads with stronger export intent.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enrichment Drawer */}
            {selectedLead && (
                <div className="enrichment-drawer">
                    <div className="drawer-header">
                        <div>
                            <h3 style={{fontSize: '1.25rem', marginBottom: '4px'}}>{selectedLead.full_name}</h3>
                            <p style={{color: '#64748b', fontSize: '0.875rem'}}>{selectedLead.title} @ {selectedLead.company_name}</p>
                        </div>
                        <button onClick={() => updateState('selectedLead', null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><LogOut size={20} style={{transform: 'rotate(180deg)'}}/></button>
                    </div>
                    <div className="drawer-content">
                        <section className="enrich-section">
                            <h4 className="enrich-section-title">Contact Intelligence</h4>
                            {selectedLead.email ? (
                                <>
                                    <div className="enrich-data-row">
                                        <div className="enrich-label">Email</div>
                                        <div className="enrich-value">{selectedLead.email}</div>
                                    </div>
                                    <div className="enrich-data-row">
                                        <div className="enrich-label">Phone</div>
                                        <div className="enrich-value">{selectedLead.phone || 'Standard Office Line'}</div>
                                    </div>
                                    <div className="enrich-data-row">
                                        <div className="enrich-label">LinkedIn</div>
                                        <div className="enrich-value">
                                            <a href={selectedLead.linkedin} target="_blank" rel="noreferrer" style={{color: '#0046fe'}}>View Profile</a>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                                    <p style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem'}}>Direct contact intelligence is locked.</p>
                                    <button className="enrich-btn-primary" onClick={async () => {
                                        if (!window.confirm(`Reveal contact for 1 point?`)) return;
                                         try {
                                             const res = await creditsApi.reveal([selectedLead.id]);
                                             if (res.data.success) {
                                                 const revealed = res.data.data[0];
                                                 updateState('contacts', contacts.map(c => c.id === selectedLead.id ? {...c, ...revealed} : c));
                                                 updateState('selectedLead', {...selectedLead, ...revealed});
                                                 if (refreshUserData) refreshUserData();
                                                 fetchRevealed(); 
                                             }
                                         } catch(e) { alert("Failed to reveal lead."); }
                                    }}>
                                        <Unlock size={16}/> Reveal for 1 Point
                                    </button>
                                </div>
                            )}
                        </section>

                        <section className="enrich-section">
                            <h4 className="enrich-section-title">Company Insights</h4>
                            <div className="enrich-data-row">
                                <div className="enrich-label">Industry</div>
                                <div className="enrich-value">{selectedLead.industry}</div>
                            </div>
                            <div className="enrich-data-row">
                                <div className="enrich-label">Country</div>
                                <div className="enrich-value">{selectedLead.country}</div>
                            </div>
                            <div className="enrich-data-row">
                                <div className="enrich-label">Website</div>
                                <div className="enrich-value">{selectedLead.website || 'Available upon reveal'}</div>
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

function AIView({ userData }) {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        // Mock effect for message scrolling
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs]);

    const sendMsg = async () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        setLoading(true);
        try {
            // Mock AI response for now since backend endpoint is pending
            setMsgs(prev => [...prev, { role: 'user', text }, { role: 'assistant', text: `I am EximHub AI. I am currently being optimized for global trade analysis. You asked: "${text}"` }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-container">
            <div className="chat-box" ref={scrollRef}>
                {msgs.length === 0 && <p className="text-muted" style={{textAlign: 'center', marginTop: '2rem'}}>Ask EximHub AI about buyers, HS codes, sourcing strategy, or new market ideas.</p>}
                {msgs.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>
                        <div className="bubble-icon">{m.role === 'assistant' ? <Bot size={16}/> : <User size={16}/>}</div>
                        <div className="bubble-text">{m.text}</div>
                    </div>
                ))}
                {loading && <div className="chat-bubble assistant"><div className="bubble-text">Typing...</div></div>}
            </div>
            <div className="chat-input-area">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMsg()} placeholder="Example: Who imports dairy products in the Philippines?" />
                <button onClick={sendMsg} disabled={loading}><Send size={18}/></button>
            </div>
        </div>
    );
}

function LibraryView({ userData }) {
    const [purchasedBooks, setPurchasedBooks] = useState([]);
    const [revealedContacts, setRevealedContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const downloadLeads = () => {
        if (revealedContacts.length === 0) return;
        
        const headers = ["Full Name", "Title", "Email", "Phone", "LinkedIn", "Company", "Industry", "Country", "Website", "Date Unlocked"];
        const rows = revealedContacts.map(c => [
            c.full_name,
            c.title,
            c.email,
            c.phone || '',
            c.linkedin || '',
            c.company_name,
            c.company_industry || c.industry,
            c.country,
            c.website || '',
            new Date(c.revealed_at).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `unlocked_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPurchasedBook = async (book) => {
        try {
            const response = await marketplaceApi.downloadBook(book.id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${(book.title || 'eximhub_ebook').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert("Download failed. Please verify that your purchase completed successfully.");
        }
    };
    
    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const [libraryResponse, contactsResponse] = await Promise.all([
                    marketplaceApi.getLibrary(),
                    creditsApi.getMyContacts(),
                ]);

                setPurchasedBooks(libraryResponse.data.data || []);
                setRevealedContacts(contactsResponse.data.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, []);

    return (
        <div className="library-view">
             <section className="library-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3><Unlock size={18}/> Recently Unlocked Leads</h3>
                    {revealedContacts.length > 0 && <button className="btn-search-primary" onClick={downloadLeads} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Download Unlocked Leads (.csv)</button>}
                </div>
                {loading ? <p>Loading library...</p> : (
                    <div className="discovery-grid">
                        {revealedContacts.length > 0 ? revealedContacts.map(c => (
                            <div key={c.id} className="company-card revealed-active">
                                <div className="card-top"><h4>{c.full_name}</h4><CheckCircle size={18} className="text-green-500" /></div>
                                <p className="badge-small">{c.title}</p>
                                <p className="company-text"><strong>{c.company_name}</strong></p>
                                <button className="btn-reveal"><ExternalLink size={14}/> CRM Export</button>
                            </div>
                        )) : <p className="text-muted">No contacts revealed yet.</p>}
                    </div>
                )}
             </section>

             <section className="library-section" style={{marginTop: '3rem'}}>
                <h3><BookOpen size={18}/> My Digital Bookshelf</h3>
                <div className="discovery-grid">
                    {purchasedBooks.map(book => (
                        <div key={book.id} className="company-card revealed-active">
                             <div className="card-top"><h4>{book.title}</h4><CheckCircle size={18} className="text-blue-500" /></div>
                             <p className="company-desc">{book.description}</p>
                             <button
                                className="btn-reveal"
                                style={{width: 'auto', display: 'flex', gap: '8px'}}
                                onClick={() => downloadPurchasedBook(book)}
                             >
                                <ExternalLink size={14}/> Download PDF
                             </button>
                        </div>
                    ))}
                    {purchasedBooks.length === 0 && !loading && <p className="text-muted">No books in your collection yet.</p>}
                </div>
             </section>
        </div>
    );
}

function StoreView({ userData }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasingBookId, setPurchasingBookId] = useState(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await marketplaceApi.getBooks();
                setBooks(res.data.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, []);

    const downloadBookImmediately = async (book) => {
        const response = await marketplaceApi.downloadBook(book.id);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(book.title || 'eximhub_ebook').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleBuy = async (book) => {
        const confirmed = window.confirm(`Proceed to secure checkout for "${book.title}"? (Price: Rs ${book.price})`);
        if (!confirmed) return;

        setPurchasingBookId(book.id);
        try {
            const res = await paymentApi.createOrder(null, book.id);
            if (res.data.success) {
                if (res.data.simulated) {
                    // Smooth Simulated Success Flow
                    alert("Proceeding with simulated checkout for preview...");
                    setTimeout(() => {
                        window.location.href = `/dashboard?order_id=${res.data.data.order_id}&status=verify`;
                    }, 1000);
                    return;
                }
                const checkout = new window.Cashfree({ mode: "sandbox" });
                await checkout.checkout({
                    paymentSessionId: res.data.data.payment_session_id,
                    redirectTarget: "_self"
                });
            }
        } catch (e) {
            console.error('Book purchase logic failed', e);
            alert("Checkout initialization failed. Please try again later.");
        } finally {
            setPurchasingBookId(null);
        }
    };

    return (
        <div className="store-view">
             <div className="section-header-store">
                <h3>Trade Academy & Data Repository</h3>
                <p>Premium guides and specialized datasets for the modern exporter.</p>
             </div>
             {loading ? <p>Loading store...</p> : (
                 <div className="discovery-grid">
                    {books.map(book => (
                        <div key={book.id} className="company-card">
                                 <div className="card-top"><h4>{book.title}</h4><Book size={18} color="#3b82f6" /></div>
                                 <p className="company-desc">{book.description}</p>
                                 <div className="card-footer-store" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>Rs {book.price}</span>
                                    <button
                                        className="btn-search-primary"
                                        style={{ padding: '0.5rem 1rem' }}
                                        onClick={() => handleBuy(book)}
                                        disabled={purchasingBookId === book.id}
                                    >
                                        {purchasingBookId === book.id ? 'Processing...' : 'Pay Rs 499'}
                                    </button>
                                 </div>
                        </div>
                    ))}
                 </div>
             )}
        </div>
    );
}

function ProfileView({ userData, user, refreshUserData }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await authApi.changePassword(currentPassword, newPassword);
            if (res.data.success) {
                setStatus('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
            }
        } catch (e) {
            console.error('Password change failed:', e.response?.data || e.message);
            setStatus('Error: ' + (e.response?.data?.message || e.message || 'Update failed'));
        }
    };

    return (
        <div className="profile-view">
            <div className="profile-grid">
                <div className="profile-card">
                    <div className="avatar-lg">{userData?.name?.charAt(0) || 'U'}</div>
                    <h3>{userData?.name || 'Globetrotter'}</h3>
                    <p>{user.email}</p>
                    <div className="profile-stats">
                        <div className="p-stat"><span>Points Balance</span><strong>{userData?.points_balance || 0}</strong></div>
                        <div className="p-stat"><span>Tier</span><strong>{userData?.subscription_tier || 'Trial'}</strong></div>
                    </div>
                </div>

                <div className="settings-card">
                    <h3>Account Settings</h3>
                    <form className="settings-form" onSubmit={handleChangePassword}>
                        <div className="form-group-p">
                            <label>Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="form-group-p">
                            <label>New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-save-settings">Update Password</button>
                    </form>
                    {status && <p className="status-msg">{status}</p>}
                </div>
            </div>
            <Link to="/pricing" className="btn-primary-ghost" style={{width: 'auto', marginTop: '1.5rem', textDecoration: 'none', textAlign: 'center'}}>Upgrade Subscription Plan</Link>
        </div>
    );
}

function DashboardCard({ title, items, icon, tone = 'sky', onAction }) {
  return (
    <div className={`summary-card tone-${tone}`}>
      <div className="summary-card-beam"></div>
      <div className="card-header">
        {icon}
        <h4>{title}</h4>
      </div>
      <ul className="card-items">
        {items.length > 0 ? items.map((item, index) => <li key={index}>{item}</li>) : <li className="text-muted italic">No data available yet</li>}
      </ul>
      <button className="card-action" onClick={onAction}>View Full Pipeline</button>
    </div>
  );
}

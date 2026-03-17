import React, { useState, useEffect, useRef } from 'react';
import { discoveryApi, creditsApi, marketplaceApi, authApi } from './api';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Globe, Search, Book, CreditCard, TrendingUp, Cpu, User, LogOut, BarChart as BarChartIcon, MapPin, Briefcase, Unlock, Send, Bot, CheckCircle, ExternalLink, Shield, Mail, Phone, Building2 } from 'lucide-react';
import CompanyDirectory from './CompanyDirectory';

export default function UserDashboard({ user }) {
  const [userData, setUserData] = useState(user);
  const [activeView, setActiveView] = useState('Dashboard');

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

  useEffect(() => {
    setUserData(user);
    fetchBalance();
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
          <NavItem active={activeView === 'AI'} icon={<Cpu size={20}/>} label="EximHub AI" onClick={() => setActiveView('AI')} />
          <NavItem active={activeView === 'Library'} icon={<Book size={20}/>} label="My Library" onClick={() => setActiveView('Library')} />
          <NavItem active={activeView === 'Directory'} icon={<Building2 size={20}/>} label="Trade Directory" onClick={() => setActiveView('Directory')} />
          <NavItem active={activeView === 'Store'} icon={<CreditCard size={20}/>} label="Digital Store" onClick={() => setActiveView('Store')} />
          <div className="sidebar-divider"></div>
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
            {activeView === 'Search' && <GlobalSearchView userData={userData} user={user} refreshUserData={refreshUserData} />}
            {activeView === 'AI' && <AIView userData={userData} />}
            {activeView === 'Library' && <LibraryView userData={userData} user={user} />}
            {activeView === 'Directory' && <CompanyDirectory />}
            {activeView === 'Store' && <StoreView userData={userData} />}
            {activeView === 'Profile' && <ProfileView userData={userData} user={user} refreshUserData={refreshUserData} />}
        </div>
      </main>
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
                    items={analytics?.trendingProducts?.map(p => p.keyword) || ['Bio-Degradable Packaging', 'EV Components', 'Solar Glass']} 
                    icon={<TrendingUp size={18} className="text-blue-400" />}
                    tone="sky"
                />
                <DashboardCard 
                    title="Top Importers by Country" 
                    items={analytics?.topCountries?.map(c => `${c.country} (${c.count} Companies)`) || ['Germany', 'USA', 'India']} 
                    icon={<Globe size={18} className="text-green-400" />}
                    tone="emerald"
                />
                <DashboardCard 
                    title="High Demand Industries" 
                    items={analytics?.topIndustries?.map(i => i.keyword) || ['Food Production', 'Pharmaceuticals', 'Textiles']} 
                    icon={<BarChartIcon size={18} className="text-orange-400" />}
                    tone="amber"
                />
            </div>

            <section className="ai-cta-card">
                <div className="ai-cta-content">
                    <h3>Ask EximHub AI</h3>
                    <p>Get instant answers on who imports dairy in Philippines or how to source strategic minerals.</p>
                    <button className="btn-ai-portal" onClick={() => setActiveView('AI')}>Open AI Assistant</button>
                </div>
                <Cpu size={48} className="ai-icon-bg" />
            </section>
        </>
    );
}

function GlobalSearchView({ userData, user, refreshUserData }) {
    const [contacts, setContacts] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [industry, setIndustry] = useState('Food Production');
    const [country, setCountry] = useState('Germany');
    const [productKeyword, setProductKeyword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companySize, setCompanySize] = useState('');
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);

    const industries = ["Manufacturing", "Food Production", "Pharmaceuticals", "Automotive", "Textiles", "Electronics", "Agriculture", "Logistics", "Construction", "Energy"];
    const countries = ["Germany", "India", "USA", "Vietnam", "Brazil"];

    const handleSearch = async () => {
        if ((userData?.points_balance || 0) < limit) {
            alert(`Insufficient points. You need ${limit} points to perform this discovery search.`);
            return;
        }
        if (!window.confirm(`Perform procurement discovery search? This will deduct ${limit} points.`)) return;

        setLoading(true);
        try {
            const res = await discoveryApi.search(industry, country, productKeyword, companySize, limit, companyName);
            setContacts(res.data.data || []);
            if (refreshUserData) await refreshUserData();
        } catch (e) {
            alert("Search failed: " + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
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
                            <label>Industry</label>
                            <select value={industry} onChange={e => setIndustry(e.target.value)}>
                                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                            </select>
                        </div>
                        <div className="apollo-filter-item">
                            <label>Country</label>
                            <select value={country} onChange={e => setCountry(e.target.value)}>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="apollo-filter-item">
                            <label>Keywords</label>
                            <input value={productKeyword} onChange={e => setProductKeyword(e.target.value)} placeholder="e.g. Cotton, Sourcing" />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Company</label>
                            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. EximCorp" />
                        </div>
                        <div className="apollo-filter-item">
                            <label>Limit Leads</label>
                            <select value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
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
                                <tr key={lead.id} onClick={() => setSelectedLead(lead)}>
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
                                        <button className="view-details-btn" onClick={() => setSelectedLead(lead)}>View</button>
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
                        <button onClick={() => setSelectedLead(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><LogOut size={20} style={{transform: 'rotate(180deg)'}}/></button>
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
                                                setContacts(prev => prev.map(c => c.id === selectedLead.id ? {...c, ...revealed} : c));
                                                setSelectedLead({...selectedLead, ...revealed});
                                                if (refreshUserData) refreshUserData();
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
                <h3><Unlock size={18}/> Recently Unlocked Leads</h3>
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
        const confirmed = window.confirm(`Proceed with payment of Rs ${book.price} for "${book.title}"?`);
        if (!confirmed) return;

        setPurchasingBookId(book.id);
        try {
            const purchaseResponse = await marketplaceApi.buyBook(book.id, `LOCALPAY-${Date.now()}`);
            if (purchaseResponse.data.success) {
                const downloadNow = window.confirm("Payment successful. Would you like to download the PDF now?");
                if (downloadNow) {
                    await downloadBookImmediately(book);
                } else {
                    alert("Book purchased successfully. You can download it any time from My Library.");
                }
            }
        } catch (e) {
            alert("Purchase failed.");
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

function DashboardCard({ title, items, icon, tone = 'sky' }) {
  return (
    <div className={`summary-card tone-${tone}`}>
      <div className="summary-card-beam"></div>
      <div className="card-header">
        {icon}
        <h4>{title}</h4>
      </div>
      <ul className="card-items">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
      <button className="card-action">View Full Pipeline</button>
    </div>
  );
}

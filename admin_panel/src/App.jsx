import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  Building,
  Upload,
  LogOut,
  CheckCircle,
  Edit3,
  Trash2,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('exim_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('exim_token');
    const savedUser = localStorage.getItem('exim_admin_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) {
    return <AdminLogin />;
  }

  const handleLogout = () => {
    localStorage.removeItem('exim_token');
    localStorage.removeItem('exim_admin_user');
    setUser(null);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          EximHub
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-sidebar-note">
          Use this space to manage importer health, company records, and customer-facing search data.
        </div>
        <nav className="admin-nav">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavItem icon={<Building size={20} />} label="Companies" active={activeTab === 'Companies'} onClick={() => setActiveTab('Companies')} />
          <NavItem icon={<Users size={20} />} label="Contacts" active={activeTab === 'Contacts'} onClick={() => setActiveTab('Contacts')} />
          <NavItem icon={<Upload size={20} />} label="Bulk Ingestion" active={activeTab === 'Upload'} onClick={() => setActiveTab('Upload')} />
        </nav>
        <button className="admin-logout" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2>{activeTab}</h2>
            <p className="admin-header-copy">Connected to {API_BASE}</p>
          </div>
          <div className="admin-user-info">
            <span>{user.email}</span>
            <div className="admin-avatar">{(user.name || 'A').charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab === 'Companies' && <CompaniesTab />}
          {activeTab === 'Contacts' && <ContactsTab />}
          {activeTab === 'Upload' && <UploadTab />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div className={`admin-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalContacts: 0,
    topCountries: [],
    topIndustries: [],
  });

  useEffect(() => {
    api.get('/discovery/analytics').then((response) => {
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalCompanies: data.topCountries?.reduce((sum, item) => sum + Number(item.count || 0), 0) || 0,
          totalContacts: data.topIndustries?.reduce((sum, item) => sum + Number(item.count || 0), 0) || 0,
          topCountries: data.topCountries || [],
          topIndustries: data.topIndustries || [],
        });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="overview-shell">
      <div className="overview-grid">
        <div className="stat-card-admin">
          <h3>Country Coverage Snapshot</h3>
          <div className="stat-value">{stats.topCountries.length}</div>
          <p className="stat-trend">Top countries currently visible in search</p>
        </div>
        <div className="stat-card-admin">
          <h3>Industry Coverage Snapshot</h3>
          <div className="stat-value">{stats.topIndustries.length}</div>
          <p className="stat-trend">Most active categories currently indexed</p>
        </div>
        <div className="stat-card-admin">
          <h3>Admin Import Status</h3>
          <div className="stat-inline">
            <ShieldCheck size={18} />
            <span>Real importer active</span>
          </div>
          <p className="stat-trend">Bulk upload uses the same path as the CLI importer</p>
        </div>
      </div>

      <div className="overview-panels">
        <div className="overview-panel">
          <h3>Top Countries</h3>
          <ul className="overview-list">
            {stats.topCountries.length > 0 ? stats.topCountries.map((item) => (
              <li key={item.country}>
                <span>{item.country}</span>
                <strong>{item.count}</strong>
              </li>
            )) : <li><span>No data yet</span></li>}
          </ul>
        </div>
        <div className="overview-panel">
          <h3>Top Industries</h3>
          <ul className="overview-list">
            {stats.topIndustries.length > 0 ? stats.topIndustries.map((item) => (
              <li key={item.keyword}>
                <span>{item.keyword}</span>
                <strong>{item.count}</strong>
              </li>
            )) : <li><span>No data yet</span></li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CompaniesTab() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/admin/companies').then((response) => setCompanies(response.data.data || [])).catch(() => {});
  }, []);

  return (
    <div className="admin-table-container">
      <div className="table-header-actions">
        <div className="search-box-admin"><Search size={16} /><input placeholder="Filter companies..." /></div>
        <button className="btn-add-manual">Read only snapshot</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Industry</th>
            <th>Country</th>
            <th>Website</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.id}</td>
              <td className="font-bold">{company.company_name}</td>
              <td>{company.industry}</td>
              <td>{company.country}</td>
              <td><a href={company.website} target="_blank" rel="noreferrer">{company.website || 'N/A'}</a></td>
              <td>
                <button className="btn-icon"><Edit3 size={14} /></button>
                <button className="btn-icon text-red-500"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContactsTab() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    api.get('/admin/contacts').then((response) => setContacts(response.data.data || [])).catch(() => {});
  }, []);

  return (
    <div className="admin-table-container">
      <div className="table-header-actions">
        <div className="search-box-admin"><Search size={16} /><input placeholder="Filter contacts..." /></div>
        <button className="btn-add-manual">Read only snapshot</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Title</th>
            <th>Procurement?</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.id}</td>
              <td className="font-bold">{contact.full_name}</td>
              <td>{contact.title}</td>
              <td>{contact.is_procurement ? <span className="badge-procure">Yes</span> : <span className="badge-normal">No</span>}</td>
              <td>{contact.email || 'N/A'}</td>
              <td>
                <button className="btn-icon"><Edit3 size={14} /></button>
                <button className="btn-icon text-red-500"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UploadTab() {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('contacts');
  const [dryRun, setDryRun] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState(null);

  const resetState = () => {
    setStatus('idle');
    setMessage('');
    setSummary(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Uploading and processing CSV...');
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);
    if (importType === 'market-intelligence') {
      formData.append('dryRun', String(dryRun));
    }

    try {
      const endpoint = importType === 'contacts'
        ? '/admin/upload/contacts'
        : '/admin/upload/market-intelligence';

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setSummary(response.data.data || null);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Upload failed. Verify CSV format, file size, and admin access.');
    }
  };

  return (
    <div className="upload-shell">
      <div className="upload-container">
        <div className="upload-dropzone">
          <div className="upload-icon-frame">
            <FileSpreadsheet size={44} className="text-blue-500" />
          </div>
          <h3>{importType === 'contacts' ? 'Customer Search Data Import' : 'Market Intelligence Incremental Import'}</h3>
          <p>
            {importType === 'contacts'
              ? 'Upload a contacts CSV and EximHub will deduplicate companies and contacts before indexing them for search.'
              : 'Upload a market-intelligence master CSV and EximHub will upsert rows by hash for safe incremental updates.'}
          </p>

          <div className="field" style={{ width: '100%', marginBottom: '0.75rem' }}>
            <label>Import Type</label>
            <select value={importType} onChange={(event) => { setImportType(event.target.value); resetState(); }}>
              <option value="contacts">Contacts</option>
              <option value="market-intelligence">Market Intelligence</option>
            </select>
          </div>

          {importType === 'market-intelligence' && (
            <div className="field" style={{ width: '100%', marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(event) => { setDryRun(event.target.checked); resetState(); }}
                />
                Dry run only (validate rows, no DB write)
              </label>
            </div>
          )}

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              setFile(event.target.files[0] || null);
              resetState();
            }}
            className="file-input"
          />
          {file && (
            <div className="upload-file-meta">
              <span>{file.name}</span>
              <strong>{(file.size / 1024 / 1024).toFixed(2)} MB</strong>
            </div>
          )}
        </div>

        <div className="upload-info">
          <h4>What happens during import</h4>
          {importType === 'contacts' ? (
            <ul>
              <li><CheckCircle size={14} color="#10b981" /> Companies are deduplicated before insert.</li>
              <li><CheckCircle size={14} color="#10b981" /> Contacts are deduplicated by email, LinkedIn, or fallback identity match.</li>
              <li><CheckCircle size={14} color="#10b981" /> Procurement-style titles are auto-detected for customer discovery search.</li>
              <li><CheckCircle size={14} color="#10b981" /> Re-uploading the same CSV is safe and should mostly skip duplicates.</li>
            </ul>
          ) : (
            <ul>
              <li><CheckCircle size={14} color="#10b981" /> Rows are upserted by `eximhub_row_hash` for incremental imports.</li>
              <li><CheckCircle size={14} color="#10b981" /> Existing records update in place when hashes match.</li>
              <li><CheckCircle size={14} color="#10b981" /> New rows are added without touching existing contact data.</li>
              <li><CheckCircle size={14} color="#10b981" /> Dry run validates CSV quality before heavy writes.</li>
            </ul>
          )}

          <button className="btn-upload-primary" onClick={handleUpload} disabled={!file || status === 'uploading'}>
            {status === 'uploading'
              ? <><Loader2 size={16} className="spin" /> Processing import...</>
              : importType === 'contacts'
                ? 'Start Contacts Import'
                : dryRun ? 'Run Market Intelligence Dry Run' : 'Start Market Intelligence Import'}
          </button>

          {message && (
            <div className={`upload-status ${status}`}>
              {status === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <div className="import-summary-card">
          <h3>Import Summary</h3>
          {importType === 'contacts' ? (
            <div className="import-summary-grid">
              <SummaryItem label="Rows Read" value={summary.rowsRead} />
              <SummaryItem label="Contacts Inserted" value={summary.contactsInserted} />
              <SummaryItem label="Contacts Skipped" value={summary.contactsSkipped} />
              <SummaryItem label="New Companies" value={summary.companiesCreated} />
              <SummaryItem label="Reused Companies" value={summary.companiesReused} />
              <SummaryItem label="Procurement Contacts" value={summary.procurementContacts} />
            </div>
          ) : (
            <div className="import-summary-grid">
              <SummaryItem label="Rows Read" value={summary.rowsRead} />
              <SummaryItem label="Rows Inserted" value={summary.rowsInserted} />
              <SummaryItem label="Rows Updated" value={summary.rowsUpdated} />
              <SummaryItem label="Rows Skipped" value={summary.rowsSkipped} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const tier = response.data.data.subscription_tier?.toLowerCase();
        if (tier !== 'enterprise' && tier !== 'admin') {
          setError(`Unauthorized: Admin access required (Current Tier: ${response.data.data.subscription_tier}).`);
          return;
        }
        localStorage.setItem('exim_token', response.data.data.token);
        localStorage.setItem('exim_admin_user', JSON.stringify(response.data.data));
        window.location.reload();
      }
    } catch (errorResponse) {
      setError(errorResponse.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-card">
        <h2>EximHub Admin</h2>
        <p>Secure access for operators managing customer-facing trade data.</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button type="submit" className="btn-admin-login">Authorize Access</button>
        </form>
      </div>
    </div>
  );
}

export default App;

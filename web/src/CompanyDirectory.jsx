import React, { useState, useEffect } from 'react';
import { discoveryApi } from './api';
import { Building2, Globe, Search, Filter, Briefcase, ExternalLink, MapPin } from 'lucide-react';

export default function CompanyDirectory() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Fetch all companies (for directory) - reusing discovery search with empty params
        discoveryApi.search("", "", "", "", 100).then(res => {
            // Deduplicate companies by name
            const unique = [];
            const names = new Set();
            res.data.data.forEach(item => {
                if (!names.has(item.company_name)) {
                    names.add(item.company_name);
                    unique.push(item);
                }
            });
            setCompanies(unique);
            setLoading(false);
        });
    }, []);

    const filtered = companies.filter(c => 
        c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.industry?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="directory-container">
            <header className="directory-header">
                <div className="header-info">
                    <h1>Global Company Directory</h1>
                    <p>Browse trade entities by market, vertical, and fit before you spend credits on deeper contact discovery.</p>
                </div>
                <div className="directory-search">
                    <Search size={20} className="text-muted" />
                    <input 
                        type="text" 
                        placeholder="Filter by company name or industry..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="loading-state">Loading Trade Directory...</div>
            ) : (
                <div className="directory-grid">
                    {filtered.map((company, idx) => (
                        <div key={idx} className="directory-card">
                            <div className="company-icon-box">
                                <Building2 size={24} className="text-blue-500" />
                            </div>
                            <div className="company-info">
                                <h3>{company.company_name}</h3>
                                <div className="company-metadata">
                                    <span><Briefcase size={14}/> {company.industry}</span>
                                    <span><MapPin size={14}/> {company.country}</span>
                                </div>
                                <p className="company-size-tag">{company.company_size || "1000+"} Employees</p>
                            </div>
                            <div className="company-actions">
                                <a href={company.website} target="_blank" rel="noreferrer" className="btn-visit">
                                    <Globe size={14}/> Website
                                </a>
                                <button className="btn-view-leads">Review Lead Potential</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

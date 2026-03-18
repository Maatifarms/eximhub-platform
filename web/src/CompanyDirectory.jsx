import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryApi } from './api';
import { Building2, Globe, Search, Briefcase, MapPin, Users } from 'lucide-react';

export default function CompanyDirectory() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        let cancelled = false;

        const fetchDirectory = async () => {
            setLoading(true);
            try {
                const res = await discoveryApi.getDirectory({
                    query: search,
                    page,
                    limit: 24,
                });

                if (!cancelled) {
                    setCompanies(res.data.data || []);
                    setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
                }
            } catch (error) {
                if (!cancelled) {
                    setCompanies([]);
                    setPagination({ page: 1, totalPages: 1, total: 0 });
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(fetchDirectory, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, page]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    return (
        <div className="directory-container">
            <header className="directory-header">
                <div className="header-info">
                    <h1>Global Company Directory</h1>
                    <p>Browse indexed companies, spot procurement-heavy accounts, and open a contact profile without using discovery credits.</p>
                </div>
                <div className="directory-search">
                    <Search size={20} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Filter by company, industry, or country..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.95rem' }}>
                {loading ? 'Refreshing directory...' : `${pagination.total} companies indexed`}
            </div>

            {loading ? (
                <div className="loading-state">Loading Trade Directory...</div>
            ) : (
                <>
                    <div className="directory-grid">
                        {companies.map((company) => (
                            <div key={company.id} className="directory-card">
                                <div className="company-icon-box">
                                    <Building2 size={24} className="text-blue-500" />
                                </div>
                                <div className="company-info">
                                    <h3>{company.company_name}</h3>
                                    <div className="company-metadata">
                                        <span><Briefcase size={14}/> {company.industry || 'Unknown industry'}</span>
                                        <span><MapPin size={14}/> {company.country || 'Unknown country'}</span>
                                        <span><Users size={14}/> {company.procurement_contact_count || 0} procurement contacts</span>
                                    </div>
                                    <p className="company-size-tag">{company.contact_count || 0} total contacts indexed</p>
                                </div>
                                <div className="company-actions">
                                    {company.website ? (
                                        <a href={company.website} target="_blank" rel="noreferrer" className="btn-visit">
                                            <Globe size={14}/> Website
                                        </a>
                                    ) : (
                                        <button type="button" className="btn-visit" disabled>
                                            <Globe size={14}/> No Website
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-view-leads"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Open Search Workspace
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setPage((current) => Math.max(current - 1, 1))}
                            disabled={page <= 1}
                        >
                            Previous
                        </button>
                        <span style={{ alignSelf: 'center', color: '#64748b' }}>
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages || 1))}
                            disabled={page >= (pagination.totalPages || 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

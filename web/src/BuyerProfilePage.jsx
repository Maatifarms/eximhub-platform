import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discoveryApi, creditsApi } from './api';
import { ChevronLeft, Briefcase, Mail, Phone, Linkedin, Globe, Shield, Unlock, CheckCircle } from 'lucide-react';
import './App.css';

export default function BuyerProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchLead = async () => {
            setLoading(true);
            try {
                const res = await discoveryApi.getContactById(id);
                if (!cancelled) {
                    setLead(res.data.data || null);
                }
            } catch (error) {
                if (!cancelled) {
                    setLead(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchLead();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleReveal = async () => {
        if (!window.confirm('Reveal this contact for 1 point?')) return;

        try {
            const res = await creditsApi.reveal([parseInt(id, 10)]);
            if (res.data.success) {
                const revealed = res.data.data[0] || {};
                setLead((prev) => ({ ...prev, ...revealed, is_revealed: 1 }));
            }
        } catch (e) {
            alert('Reveal failed: ' + (e.response?.data?.message || e.message));
        }
    };

    if (loading) return <div className="loading-state">Loading Profile...</div>;
    if (!lead) return <div className="p-8">Lead not found.</div>;

    const isRevealed = Boolean(Number(lead.is_revealed)) || Boolean(lead.email);

    const mask = (str) => {
        if (!str) return '********';
        if (str.length <= 4) return '****';
        return str.substring(0, 3) + '****' + str.substring(str.length - 4);
    };

    return (
        <div className="profile-page-container">
            <header className="profile-header-top">
                <button onClick={() => navigate(-1)} className="btn-back"><ChevronLeft size={20}/> Back to Search</button>
                <div className="profile-header-meta">
                    <span className="badge-exclusive">Exclusive Lead</span>
                </div>
            </header>

            <main className="profile-main-grid">
                <section className="profile-core-card">
                    <div className="profile-avatar-large">{lead.full_name?.charAt(0) || lead.company_name?.charAt(0)}</div>
                    <h1 className="company-title">{lead.company_name}</h1>
                    <p className="industry-text">{lead.company_industry || lead.industry} | {lead.company_country || lead.country}</p>

                    <div className="profile-contact-info">
                        <div className="contact-row">
                            <Briefcase className="text-blue-500" size={20}/>
                            <div>
                                <label>Decision Maker</label>
                                <h3>{isRevealed ? lead.full_name : 'Name Masked'}</h3>
                            </div>
                        </div>
                        <div className="contact-row">
                            <Shield className="text-purple-500" size={20}/>
                            <div>
                                <label>Job Title</label>
                                <h3>{lead.title}</h3>
                            </div>
                        </div>
                    </div>

                    {!isRevealed ? (
                        <button className="btn-reveal-massive" onClick={handleReveal}>
                            <Unlock size={24}/> Reveal Full Contact Info
                            <span>(Uses 1 Credit)</span>
                        </button>
                    ) : (
                        <div className="verified-status">
                            <CheckCircle size={20}/> Contact Verified & Unlocked
                        </div>
                    )}
                </section>

                <section className="profile-details-grid">
                    <div className="detail-pane">
                        <h3>Contact Details</h3>
                        <div className="locked-data-list">
                            <div className="data-item">
                                <Mail size={18}/>
                                <span>{isRevealed ? lead.email : mask(lead.email || 'email@domain.com')}</span>
                            </div>
                            <div className="data-item">
                                <Phone size={18}/>
                                <span>{isRevealed ? (lead.phone || 'No phone available') : mask(lead.phone || '9XXXXXXXXX')}</span>
                            </div>
                            <div className="data-item">
                                <Linkedin size={18}/>
                                {isRevealed && lead.linkedin ? (
                                    <a href={lead.linkedin} target="_blank" rel="noreferrer" className="link-ext">{lead.linkedin}</a>
                                ) : (
                                    <span>linkedin.com/in/******</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="detail-pane">
                        <h3>Company Intelligence</h3>
                        <div className="business-stats-grid">
                            <div className="b-stat">
                                <label>Size</label>
                                <span>{lead.company_size || 'Unknown'}</span>
                            </div>
                            <div className="b-stat">
                                <label>Website</label>
                                {lead.website ? (
                                    <a href={lead.website} target="_blank" rel="noreferrer" className="link-ext"><Globe size={14}/> Visit Website</a>
                                ) : (
                                    <span>No website listed</span>
                                )}
                            </div>
                            <div className="b-stat">
                                <label>Location</label>
                                <span>{lead.company_country || lead.country || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

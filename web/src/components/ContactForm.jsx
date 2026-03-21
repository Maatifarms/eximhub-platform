import React, { useState } from 'react';
import { Mail, PhoneCall, SendHorizontal } from 'lucide-react';
import { siteApi } from '../api';
import { primaryContact } from '../siteContent';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  interest: 'Buyer discovery',
  message: '',
};

export default function ContactForm({
  title = 'Tell us what you want to achieve',
  subtitle = 'We will help you choose the right plan, buyer search workflow, or market-intelligence setup.',
  buttonLabel = 'Send Message',
  className = '',
}) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await siteApi.submitContactInquiry(form);
      setSuccess(response.data?.message || 'Your message has been submitted successfully.');
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Unable to submit your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`contact-form-card ${className}`.trim()}>
      <div className="contact-form-header">
        <span className="support-pill">Contact EximHub</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div className="contact-inline-links">
        <a href={`mailto:${primaryContact.email}`}><Mail size={16} /> {primaryContact.email}</a>
        <a href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`}><PhoneCall size={16} /> {primaryContact.phone}</a>
      </div>

      {error && <div className="form-status status-error">{error}</div>}
      {success && <div className="form-status status-success">{success}</div>}

      <form onSubmit={handleSubmit} className="contact-form-grid">
        <div className="input-group">
          <label>Name</label>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={handleChange('email')} required />
        </div>
        <div className="input-group">
          <label>Phone</label>
          <input type="text" value={form.phone} onChange={handleChange('phone')} placeholder="e.g. +91 98765 43210" />
        </div>
        <div className="input-group">
          <label>Company Name</label>
          <input type="text" value={form.companyName} onChange={handleChange('companyName')} placeholder="Your company" />
        </div>
        <div className="input-group">
          <label>Interest</label>
          <select value={form.interest} onChange={handleChange('interest')}>
            <option>Buyer discovery</option>
            <option>Market intelligence</option>
            <option>Data subscription</option>
            <option>Enterprise access</option>
            <option>Partnership</option>
          </select>
        </div>
        <div className="input-group input-group-full">
          <label>Message</label>
          <textarea
            rows="5"
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Tell us which products, countries, or buyers you want to target."
            required
          />
        </div>
        <button type="submit" className="btn-primary contact-submit" disabled={loading}>
          <SendHorizontal size={18} />
          {loading ? 'Sending...' : buttonLabel}
        </button>
      </form>
    </div>
  );
}

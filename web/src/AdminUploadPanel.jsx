import React, { useState } from 'react';
import { adminApi } from './api';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Note: adminApi should be added to api.js if missing
const mockAdminApi = {
    uploadContacts: (formData) => adminApi.uploadContacts(formData),
};

export default function AdminUploadPanel() {
    const [status, setStatus] = useState('idle'); 
    const [log, setLog] = useState([]);
    const [dataType, setDataType] = useState('contacts'); 

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus('uploading');
        setLog(["Starting ingestion process...", `Target: ${dataType}`]);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', dataType);

        try {
            // Using the real API we implemented in Phase 3
            const res = await adminApi.uploadContacts(formData);
            if (res.data.success) {
                setLog(prev => [...prev, res.data.message, "Deduplication and Normalization applied."]);
                setStatus('success');
            }
        } catch (e) {
            console.error(e);
            setLog(prev => [...prev, `Error: ${e.response?.data?.message || e.message}`]);
            setStatus('error');
        }
    };

    return (
        <div className="admin-upload-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="panel-header" style={{ marginBottom: '2rem' }}>
                <h2>Master Data Ingestion</h2>
                <p className="text-muted">Upload CSV or Excel files to bulk-populate the Master Database.</p>
            </div>

            <div className="upload-controls" style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div className="type-selector" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Target Collection</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            className={`btn-toggle ${dataType === 'contacts' ? 'active' : ''}`}
                            onClick={() => setDataType('contacts')}
                        >Contacts</button>
                    </div>
                </div>

                <div className="drop-zone" style={{ border: '2px dashed #475569', borderRadius: '12px', padding: '3rem', textAlign: 'center', transition: 'all 0.2s' }}>
                    <Upload size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#fff', fontSize: '1.1rem' }}>Drag & Drop your {dataType} CSV here</p>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Supporting .csv up to 50MB</p>
                    <input type="file" onChange={handleFileUpload} style={{ marginTop: '1.5rem' }} />
                </div>
            </div>

            <div className="ingestion-log" style={{ marginTop: '2rem', backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Process Log</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {log.map((line, i) => (
                        <div key={i} style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.4rem', fontFamily: 'monospace' }}>
                            <span style={{ color: '#3b82f6' }}>»</span> {line}
                        </div>
                    ))}
                    {status === 'uploading' && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', marginTop: '1rem' }}><Loader2 className="animate-spin" size={16}/> Processing batch...</div>}
                </div>
            </div>
        </div>
    );
}

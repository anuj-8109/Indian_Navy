import React, { useState } from 'react';
import IDCard from './IDCard';
import { User, ShieldAlert, Award, FileText, ClipboardList } from 'lucide-react';

export default function VisitorModal({ visitor, onClose }) {
  const [activeTab, setActiveTab] = useState('dossier'); // dossier | badge

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Media': return 'badge-media';
      case 'Politician': return 'badge-politician';
      case 'Government Officer': return 'badge-officer';
      default: return 'badge-normal';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={22} />
            <h3>Visitor Verification Dossier</h3>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Tab Selection */}
        <div className="modal-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <button
            onClick={() => setActiveTab('dossier')}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'dossier' ? '3px solid var(--accent-gold)' : 'none',
              color: activeTab === 'dossier' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ClipboardList size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Security Dossier
          </button>
          <button
            onClick={() => setActiveTab('badge')}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'badge' ? '3px solid var(--accent-gold)' : 'none',
              color: activeTab === 'badge' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Award size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Gate Pass Badge
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'dossier' ? (
            <div className="detail-grid">
              
              {/* Photo Area */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={visitor.photoUrl ? `http://localhost:5000${visitor.photoUrl}` : 'https://placehold.co/140x180/112240/ffffff?text=Photo'}
                  alt={visitor.fullName}
                  className="detail-photo"
                />
                <div style={{ marginTop: '1rem' }}>
                  <span className={`badge ${getRoleBadgeClass(visitor.role)}`}>
                    {visitor.role}
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="detail-info">
                <div className="detail-item">
                  <span className="detail-label">Pass Number</span>
                  <span className="detail-val" style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {visitor.passNo}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-val">{visitor.fullName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-val">{formatDate(visitor.dob)}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Gender</span>
                  <span className="detail-val">{visitor.gender}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Nationality</span>
                  <span className="detail-val">{visitor.nationality}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Aadhaar (Secure)</span>
                  <span className="detail-val" style={{ fontWeight: 600, color: 'var(--success)' }}>
                    XXXX-XXXX-{visitor.aadhaarNumber ? visitor.aadhaarNumber.slice(-4) : 'XXXX'} (Verified)
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-val">{visitor.phone}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-val">{visitor.email || 'N/A'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Blood Group</span>
                  <span className="detail-val">{visitor.bg || 'N/A'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Identification Mark</span>
                  <span className="detail-val">{visitor.identificationMark || 'None'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Report Date / Time</span>
                  <span className="detail-val">{formatDate(visitor.dor)} at {visitor.tor}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Pass Expiry Date</span>
                  <span className="detail-val" style={{ color: 'var(--danger)', fontWeight: 600 }}>
                    {formatDate(visitor.validityDate)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Skill Set</span>
                  <span className="detail-val">{visitor.skillSet || 'None declared'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Declared Valuables</span>
                  <span className="detail-val">{visitor.valuables || 'None'}</span>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Next of Kin (NOK)</span>
                  <span className="detail-val">
                    {visitor.nokName ? `${visitor.nokName} (${visitor.nokRelation}) - Phone: ${visitor.nokPhone || 'N/A'}` : 'None declared'}
                  </span>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Permanent / Local Address</span>
                  <span className="detail-val" style={{ whiteSpace: 'pre-wrap' }}>{visitor.address || 'N/A'}</span>
                </div>
              </div>

            </div>
          ) : (
            <IDCard visitor={visitor} />
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close Dossier</button>
        </div>
      </div>
    </div>
  );
}

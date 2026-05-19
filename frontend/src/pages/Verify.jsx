import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Verify({ passNoParam }) {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPass = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch public verification info using URL-safe pass parameter
        const response = await fetch(`http://localhost:5000/api/visitors/pass/${passNoParam}`);
        const data = await response.json();
        
        if (data.success) {
          setVisitor(data.visitor);
        } else {
          setError(data.message || 'Pass verification failed. Invalid gate pass.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error. Unable to contact Navy verification servers.');
      } finally {
        setLoading(false);
      }
    };

    if (passNoParam) {
      verifyPass();
    }
  }, [passNoParam]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '400px' }}>
          <div style={{ color: 'var(--accent-gold)' }}>Contacting Security Server...</div>
        </div>
      </div>
    );
  }

  const isPassValid = visitor && new Date(visitor.validityDate) >= new Date();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div className="navy-crest-logo" style={{ 
          borderColor: error ? 'var(--danger)' : isPassValid ? 'var(--success)' : 'var(--danger)',
          color: error ? 'var(--danger)' : isPassValid ? 'var(--success)' : 'var(--danger)',
          background: error ? 'rgba(239,68,68,0.1)' : isPassValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        }}>
          {error ? <ShieldAlert size={48} /> : isPassValid ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
        </div>

        {error ? (
          <>
            <h2 style={{ color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.05em' }}>VERIFICATION FAILED</h2>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Invalid Gate Pass Credentials</p>
            <div className="auth-error" style={{ textAlign: 'center' }}>{error}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2rem' }}>
              INDIAN NAVY GATE SECURITY PORTAL
            </div>
          </>
        ) : (
          <>
            <h2 style={{ 
              color: isPassValid ? 'var(--success)' : 'var(--danger)', 
              fontWeight: 700, 
              letterSpacing: '0.05em' 
            }}>
              {isPassValid ? 'ACCESS APPROVED' : 'ACCESS DENIED'}
            </h2>
            <p style={{ marginTop: '0.25rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              {isPassValid ? 'Active Navy Pass Verified' : 'Pass Expired / Suspended'}
            </p>

            {/* Visitor Details Card */}
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: `1px solid ${isPassValid ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '0.5rem', 
              padding: '1.25rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
                <img
                  src={visitor.photoUrl ? `http://localhost:5000${visitor.photoUrl}` : 'https://placehold.co/100x120/112240/ffffff?text=Photo'}
                  alt={visitor.fullName}
                  style={{ width: '85px', height: '110px', objectFit: 'cover', borderRadius: '0.35rem', border: '1px solid var(--border-color)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {visitor.fullName}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--accent-blue)', marginTop: '0.2rem', fontWeight: 600 }}>
                    {visitor.passNo}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={`badge ${
                      visitor.role === 'Media' ? 'badge-media' : 
                      visitor.role === 'Politician' ? 'badge-politician' : 
                      visitor.role === 'Government Officer' ? 'badge-officer' : 'badge-normal'
                    }`} style={{ fontSize: '0.7rem' }}>
                      {visitor.role}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Nationality</div>
                  <div style={{ fontWeight: 600 }}>{visitor.nationality}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Blood Group</div>
                  <div style={{ fontWeight: 600 }}>{visitor.bg || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Reporting Date</div>
                  <div style={{ fontWeight: 600 }}>{new Date(visitor.dor).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Validity Exp.</div>
                  <div style={{ fontWeight: 600, color: isPassValid ? 'var(--text-primary)' : 'var(--danger)' }}>
                    {new Date(visitor.validityDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Shield size={12} />
              <span>SECURE GATE VERIFICATION SYSTEM</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

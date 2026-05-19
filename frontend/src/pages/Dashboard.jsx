import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Users, ShieldAlert, Award, Radio, Activity, Eye } from 'lucide-react';

export default function Dashboard({ onNavigate, onViewVisitor }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const visitorsData = await apiFetch('/visitors');
        
        if (visitorsData.success) setVisitors(visitorsData.visitors);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading secure dashboard data...</div>;
  }

  // Calculate statistics
  const totalVisitors = visitors.length;
  const mediaCount = visitors.filter(v => v.role === 'Media').length;
  const politicianCount = visitors.filter(v => v.role === 'Politician').length;
  const officerCount = visitors.filter(v => v.role === 'Government Officer').length;
  const normalCount = visitors.filter(v => v.role === 'Normal Visitor').length;

  // Active passes count
  const activeCount = visitors.filter(v => {
    return new Date(v.validityDate) >= new Date();
  }).length;

  const recentVisitors = visitors.slice(0, 5);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Media': return 'badge-media';
      case 'Politician': return 'badge-politician';
      case 'Government Officer': return 'badge-officer';
      default: return 'badge-normal';
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {error && <div className="auth-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-value">{totalVisitors}</div>
          <div className="stat-label">TOTAL VISITORS</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">ACTIVE PASSES</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <Radio size={24} />
          </div>
          <div className="stat-value">{mediaCount}</div>
          <div className="stat-label">MEDIA CREW</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="stat-value">{officerCount}</div>
          <div className="stat-label">GOVT OFFICERS</div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {/* Recent Visitors Table (Full Width) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Checked-In Visitors</h3>
            <button onClick={() => onNavigate('#/visitors')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              View All
            </button>
          </div>

          <div className="table-container">
            {recentVisitors.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No visitors registered yet.
              </div>
            ) : (
              <table className="navy-table">
                <thead>
                  <tr>
                    <th>Visitor Details</th>
                    <th>Pass Number</th>
                    <th>Role</th>
                    <th>Reported Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisitors.map(visitor => (
                    <tr key={visitor.id || visitor._id}>
                      <td>
                        <div className="visitor-row-info">
                          <img
                            src={visitor.photoUrl ? `http://localhost:5000${visitor.photoUrl}` : 'https://placehold.co/100x120/112240/ffffff?text=Photo'}
                            alt={visitor.fullName}
                            className="visitor-row-photo"
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{visitor.fullName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{visitor.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{visitor.passNo}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(visitor.role)}`}>
                          {visitor.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{formatDate(visitor.dor)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{visitor.tor}</div>
                      </td>
                      <td>
                        <button
                          onClick={() => onViewVisitor(visitor)}
                          className="action-btn"
                          title="View Details & ID Card"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

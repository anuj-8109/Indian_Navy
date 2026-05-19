import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Search, AlertTriangle, RefreshCw, History } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch('/logs');
      if (data.success) {
        setLogs(data.logs);
      } else {
        setError('Failed to fetch activity logs.');
      }
    } catch (err) {
      setError('An error occurred while retrieving logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Filter logs by search term
  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      (log.adminUsername && log.adminUsername.toLowerCase().includes(term))
    );
  });

  const getActionBadgeClass = (action) => {
    const act = action ? action.toUpperCase() : '';
    if (act.includes('LOGIN')) return 'badge-officer';
    if (act.includes('DELETE')) return 'badge-media';
    if (act.includes('UPDATE') || act.includes('EDIT')) return 'badge-politician';
    if (act.includes('REGISTER') || act.includes('ADD')) return 'badge-normal';
    return 'badge-normal';
  };

  return (
    <div>
      {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Search Bar & Refresh */}
      <div className="search-filter-container-single" style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search logs by action, details, or admin username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={fetchLogs}
          className="btn btn-secondary"
          title="Refresh Audit Logs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', height: '38px' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Retrieving system audit trail records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--warning)' }} />
            No audit logs found matching the search criteria.
          </div>
        ) : (
          <table className="navy-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>System Details</th>
                <th>Performed By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id || log._id}>
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      {log.details}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-blue)' }}>
                      @{log.adminUsername}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(log.timestamp)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(log.timestamp)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

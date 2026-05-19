import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Search, Plus, Eye, Edit2, Trash2, FileSpreadsheet, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Users({ onNavigate, onEditVisitor, onViewVisitor }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [validityStatus, setValidityStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (validityStatus) params.append('validityStatus', validityStatus);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const data = await apiFetch(`/visitors?${params.toString()}`);
      if (data.success) {
        setVisitors(data.visitors);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve visitors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchVisitors();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, role, validityStatus, dateFrom, dateTo]);

  const handleDelete = async (id, name, passNo) => {
    if (window.confirm(`SECURITY PROTOCOL: Are you sure you want to permanently delete visitor ${name} (Pass: ${passNo})? This action will be audited.`)) {
      try {
        setError('');
        const data = await apiFetch(`/visitors/${id}`, {
          method: 'DELETE'
        });
        if (data.success) {
          fetchVisitors();
        }
      } catch (err) {
        setError(err.message || 'Failed to delete visitor.');
      }
    }
  };

  const exportToCSV = () => {
    if (visitors.length === 0) return;

    const headers = [
      'Pass Number', 'Full Name', 'Role', 'Validity Date', 'Phone', 'Email',
      'Gender', 'Blood Group', 'Nationality', 'Reporting Date', 'Reporting Time',
      'ID Mark', 'Skillset', 'NOK Name', 'NOK Relation', 'NOK Phone', 'Address'
    ];

    const rows = visitors.map(v => [
      v.passNo,
      v.fullName,
      v.role,
      new Date(v.validityDate).toLocaleDateString(),
      v.phone,
      v.email || 'N/A',
      v.gender,
      v.bg || 'N/A',
      v.nationality || 'Indian',
      new Date(v.dor).toLocaleDateString(),
      v.tor || '',
      v.identificationMark || 'None',
      v.skillSet || 'None',
      v.nokName || 'N/A',
      v.nokRelation || 'N/A',
      v.nokPhone || 'N/A',
      (v.address || '').replace(/"/g, '""').replace(/\n/g, ' ')
    ]);

    const csvContent = "\uFEFF" // UTF-8 BOM
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `navy_gatepass_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Media': return 'badge-media';
      case 'Politician': return 'badge-politician';
      case 'Government Officer': return 'badge-officer';
      default: return 'badge-normal';
    }
  };

  const isPassActive = (expiryDate) => {
    return new Date(expiryDate) >= new Date();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Search and Filters in Single Row */}
      <div className="search-filter-container-single">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name, Pass No, Phone, or Aadhaar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="Normal Visitor">Normal Visitor</option>
          <option value="Government Officer">Government Officer</option>
          <option value="Politician">Politician</option>
          <option value="Media">Media Crew</option>
        </select>

        <select
          className="filter-select"
          value={validityStatus}
          onChange={(e) => setValidityStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active Passes</option>
          <option value="expired">Expired Passes</option>
        </select>

        {/* <div className="date-input-field">
          <span className="date-label">DOR From:</span>
          <input
            type="date"
            className="form-control date-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div> */}

        {/* <div className="date-input-field">
          <span className="date-label">To:</span>
          <input
            type="date"
            className="form-control date-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div> */}

        <button
          onClick={exportToCSV}
          className="btn btn-secondary btn-export"
          title="Export to CSV"
          disabled={visitors.length === 0}
        >
          <FileSpreadsheet size={16} /> Export
        </button>
      </div>

      {/* Main Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Retrieving encrypted roster records...
          </div>
        ) : visitors.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--warning)' }} />
            No visitors found matching the security criteria.
          </div>
        ) : (
          <table className="navy-table">
            <thead>
              <tr>
                <th>Visitor Particulars</th>
                <th>Pass Number</th>
                <th>Classification</th>
                <th>Aadhaar Check</th>
                <th>Reporting Camp</th>
                <th>Validity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(visitor => {
                const active = isPassActive(visitor.validityDate);
                return (
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontSize: '0.88rem', fontWeight: 500 }}>
                        <ShieldCheck size={14} /> XXXX-{visitor.aadhaarNumber ? visitor.aadhaarNumber.slice(-4) : 'XXXX'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.9rem' }}>{formatDate(visitor.dor)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Time: {visitor.tor}</div>
                    </td>

                    <td>
                      <span className={`badge ${active ? 'badge-active' : 'badge-expired'}`}>
                        {active ? 'Active' : 'Expired'}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          onClick={() => onViewVisitor(visitor)}
                          className="action-btn"
                          title="View Dossier & Gate Pass"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => onEditVisitor(visitor)}
                          className="action-btn"
                          title="Edit Visitor Questionnaire"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(visitor._id || visitor.id, visitor.fullName, visitor.passNo)}
                          className="action-btn delete"
                          title="Revoke / Delete Pass"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

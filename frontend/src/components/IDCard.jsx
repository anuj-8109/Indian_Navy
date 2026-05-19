import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Printer, Shield, ShieldCheck } from 'lucide-react';

export default function IDCard({ visitor }) {
  const handleDownloadPDF = () => {
    const element = document.getElementById('id-badge-print-area');
    if (!element) return;

    html2canvas(element, {
      scale: 3, 
      useCORS: true, 
      allowTaint: true,
      backgroundColor: '#0b1a30' 
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [86, 120]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 86, 120);
      
      const fileSafeName = visitor.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      pdf.save(`gatepass_${fileSafeName}.pdf`);
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again or use the Print option.');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'Media': return 'media';
      case 'Politician': return 'politician';
      case 'Government Officer': return 'officer';
      default: return 'normal';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate a hash-based serial number for the card using the visitor ID or pass number
  const getCardSerial = () => {
    const code = visitor.passNo ? visitor.passNo.replace(/[^0-9]/g, '') : '0000';
    return `IN-SEC-${code}-V`;
  };

  return (
    <div className="id-card-stage">
      
      {/* Printable ID Badge */}
      <div id="id-badge-print-area" className="id-badge-container">
        
        {/* Navy watermark crest */}
        <div className="id-badge-watermark">
          <Shield size={180} />
        </div>

        {/* Header with Navy design elements */}
        <div className="id-badge-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            {/* SVG Nautical Anchor */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d97706' }}>
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v10M8 12h8M12 17a5 5 0 0 1-5-5M12 17a5 5 0 0 0 5-5" />
            </svg>
            <h4 style={{ margin: 0, letterSpacing: '0.08em' }}>INDIAN NAVY</h4>
          </div>
          <p>ENTRY GATE SECURITY PASS</p>
          <div className="id-badge-serial">{getCardSerial()}</div>
        </div>

        {/* CAC Smart Card Gold Chip Graphic */}
        <div className="id-badge-smart-chip" title="Security Smart Chip">
          <div className="smart-chip-line horiz"></div>
          <div className="smart-chip-line vert"></div>
          <div className="smart-chip-inner"></div>
        </div>

        {/* Photo Container */}
        <div className="id-badge-photo-wrapper">
          <img
            src={visitor.photoUrl ? `http://localhost:5000${visitor.photoUrl}` : 'https://placehold.co/110x140/112240/ffffff?text=Photo'}
            alt={visitor.fullName}
            className="id-badge-photo"
          />
        </div>

        {/* Core Info */}
        <div className="id-badge-details">
          <div className="id-badge-name">{visitor.fullName}</div>
          <div className="id-badge-pass-no">{visitor.passNo}</div>
          
          <span className={`id-badge-role-pill ${getRoleClass(visitor.role)}`}>
            {visitor.role}
          </span>

          <div className="id-badge-meta-row">
            <div className="id-badge-meta-item">
              <span className="id-badge-meta-label">REP. CAMP</span>
              <span className="id-badge-meta-value">{formatDate(visitor.dor)}</span>
            </div>
            <div className="id-badge-meta-item">
              <span className="id-badge-meta-label">REP. TIME</span>
              <span className="id-badge-meta-value">{visitor.tor}</span>
            </div>
            <div className="id-badge-meta-item">
              <span className="id-badge-meta-label">BLOOD GR.</span>
              <span className="id-badge-meta-value">{visitor.bg || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Signature lines added for realism */}
        <div className="id-badge-signatures">
          <div className="signature-box">
            <div className="signature-line-holder"></div>
            <span>Holder Signature</span>
          </div>
          <div className="signature-box officer">
            {/* Fake commanding officer signature stamp */}
            <div className="officer-stamp-signature">Cmdr. J. Dev</div>
            <div className="signature-line-officer"></div>
            <span>Issuing Authority</span>
          </div>
        </div>

        {/* Badge Footer */}
        <div className="id-badge-footer">
          {visitor.qrCode ? (
            <div className="id-badge-qr">
              <img src={visitor.qrCode} alt="Verification QR Code" />
            </div>
          ) : (
            <div className="id-badge-qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={36} style={{ color: '#d97706' }} />
            </div>
          )}
          
          <div className="id-badge-validity">
            <span className="id-badge-validity-label">VALID UNTIL</span>
            <div className="id-badge-validity-date">{formatDate(visitor.validityDate)}</div>
          </div>
        </div>
      </div>

      {/* Download and Print Controls */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={handleDownloadPDF} className="btn btn-primary">
          <Download size={16} /> Download Badge (PDF)
        </button>
        <button onClick={handlePrint} className="btn btn-secondary">
          <Printer size={16} /> Print Badge
        </button>
      </div>
    </div>
  );
}

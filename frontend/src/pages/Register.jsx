import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Camera, RefreshCw, Upload, Save, UserCheck, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Register({ editVisitor, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    validityDate: '',
    dob: '',
    dor: '',
    tor: '',
    bg: 'A+',
    gender: 'Male',
    identificationMark: '',
    skillSet: '',
    phone: '',
    email: '',
    nationality: 'Indian',
    aadhaarNumber: '',
    nokName: '',
    nokRelation: '',
    nokPhone: '',
    valuables: '',
    address: '',
    role: 'Normal Visitor'
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [capturedPhotoBase64, setCapturedPhotoBase64] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load existing details if editing
  useEffect(() => {
    if (editVisitor) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
      };

      setFormData({
        fullName: editVisitor.fullName || '',
        validityDate: formatDateForInput(editVisitor.validityDate),
        dob: formatDateForInput(editVisitor.dob),
        dor: formatDateForInput(editVisitor.dor),
        tor: editVisitor.tor || '',
        bg: editVisitor.bg || 'A+',
        gender: editVisitor.gender || 'Male',
        identificationMark: editVisitor.identificationMark || '',
        skillSet: editVisitor.skillSet || '',
        phone: editVisitor.phone || '',
        email: editVisitor.email || '',
        nationality: editVisitor.nationality || 'Indian',
        aadhaarNumber: editVisitor.aadhaarNumber || '',
        nokName: editVisitor.nokName || '',
        nokRelation: editVisitor.nokRelation || '',
        nokPhone: editVisitor.nokPhone || '',
        valuables: editVisitor.valuables || '',
        address: editVisitor.address || '',
        role: editVisitor.role || 'Normal Visitor'
      });

      if (editVisitor.photoUrl) {
        setPhotoPreview(`http://localhost:5000${editVisitor.photoUrl}`);
      }
    } else {
      // Default validity is 1 day from today
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Default reporting date is today
      const today = new Date();
      
      const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      };

      setFormData(prev => ({
        ...prev,
        validityDate: tomorrow.toISOString().split('T')[0],
        dor: today.toISOString().split('T')[0],
        tor: formatTime(today)
      }));
    }

    return () => {
      stopCamera();
    };
  }, [editVisitor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Webcam controls
  const startCamera = async () => {
    try {
      setError('');
      setIsCameraActive(true);
      setPhotoPreview('');
      setPhotoFile(null);
      setCapturedPhotoBase64('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 400, facingMode: 'user' }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError('Unable to access webcam. Please upload a photo instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 400;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoPreview(dataUrl);
      setCapturedPhotoBase64(dataUrl);
      stopCamera();
    }
  };

  // Handle standard file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      stopCamera();
      setPhotoFile(file);
      setCapturedPhotoBase64('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.phone || !formData.aadhaarNumber || !formData.dob || !formData.dor || !formData.tor) {
      setError('Please fill in all required basic fields.');
      return;
    }

    if (formData.aadhaarNumber.length !== 12 || isNaN(formData.aadhaarNumber)) {
      setError('Aadhaar number must be a 12-digit number.');
      return;
    }

    if (!editVisitor && !photoFile && !capturedPhotoBase64) {
      setError('Visitor photo is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });

      // Append photo
      if (photoFile) {
        payload.append('photo', photoFile);
      } else if (capturedPhotoBase64) {
        // Send base64 photo for backend processing
        payload.append('capturedPhoto', capturedPhotoBase64);
      }

      const endpoint = editVisitor ? `/visitors/${editVisitor._id}` : '/visitors';
      const method = editVisitor ? 'PUT' : 'POST';

      const response = await apiFetch(endpoint, {
        method,
        body: payload
      });

      if (response.success) {
        if (!editVisitor) {
          // Play green and gold confetti for registration success!
          confetti({
            particleCount: 150,
            spread: 80,
            colors: ['#0a192f', '#d97706', '#10b981']
          });
        }
        
        onSaveSuccess();
      }
    } catch (err) {
      setError(err.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <Shield size={20} style={{ color: 'var(--accent-gold)' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {editVisitor ? `Edit Details: ${editVisitor.passNo}` : 'Visitor Security Questionnaire'}
        </h3>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          {/* Photo Capture Section */}
          <div className="photo-upload-section">
            <label className="form-label">
              Visitor Security Portrait <span>*</span>
            </label>
            <div className="photo-container">
              <div className="photo-box">
                {isCameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted />
                ) : photoPreview ? (
                  <img src={photoPreview} alt="Visitor Preview" />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No Photo Loaded
                  </div>
                )}
              </div>

              <div className="camera-controls">
                {!isCameraActive ? (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={startCamera}>
                      <Camera size={16} /> Live Webcam
                    </button>
                    <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload" className="btn btn-secondary" style={{ cursor: 'pointer', width: '100%', margin: 0 }}>
                        <Upload size={16} /> Upload
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-success" onClick={capturePhoto}>
                      Capture
                    </button>
                    <button type="button" className="btn btn-danger" onClick={stopCamera}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields: Basic Details */}
          <div className="form-group">
            <label className="form-label">Full Name <span>*</span></label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="As per Identity Document"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Classification Category <span>*</span></label>
            <select name="role" className="form-control" value={formData.role} onChange={handleInputChange}>
              <option value="Normal Visitor">Normal Visitor</option>
              <option value="Government Officer">Government Officer</option>
              <option value="Politician">Politician</option>
              <option value="Media">Media Crew</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth (DOB) <span>*</span></label>
            <input
              type="date"
              name="dob"
              className="form-control"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender <span>*</span></label>
            <select name="gender" className="form-control" value={formData.gender} onChange={handleInputChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Date (DOR) <span>*</span></label>
            <input
              type="date"
              name="dor"
              className="form-control"
              value={formData.dor}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Time (TOR) <span>*</span></label>
            <input
              type="time"
              name="tor"
              className="form-control"
              value={formData.tor}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pass Validity Date <span>*</span></label>
            <input
              type="date"
              name="validityDate"
              className="form-control"
              value={formData.validityDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select name="bg" className="form-control" value={formData.bg} onChange={handleInputChange}>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Identification Mark</label>
            <input
              type="text"
              name="identificationMark"
              className="form-control"
              value={formData.identificationMark}
              onChange={handleInputChange}
              placeholder="e.g., Mole on right cheek"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skill Set</label>
            <input
              type="text"
              name="skillSet"
              className="form-control"
              value={formData.skillSet}
              onChange={handleInputChange}
              placeholder="e.g., Engineering, Electrical, IT"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number <span>*</span></label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit mobile"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., visitor@domain.com"
            />
          </div>

          {/* Form Fields: Additional Details */}
          <div className="form-group">
            <label className="form-label">Nationality <span>*</span></label>
            <input
              type="text"
              name="nationality"
              className="form-control"
              value={formData.nationality}
              onChange={handleInputChange}
              placeholder="e.g., Indian"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Aadhaar Card Number <span>*</span></label>
            <input
              type="text"
              name="aadhaarNumber"
              className="form-control"
              value={formData.aadhaarNumber}
              onChange={handleInputChange}
              placeholder="12-digit number (Encrypted)"
              maxLength={12}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next of Kin (NOK) Name</label>
            <input
              type="text"
              name="nokName"
              className="form-control"
              value={formData.nokName}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">NOK Relation</label>
            <input
              type="text"
              name="nokRelation"
              className="form-control"
              value={formData.nokRelation}
              onChange={handleInputChange}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </div>

          <div className="form-group">
            <label className="form-label">NOK Phone Number</label>
            <input
              type="tel"
              name="nokPhone"
              className="form-control"
              value={formData.nokPhone}
              onChange={handleInputChange}
              placeholder="NOK Contact"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Declared Valuables</label>
            <input
              type="text"
              name="valuables"
              className="form-control"
              value={formData.valuables}
              onChange={handleInputChange}
              placeholder="e.g., Laptop Serial 12345"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Permanent / Current Address</label>
            <textarea
              name="address"
              className="form-control"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Full address details..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          {editVisitor && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Processing...' : editVisitor ? 'Save Updates' : 'Generate Visitor Pass'}
          </button>
        </div>
      </form>
    </div>
  );
}

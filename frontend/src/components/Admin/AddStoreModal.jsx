import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AddStoreModal = ({ onClose }) => {
  const { addStore, users } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerEmail: '',
    ownerPassword: '',
    createNewOwner: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get existing store owners
  const storeOwners = users.filter(user => user.role === 'store_owner');
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Store name is required';
    } else if (formData.name.length < 20 || formData.name.length > 60) {
      newErrors.name = 'Store name must be 20-60 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters';
    }

    // Validate owner information
    if (formData.createNewOwner) {
      if (!formData.ownerEmail) {
        newErrors.ownerEmail = 'Owner email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
        newErrors.ownerEmail = 'Please enter a valid email';
      } else if (users.find(u => u.email === formData.ownerEmail)) {
        newErrors.ownerEmail = 'Email already exists';
      }

      if (!formData.ownerPassword) {
        newErrors.ownerPassword = 'Owner password is required';
      } else if (formData.ownerPassword.length < 8 || formData.ownerPassword.length > 16) {
        newErrors.ownerPassword = 'Password must be 8-16 characters';
      } else if (!/[A-Z]/.test(formData.ownerPassword)) {
        newErrors.ownerPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.ownerPassword)) {
        newErrors.ownerPassword = 'Password must contain at least one special character';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      addStore(formData, formData.createNewOwner);
      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to add store' });
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New Store</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {errors.general && (
          <div className="form-error mb-4">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter store name (20-60 characters)"
            />
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {formData.name.length}/60 characters
            </div>
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter store email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter store address (max 400 characters)"
              rows="3"
            />
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {formData.address.length}/400 characters
            </div>
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Store Owner</label>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  name="createNewOwner"
                  checked={formData.createNewOwner}
                  onChange={handleChange}
                />
                Create new store owner account
              </label>
            </div>

            {!formData.createNewOwner && storeOwners.length > 0 && (
              <select
                name="existingOwnerId"
                className="form-select"
                value={formData.existingOwnerId || ''}
                onChange={handleChange}
              >
                <option value="">Select existing store owner (optional)</option>
                {storeOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            )}

            {formData.createNewOwner && (
              <>
                <div style={{ marginTop: '10px' }}>
                  <label className="form-label">Owner Email</label>
                  <input
                    type="email"
                    name="ownerEmail"
                    className="form-input"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="Enter owner email"
                  />
                  {errors.ownerEmail && <div className="form-error">{errors.ownerEmail}</div>}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label className="form-label">Owner Password</label>
                  <input
                    type="password"
                    name="ownerPassword"
                    className="form-input"
                    value={formData.ownerPassword}
                    onChange={handleChange}
                    placeholder="Enter owner password (8-16 chars, 1 uppercase, 1 special)"
                  />
                  {errors.ownerPassword && <div className="form-error">{errors.ownerPassword}</div>}
                </div>
              </>
            )}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;

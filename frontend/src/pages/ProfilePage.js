import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const profileData = {
        name, email, phone,
        address: { street, city, state, zipCode, country },
      };
      if (password) profileData.password = password;

      await updateProfile(profileData);
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-layout">
        <div className="profile-avatar">
          <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase()}</div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
            {user?.role === 'admin' ? '⚙️ Admin' : '👤 User'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="profile-form form-card">
          {message && <Message type="success">{message}</Message>}
          {error && <Message type="error">{error}</Message>}

          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
          </div>

          <h2>Address</h2>
          <div className="form-group">
            <label>Street</label>
            <input className="form-control" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input className="form-control" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ZIP Code</label>
              <input className="form-control" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>

          <h2>Change Password</h2>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input className="form-control" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-control" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

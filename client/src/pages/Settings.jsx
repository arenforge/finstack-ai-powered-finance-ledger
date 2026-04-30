import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('light');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setCurrency(res.data.currency || 'USD');
      setTheme(res.data.theme || 'light');
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = await user.getIdToken();
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/settings`,
        { currency, theme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <header className="top-header">
          <h1>Settings</h1>
        </header>

        <section className="settings-section">
          <div className="card">
            <h2>User Profile</h2>
            <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          <form className="card" onSubmit={saveSettings} style={{ marginTop: '20px' }}>
            <h2>Preferences</h2>
            
            <div className="form-group">
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-input">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="form-input">
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            <button type="submit" className="primary-btn" disabled={saving} style={{ marginTop: '20px' }}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            {message && (
              <p style={{ marginTop: '15px', color: message.includes('Failed') ? 'red' : 'green' }}>
                {message}
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}

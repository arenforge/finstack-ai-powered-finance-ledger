import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

export default function NotFound() {
  return (
    <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh', width: '100%' }}>
      <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '4rem', margin: '0', color: 'var(--primary-color)' }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Oops! Looks like your money isn't here, and neither is this page.
        </p>
        <Link to="/dashboard" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

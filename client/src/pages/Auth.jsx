import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import '../styles/auth.css';

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (isSignup && !form.name.trim()) return setError('Name is required.');
    if (!form.email.includes('@')) return setError('Enter a valid email.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      if (isSignup) await signup(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate('/today');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      await googleLogin();
      navigate('/today');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Daily Ledger</h1>
        <p>Log money like a diary, see the shape of every day.</p>
        {isSignup && <input placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} />}
        <input placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => update('password', e.target.value)} />
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>
          <div className="button-content">
            {loading && <div className="btn-spinner" />}
            {isSignup ? 'Create Account' : 'Login'}
          </div>
        </button>
        <button className="ghost-button" type="button" onClick={google} disabled={loading}>
          <div className="button-content">
            {loading && <div className="btn-spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)' }} />}
            Continue with Google
          </div>
        </button>
        <button className="link-button" type="button" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account? Login' : 'New here? Create an account'}
        </button>
      </form>
    </main>
  );
}

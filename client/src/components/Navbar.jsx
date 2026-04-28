import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const links = [
  ['/today', 'Today'],
  ['/dashboard', 'Dashboard'],
  ['/monthly', 'Monthly'],
  ['/transactions', 'Transactions'],
  ['/goals', 'Goals'],
  ['/bills', 'Bills'],
  ['/ai', 'AI'],
  ['/shared', 'Shared']
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/') return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="brand">Daily Ledger</div>
      <div className="nav-links">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to}>{label}</NavLink>
        ))}
      </div>
      <div className="nav-user">
        <span>{user?.displayName || user?.email}</span>
        <button type="button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

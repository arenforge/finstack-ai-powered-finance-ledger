import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import QuickAddModal from './components/QuickAddModal';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import Today from './pages/Today';
import Dashboard from './pages/Dashboard';
import Monthly from './pages/Monthly';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Bills from './pages/Bills';
import AIChat from './pages/AIChat';
import SharedBudgets from './pages/SharedBudgets';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  const [quickOpen, setQuickOpen] = useState(false);
  const location = useLocation();
  const isAuth = location.pathname === '/';

  const added = () => {
    if (typeof window.financeRefresh === 'function') window.financeRefresh();
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/monthly" element={<ProtectedRoute><Monthly /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/shared" element={<ProtectedRoute><SharedBudgets /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
      {!isAuth && <button className="fab" type="button" onClick={() => setQuickOpen(true)} aria-label="Quick add">+</button>}
      <QuickAddModal open={quickOpen} onClose={() => setQuickOpen(false)} onAdded={added} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

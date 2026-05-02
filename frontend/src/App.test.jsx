import { render, screen } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

vi.mock('./hooks/useAuth.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: null, loading: false })
}));

test('renders daily ledger auth heading', () => {
  render(<App />);
  expect(screen.getByText(/daily ledger/i)).toBeInTheDocument();
});

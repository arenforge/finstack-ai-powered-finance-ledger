import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);
const demoAuthEnabled = process.env.REACT_APP_DEMO_AUTH === 'true';

function makeDemoUser(name, email) {
  return {
    uid: 'demo-user',
    displayName: name || 'Demo User',
    email: email || 'demo@local.test',
    getIdToken: async () => 'dev-token'
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!demoAuthEnabled) return null;
    const saved = localStorage.getItem('demoUser');
    return saved ? makeDemoUser(JSON.parse(saved).name, JSON.parse(saved).email) : null;
  });
  const [loading, setLoading] = useState(!demoAuthEnabled);

  useEffect(() => {
    if (demoAuthEnabled) return undefined;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signup: async (name, email, password) => {
      if (demoAuthEnabled) {
        const demoUser = makeDemoUser(name, email);
        localStorage.setItem('demoUser', JSON.stringify({ name, email }));
        setUser(demoUser);
        return { user: demoUser };
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      return result;
    },
    login: async (email, password) => {
      if (demoAuthEnabled) {
        const demoUser = makeDemoUser(email.split('@')[0], email);
        localStorage.setItem('demoUser', JSON.stringify({ name: demoUser.displayName, email }));
        setUser(demoUser);
        return { user: demoUser };
      }
      return signInWithEmailAndPassword(auth, email, password);
    },
    googleLogin: async () => {
      if (demoAuthEnabled) {
        const demoUser = makeDemoUser('Demo Google User', 'demo.google@local.test');
        localStorage.setItem('demoUser', JSON.stringify({ name: demoUser.displayName, email: demoUser.email }));
        setUser(demoUser);
        return { user: demoUser };
      }
      return signInWithPopup(auth, googleProvider);
    },
    logout: async () => {
      if (demoAuthEnabled) {
        localStorage.removeItem('demoUser');
        setUser(null);
        return;
      }
      return signOut(auth);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

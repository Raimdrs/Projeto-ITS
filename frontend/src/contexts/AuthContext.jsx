import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokens = localStorage.getItem('tokens');
    if (tokens && !user) {
      authAPI.getProfile()
        .then(res => {
          setUser(res.data.user || res.data);
          localStorage.setItem('user', JSON.stringify(res.data.user || res.data));
        })
        .catch(() => {
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const tokens = { access: res.data.access, refresh: res.data.refresh };
    localStorage.setItem('tokens', JSON.stringify(tokens));
    
    const profileRes = await authAPI.getProfile();
    const userData = profileRes.data.user || profileRes.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const tokens = res.data.tokens;
    localStorage.setItem('tokens', JSON.stringify(tokens));
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const logout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
      if (tokens.refresh) {
        await authAPI.logout(tokens.refresh);
      }
    } catch (e) { /* ignore */ }
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, loading, login, register, logout, setUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;

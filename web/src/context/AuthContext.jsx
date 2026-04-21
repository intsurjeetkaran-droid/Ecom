import { createContext, useContext, useState, useEffect } from 'react';
import { logout as logoutApi } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

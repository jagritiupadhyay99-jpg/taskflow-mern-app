import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  // Load user profile when token is active
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user context:', err);
        setError('Unable to reach server. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Register user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.msg || 'Registration failed');
        return { success: false, msg: data.msg || 'Registration failed' };
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      return { success: false, msg: 'Server connection error' };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.msg || 'Invalid email or password');
        return { success: false, msg: data.msg || 'Invalid credentials' };
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      return { success: false, msg: 'Server connection error' };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      register,
      login,
      logout,
      setError,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};

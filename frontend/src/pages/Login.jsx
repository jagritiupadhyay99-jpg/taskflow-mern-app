import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Sparkles, Layers, ListChecks, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    // Clear global errors on mount
    setError(null);
  }, [user, navigate, setError]);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      {/* Left Banner Panel */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <div className="auth-brand">
            <Sparkles className="logo-icon" size={28} />
            <span>TaskFlow</span>
          </div>
          <h1>Streamline your daily workflows, beautifully.</h1>
          <p>
            Experience a modern workspace featuring interactive boards, state-of-the-art filtering, and responsive planning tools.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <ListChecks size={20} />
              </div>
              <div className="feature-info">
                <h3>Fluid Task Operations</h3>
                <p>Add, edit, delete and toggle statuses instantly with high response speed.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Layers size={20} />
              </div>
              <div className="feature-info">
                <h3>Search & Filters</h3>
                <p>Filter by priorities, search titles, and sort based on due dates.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Shield size={20} />
              </div>
              <div className="feature-info">
                <h3>Protected & Secure</h3>
                <p>Encrypted credentials and JSON Web Token (JWT) authorized route sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-card glass-panel">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Access your workspace to resume tasks</p>
          </div>

          {(validationError || error) && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">EMAIL ADDRESS</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">PASSWORD</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-redirect">
            Don't have an account? 
            <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

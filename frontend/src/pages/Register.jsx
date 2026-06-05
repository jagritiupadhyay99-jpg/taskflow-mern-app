import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Sparkles, Layers, ListChecks, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const { register, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validations
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters long');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
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
          <h1>Join TaskFlow and orchestrate your productivity.</h1>
          <p>
            Build your personalized taskboards, assign priority metrics, keep track of due times, and structure your daily routine effortlessly.
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

      {/* Right Register Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-card glass-panel">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Sign up now to begin managing your workflow</p>
          </div>

          {(validationError || error) && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">FULL NAME</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat password"
                value={confirmPassword}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-redirect">
            Already have an account? 
            <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data, res.data.token);
      toast.success(`Welcome to SnapLink, ${res.data.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 :
    form.password.length < 6 ? 1 :
    form.password.length < 10 ? 2 : 3;

  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          SnapLink
        </div>

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Start shortening and tracking your links</p>

        {errors.submit && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.875rem',
            marginBottom: 16
          }}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} id="signup-form">
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className={`form-input${errors.name ? ' error' : ''}`}
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
                onClick={() => setShowPassword(s => !s)}
                id="toggle-signup-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength ? strengthColors[strength] : 'var(--border-subtle)',
                    transition: 'background 0.3s'
                  }} />
                ))}
                <span style={{ fontSize: '0.75rem', color: strengthColors[strength], marginLeft: 4 }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link" id="goto-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

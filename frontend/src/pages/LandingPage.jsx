import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createUrl } from '../api/urls';
import { login as loginApi } from '../api/auth';
import toast from 'react-hot-toast';
import { Link2, Zap, Shield, BarChart3, ArrowRight, Copy, Check } from 'lucide-react';
const isValidUrl = (str) => {
  try { new URL(str); return true; } catch { return false; }
};

function StatBadge({ icon, value, label }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 20px',
      textAlign: 'center',
      minWidth: 100
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{icon} {label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    if (!longUrl.trim()) { setError('Please enter a URL'); return; }
    if (!isValidUrl(longUrl)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (!user) {
      toast('Please sign in to shorten URLs', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await createUrl({ originalUrl: longUrl });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { icon: <Zap size={22} />, title: 'Instant Shortening', desc: 'Shorten any URL in milliseconds with our blazing-fast API.' },
    { icon: <BarChart3 size={22} />, title: 'Deep Analytics', desc: 'Track clicks, locations, devices, and daily trends in real time.' },
    { icon: <Shield size={22} />, title: 'Secure & Private', desc: 'Your links are protected. Set expiry dates, custom aliases, and more.' },
    { icon: <Link2 size={22} />, title: 'Custom Aliases', desc: 'Create branded short links with your own custom aliases.' },
  ];

  return (
    <div className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />

      <div className="hero-content">
        <div className="hero-eyebrow">
          <Zap size={12} /> URL Shortener + Analytics
        </div>

        <h1 className="hero-title">
          Shorten Links,<br />
          <span className="gradient-text">Track Everything</span>
        </h1>

        <p className="hero-desc">
          SnapLink turns long, ugly URLs into clean short links — then gives you
          powerful analytics to understand every click.
        </p>

        <form className="hero-form" onSubmit={handleShorten} id="hero-shorten-form">
          <input
            id="hero-url-input"
            type="url"
            className={`form-input${error ? ' error' : ''}`}
            placeholder="Paste your long URL here..."
            value={longUrl}
            onChange={e => { setLongUrl(e.target.value); setError(''); }}
          />
          <button
            id="hero-shorten-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ flexShrink: 0 }}
          >
            {loading ? <span className="spinner" /> : <><Zap size={16} /> Shorten</>}
          </button>
        </form>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
        )}

        {shortUrl && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            maxWidth: 560,
            margin: '0 auto 24px',
            animation: 'slideUp 0.3s ease'
          }}>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--accent-light)', fontWeight: 700, fontSize: '1rem', flex: 1, textAlign: 'left' }}>
              {shortUrl}
            </a>
            <button id="hero-copy-btn" className="btn btn-primary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
          <StatBadge icon="⚡" value="< 1ms" label="Redirect Speed" />
          <StatBadge icon="🔒" value="100%" label="Uptime" />
          <StatBadge icon="📊" value="Real-time" label="Analytics" />
          <StatBadge icon="🌍" value="Global" label="CDN" />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 28 }}>Everything you need</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          textAlign: 'left',
          marginBottom: 40
        }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{
                width: 44, height: 44,
                background: 'rgba(124,58,237,0.15)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-light)', marginBottom: 12
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {!user && (
          <Link to="/signup" className="btn btn-primary btn-lg" id="hero-signup-cta">
            Get Started Free <ArrowRight size={18} />
          </Link>
        )}
        {user && (
          <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-dashboard-cta">
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}

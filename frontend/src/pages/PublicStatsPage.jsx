import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicStats } from '../api/urls';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointerClick, Clock, Calendar, Globe, Copy, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function PublicStatsPage() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicStats(shortCode)
      .then(res => setData(res.data))
      .catch(() => setError('Stats not found for this link'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="main-content page-loader" style={{ paddingTop: 32 }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <p>Loading public stats...</p>
    </div>
  );

  if (error) return (
    <div className="main-content empty-state" style={{ paddingTop: 60 }}>
      <div className="empty-icon">😕</div>
      <div className="empty-title">{error}</div>
    </div>
  );

  const chartData = (() => {
    const today = new Date();
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = format(d, 'yyyy-MM-dd');
      const found = data.dailyClicks.find(c => c._id === key);
      result.push({ date: format(d, 'MMM d'), clicks: found ? found.count : 0 });
    }
    return result;
  })();

  return (
    <div className="main-content" style={{ paddingTop: 40, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 99,
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
          color: 'var(--accent-light)', fontSize: '0.8rem', fontWeight: 600,
          marginBottom: 16
        }}>
          <Globe size={12} /> Public Link Stats
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
          <a href={data.shortUrl} target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
            {data.shortUrl}
          </a>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', wordBreak: 'break-all', marginBottom: 16 }}>
          → {data.originalUrl}
        </p>
        <button className="btn btn-secondary btn-sm" onClick={handleCopy} id="public-stats-copy">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy Link'}
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon purple"><MousePointerClick size={18} /></div>
          <div className="stat-value">{data.totalClicks.toLocaleString()}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><Clock size={18} /></div>
          <div className="stat-value" style={{ fontSize: '0.9rem', paddingTop: 8 }}>
            {data.lastVisitedAt ? formatDistanceToNow(new Date(data.lastVisitedAt), { addSuffix: true }) : 'Never'}
          </div>
          <div className="stat-label">Last Visited</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Calendar size={18} /></div>
          <div className="stat-value" style={{ fontSize: '0.9rem', paddingTop: 8 }}>
            {format(new Date(data.createdAt), 'MMM d, yyyy')}
          </div>
          <div className="stat-label">Created</div>
        </div>
      </div>

      <div className="chart-wrap">
        <p className="chart-title">Daily Clicks — Last 30 Days</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1e2537', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
            <Bar dataKey="clicks" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Powered by <a href="/" style={{ color: 'var(--accent-light)' }}>SnapLink</a>
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUrlAnalytics } from '../api/urls';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowLeft, MousePointerClick, Clock, Globe, Calendar, ExternalLink, Copy, Check } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#7c3aed', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e2537', border: '1px solid var(--border-subtle)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.875rem'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getUrlAnalytics(id);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.url.shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="main-content page-loader" style={{ paddingTop: 32 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const { url, totalClicks, lastVisitedAt, recentVisits, dailyClicks, countryBreakdown } = data;

  // Fill in missing days for the chart
  const chartData = (() => {
    const today = new Date();
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = format(d, 'yyyy-MM-dd');
      const found = dailyClicks.find(c => c._id === key);
      result.push({ date: format(d, 'MMM d'), clicks: found ? found.count : 0 });
    }
    return result;
  })();

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      {/* Back */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
        onClick={() => navigate('/dashboard')}
        id="back-to-dashboard"
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* URL Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Analytics
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="analytics-short-link"
                style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-light)', textDecoration: 'none' }}
              >
                {url.shortUrl}
              </a>
              <ExternalLink size={14} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
              {url.originalUrl}
            </p>
          </div>
          <button
            id="analytics-copy-btn"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon purple"><MousePointerClick size={18} /></div>
          <div className="stat-value">{totalClicks.toLocaleString()}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><Clock size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1rem', paddingTop: 4 }}>
            {lastVisitedAt
              ? formatDistanceToNow(new Date(lastVisitedAt), { addSuffix: true })
              : 'Never'}
          </div>
          <div className="stat-label">Last Visited</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Calendar size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1rem', paddingTop: 4 }}>
            {format(new Date(url.createdAt), 'MMM d, yyyy')}
          </div>
          <div className="stat-label">Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Globe size={18} /></div>
          <div className="stat-value">{countryBreakdown.length}</div>
          <div className="stat-label">Countries</div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="chart-wrap">
        <p className="chart-title">Daily Clicks — Last 30 Days</p>
        {totalClicks === 0 ? (
          <div className="empty-state" style={{ padding: '40px 24px' }}>
            <div className="empty-icon">📊</div>
            <div className="empty-title">No clicks yet</div>
            <div className="empty-desc">Share your link to start tracking clicks</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
              <Bar dataKey="clicks" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Country Breakdown */}
        <div className="chart-wrap" style={{ margin: 0 }}>
          <p className="chart-title">Top Countries</p>
          {countryBreakdown.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-desc">No location data yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={countryBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70}>
                    {countryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#1e2537', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {countryBreakdown.slice(0, 6).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>{c._id || 'Unknown'}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Visits */}
        <div className="chart-wrap" style={{ margin: 0 }}>
          <p className="chart-title">Recent Visits</p>
          {recentVisits.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-desc">No visits recorded yet</div>
            </div>
          ) : (
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {recentVisits.slice(0, 15).map((v, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: i < recentVisits.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  gap: 12
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.country || 'Unknown'}{v.city ? `, ${v.city}` : ''}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {v.userAgent?.substring(0, 40)}...
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {formatDistanceToNow(new Date(v.visitedAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

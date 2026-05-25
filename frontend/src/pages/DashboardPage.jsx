import { useState, useEffect } from 'react';
import { getUserUrls, createUrl } from '../api/urls';
import UrlCard from '../components/UrlCard';
import toast from 'react-hot-toast';
import {
  Link2, Plus, Search, X, Clock, MousePointerClick,
  TrendingUp, Zap, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
const isValidUrl = (str) => { try { new URL(str); return true; } catch { return false; } };

export default function DashboardPage() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    originalUrl: '', alias: '', expiresAt: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await getUserUrls();
      setUrls(res.data);
    } catch {
      toast.error('Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.originalUrl) { setFormError('URL is required'); return; }
    if (!isValidUrl(form.originalUrl)) {
      setFormError('Enter a valid URL with http:// or https://');
      return;
    }

    setCreating(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.alias) payload.alias = form.alias;
      if (form.expiresAt) payload.expiresAt = form.expiresAt;

      const res = await createUrl(payload);
      setUrls(prev => [res.data, ...prev]);
      setForm({ originalUrl: '', alias: '', expiresAt: '' });
      setShowForm(false);
      setShowAdvanced(false);
      toast.success('Short URL created! 🎉');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create URL');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => setUrls(prev => prev.filter(u => u._id !== id));
  const handleUpdate = (updated) => setUrls(prev => prev.map(u => u._id === updated._id ? updated : u));

  const filtered = urls.filter(u =>
    u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    u.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);
  const activeUrls = urls.filter(u => !u.expiresAt || new Date() < new Date(u.expiresAt)).length;

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">My Links</h1>
          <p className="page-subtitle">Manage and track all your shortened URLs</p>
        </div>
        <button
          id="new-url-btn"
          className="btn btn-primary"
          onClick={() => setShowForm(f => !f)}
        >
          <Plus size={16} />
          New Short URL
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><Link2 size={18} /></div>
          <div className="stat-value">{urls.length}</div>
          <div className="stat-label">Total Links</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><TrendingUp size={18} /></div>
          <div className="stat-value">{activeUrls}</div>
          <div className="stat-label">Active Links</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><MousePointerClick size={18} /></div>
          <div className="stat-value">{totalClicks.toLocaleString()}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Zap size={18} /></div>
          <div className="stat-value">{urls.length > 0 ? Math.round(totalClicks / urls.length) : 0}</div>
          <div className="stat-label">Avg. Clicks</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, animation: 'slideUp 0.25s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Shorten a new URL</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} id="close-form-btn">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} id="create-url-form">
            <div className="form-group">
              <label className="form-label" htmlFor="create-url-input">Destination URL *</label>
              <input
                id="create-url-input"
                type="url"
                className={`form-input${formError ? ' error' : ''}`}
                placeholder="https://example.com/very-long-url..."
                value={form.originalUrl}
                onChange={e => { setForm(f => ({ ...f, originalUrl: e.target.value })); setFormError(''); }}
              />
              {formError && <span className="form-error">{formError}</span>}
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: 16 }}
              onClick={() => setShowAdvanced(s => !s)}
              id="toggle-advanced"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Advanced options
            </button>

            {showAdvanced && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="create-alias">Custom Alias (optional)</label>
                  <input
                    id="create-alias"
                    type="text"
                    className="form-input"
                    placeholder="my-brand"
                    value={form.alias}
                    onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="create-expiry">Expiry Date (optional)</label>
                  <input
                    id="create-expiry"
                    type="date"
                    className="form-input"
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}

            <button
              id="create-url-submit"
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? <span className="spinner" /> : <><Zap size={15} /> Create Short URL</>}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      {urls.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            id="search-urls"
            type="text"
            className="form-input"
            placeholder="Search URLs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
          {search && (
            <button
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => setSearch('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* URL List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <div className="empty-title">{search ? 'No results found' : 'No short URLs yet'}</div>
          <div className="empty-desc">
            {search ? 'Try a different search term' : 'Create your first shortened URL to get started'}
          </div>
          {!search && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)} id="empty-create-btn">
              <Plus size={15} /> Create Your First Link
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {search && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
          )}
          {filtered.map(url => (
            <UrlCard key={url._id} url={url} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

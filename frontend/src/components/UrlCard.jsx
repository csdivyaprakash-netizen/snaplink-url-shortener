import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUrl, updateUrl } from '../api/urls';
import QRModal from './QRModal';
import toast from 'react-hot-toast';
import {
  Copy, Check, Trash2, BarChart2, QrCode, ExternalLink,
  Clock, MousePointerClick, Edit2, X, Save, Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function UrlCard({ url, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(url.originalUrl);
  const [saving, setSaving] = useState(false);

  const shortUrl = url.shortUrl || `${import.meta.env.VITE_BASE_URL}/${url.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this short URL? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteUrl(url._id);
      toast.success('URL deleted');
      onDelete(url._id);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateUrl(url._id, { originalUrl: editUrl });
      onUpdate(res.data);
      setEditing(false);
      toast.success('URL updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);

  return (
    <>
      <div className="url-card">
        <div className="url-card-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="form-input"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  style={{ fontSize: '0.875rem', padding: '8px 12px' }}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <p className="url-original" title={url.originalUrl}>{url.originalUrl}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {isExpired && <span className="badge badge-danger"><Clock size={10} /> Expired</span>}
            {url.alias && <span className="badge badge-primary">Custom</span>}
          </div>
        </div>

        <div className="url-short">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="url-short-link"
            id={`short-link-${url._id}`}
          >
            {shortUrl}
          </a>
          <ExternalLink size={13} color="var(--text-muted)" />
        </div>

        <div className="url-card-footer">
          <div className="url-meta">
            <span className="url-meta-item">
              <MousePointerClick size={13} />
              {url.clickCount} clicks
            </span>
            <span className="url-meta-item">
              <Calendar size={13} />
              {format(new Date(url.createdAt), 'MMM d, yyyy')}
            </span>
            {url.lastVisitedAt && (
              <span className="url-meta-item">
                <Clock size={13} />
                {formatDistanceToNow(new Date(url.lastVisitedAt), { addSuffix: true })}
              </span>
            )}
            {url.expiresAt && (
              <span className="url-meta-item" style={{ color: isExpired ? 'var(--danger)' : 'var(--text-muted)' }}>
                <Clock size={13} />
                Expires {format(new Date(url.expiresAt), 'MMM d')}
              </span>
            )}
          </div>

          <div className="url-actions">
            <button
              id={`copy-btn-${url._id}`}
              className="btn btn-secondary btn-sm copy-btn"
              onClick={handleCopy}
              title="Copy short URL"
            >
              {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              id={`analytics-btn-${url._id}`}
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/analytics/${url._id}`)}
              title="View analytics"
            >
              <BarChart2 size={14} />
            </button>

            <button
              id={`qr-btn-${url._id}`}
              className="btn btn-secondary btn-sm"
              onClick={() => setShowQR(true)}
              title="QR Code"
            >
              <QrCode size={14} />
            </button>

            <button
              id={`edit-btn-${url._id}`}
              className="btn btn-secondary btn-sm"
              onClick={() => setEditing(true)}
              title="Edit URL"
            >
              <Edit2 size={14} />
            </button>

            <button
              id={`delete-btn-${url._id}`}
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete"
            >
              {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {showQR && (
        <QRModal url={shortUrl} shortCode={url.shortCode} onClose={() => setShowQR(false)} />
      )}
    </>
  );
}

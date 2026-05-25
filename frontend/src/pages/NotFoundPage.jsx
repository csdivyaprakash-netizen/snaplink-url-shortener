import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="hero" style={{ minHeight: '80vh' }}>
      <div className="hero-bg" />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          fontSize: '8rem', fontWeight: 900, lineHeight: 1,
          background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 16
        }}>404</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          The page or short link you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary" id="not-found-home">
          <Home size={16} /> Go Home
        </Link>
      </div>
    </div>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          SnapLink
        </Link>

        <div className="navbar-nav">
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <LayoutDashboard size={15} style={{ display: 'inline', marginRight: 4 }} />
                Dashboard
              </Link>
              <div className="user-badge">
                <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
              </div>
              <button
                id="logout-btn"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>
                <LogIn size={15} style={{ display: 'inline', marginRight: 4 }} />
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

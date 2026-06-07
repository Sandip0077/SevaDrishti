import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  GitBranch,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  Shield,
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/volunteers', icon: Users, label: 'Volunteers' },
    { to: '/admin/zones', icon: MapPin, label: 'Zones' },
    { to: '/admin/deployment', icon: GitBranch, label: 'Deployment' },
    { to: '/admin/shifts', icon: Calendar, label: 'Shifts' },
    { to: '/admin/incidents', icon: AlertTriangle, label: 'Incidents' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  const volunteerLinks = [
    { to: '/volunteer/portal', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/volunteer/shifts', icon: Calendar, label: 'My Shifts' },
    { to: '/volunteer/profile', icon: Users, label: 'My Profile' },
  ];

  const links = user?.role === 'VOLUNTEER' ? volunteerLinks : adminLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ marginBottom: '8px' }}>
          <Logo size="sm" />
        </div>
        <span>{user?.role === 'VOLUNTEER' ? 'Volunteer Portal' : 'Admin Console'}</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} className="link-icon" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          padding: '8px 0',
        }}>
          <div className="avatar" style={{
            background: user?.role === 'ADMIN'
              ? 'linear-gradient(135deg, #1E3A5F, #2563EB)'
              : 'linear-gradient(135deg, #F97316, #FB923C)',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neutral-800)' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} />
              {user?.role || 'Unknown'}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

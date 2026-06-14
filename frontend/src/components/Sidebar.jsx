import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, BookOpen, Calculator, BarChart3, User, LogOut, Wallet } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/concepts', icon: BookOpen, label: 'Conceitos' },
    { to: '/simulations', icon: Calculator, label: 'Simulações' },
    { to: '/reports', icon: BarChart3, label: 'Relatórios' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  const initial = user?.first_name?.[0] || user?.username?.[0] || '?';

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none'
      }} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Wallet size={28} /></div>
          <h2>FinTutor</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu Principal</div>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon"><link.icon size={20} /></span>
              {link.label}
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />

          <button className="sidebar-link" onClick={handleLogout}>
            <span className="sidebar-link-icon"><LogOut size={20} /></span>
            Sair
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initial.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
            <div className="sidebar-user-level">Estudante</div>
          </div>
        </div>
      </aside>
    </>
  );
}

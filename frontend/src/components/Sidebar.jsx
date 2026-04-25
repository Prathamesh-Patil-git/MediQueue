import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/register', label: 'Register', icon: 'person_add' },
  { path: '/scheduler', label: 'Scheduler', icon: 'calendar_month' },
  { path: '/simulation', label: 'Simulation', icon: 'model_training' },
  { path: '/comparison', label: 'Comparison', icon: 'compare_arrows' },
  { path: '/lookup', label: 'Lookup', icon: 'search' },
];

export default function Sidebar({ mobileOpen, onClose, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && <div className="mobile-overlay" onClick={onClose} />}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-text" style={{ fontSize: '20px', letterSpacing: '0.08em', fontWeight: 900 }}>
            MEDIQUEUE
          </span>
        </div>

        {/* Navigation */}
        <div className="sidebar-section">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* System Status + User */}
        <div className="sidebar-footer">
          <div style={{
            padding: '12px',
            marginBottom: '12px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.35)',
          }}>
            System Status
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0 12px 16px',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#16a34a',
              boxShadow: '0 0 6px rgba(22,163,74,0.5)',
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              All Nodes Operational
            </span>
          </div>

          {/* User Profile */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 12px 8px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0058bc, #0070eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '13px',
            }}>{user?.initials || '?'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{user?.name || 'Unknown'}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{user?.role || 'Staff'}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

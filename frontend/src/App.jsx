import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Scheduler from './pages/Scheduler';
import Simulation from './pages/Simulation';
import Comparison from './pages/Comparison';
import Lookup from './pages/Lookup';
import NotFound from './pages/NotFound';

/* ─── Protected Route wrapper ─── */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* ─── Sidebar Layout wrapper ─── */
function SidebarLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const pageMeta = {
    '/dashboard':  { title: 'Dashboard',       icon: 'dashboard' },
    '/register':   { title: 'Register Patient', icon: 'person_add' },
    '/scheduler':  { title: 'Scheduler',        icon: 'calendar_month' },
    '/simulation': { title: 'Simulation',       icon: 'model_training' },
    '/comparison': { title: 'Comparison',       icon: 'compare_arrows' },
    '/lookup':     { title: 'Patient Lookup',   icon: 'search' },
  };

  const meta = pageMeta[location.pathname] || { title: 'MediQueue', icon: 'dashboard' };
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} user={user} onLogout={logout} />
      <div className="main-content">
        {/* ─── Sticky Header ─── */}
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'none', border: '1px solid var(--color-border)',
                borderRadius: '6px', padding: '6px 8px', cursor: 'pointer',
                color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu</span>
            </button>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
              {meta.icon}
            </span>
            <span className="main-header-title">{meta.title}</span>
          </div>
          <div className="main-header-right">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)',
              padding: '4px 10px', borderRadius: '6px', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#16a34a' }}>radio_button_checked</span>
              System Active {timeStr}
            </div>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '8px', color: 'var(--color-text-muted)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
            </button>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                }}>{user.initials}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>{user.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <div className="main-body">{children}</div>
      </div>
    </div>
  );
}

/* ─── App Router ─── */
function AppRouter() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* ── Protected dashboard routes ── */}
      <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
      <Route path="/register" element={<ProtectedRoute><SidebarLayout><Register /></SidebarLayout></ProtectedRoute>} />
      <Route path="/scheduler" element={<ProtectedRoute><SidebarLayout><Scheduler /></SidebarLayout></ProtectedRoute>} />
      <Route path="/simulation" element={<ProtectedRoute><SidebarLayout><Simulation /></SidebarLayout></ProtectedRoute>} />
      <Route path="/comparison" element={<ProtectedRoute><SidebarLayout><Comparison /></SidebarLayout></ProtectedRoute>} />
      <Route path="/lookup" element={<ProtectedRoute><SidebarLayout><Lookup /></SidebarLayout></ProtectedRoute>} />

      {/* ── 404 ── */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

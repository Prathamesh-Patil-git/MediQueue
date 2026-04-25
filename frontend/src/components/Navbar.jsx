import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/register', label: 'Register', icon: '➕' },
  { path: '/scheduler', label: 'Scheduler', icon: '📅' },
  { path: '/simulation', label: 'Simulation', icon: '⚡' },
  { path: '/comparison', label: 'Compare', icon: '⚖️' },
  { path: '/lookup', label: 'Lookup', icon: '🔍' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
              }}>
              M+
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              <span style={{ color: 'var(--color-primary)' }}>Medi</span>
              <span style={{ color: 'var(--color-text)' }}>Queue</span>
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path}
                className="px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5"
                style={({ isActive }) => ({
                  background: isActive ? 'var(--color-primary-50)' : 'transparent',
                  color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  border: isActive ? '1px solid var(--color-primary-200)' : '1px solid transparent',
                })}>
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}>
              Sign In
            </NavLink>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-xl" style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade" style={{ background: 'rgba(255,255,255,0.98)' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mb-1"
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-primary-50)' : 'transparent',
                color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              })}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

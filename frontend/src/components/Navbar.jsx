import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/register', label: 'Register', icon: '➕' },
  { path: '/scheduler', label: 'Scheduler', icon: '📅' },
  { path: '/simulation', label: 'Simulation', icon: '⚡' },
  { path: '/comparison', label: 'Compare', icon: '⚖️' },
  { path: '/lookup', label: 'Lookup', icon: '🔍' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
              }}>
              M
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span style={{ color: 'var(--color-primary-light)' }}>Medi</span>
              <span style={{ color: 'var(--color-text)' }}>Queue</span>
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                style={({ isActive }) => ({
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.1))'
                    : 'transparent',
                  color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                })}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade-in"
          style={{ background: 'rgba(15, 23, 42, 0.98)' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1"
              style={({ isActive }) => ({
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
              })}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

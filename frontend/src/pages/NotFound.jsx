import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--sidebar-bg)',
      padding: '40px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        {/* Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '20px',
          background: 'rgba(0,88,188,0.12)', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#adc6ff' }}>
            explore_off
          </span>
        </div>

        {/* Error code */}
        <div style={{
          fontSize: '80px', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #adc6ff, #0058bc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: '16px',
        }}>404</div>

        <h1 style={{
          fontSize: '22px', fontWeight: 700, color: 'white',
          marginBottom: '8px',
        }}>Page Not Found</h1>

        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6, marginBottom: '32px',
        }}>
          The route you requested doesn't exist in the MediQueue system. Use the navigation below to return to a valid page.
        </p>

        {/* Navigation links */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            background: 'white', color: '#001F3F', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>home</span>
            Home
          </Link>
          <Link to="/login" style={{
            padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            background: 'rgba(255,255,255,0.06)', color: 'white', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>login</span>
            Login
          </Link>
          <Link to="/dashboard" style={{
            padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            background: 'rgba(255,255,255,0.06)', color: 'white', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

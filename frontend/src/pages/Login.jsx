import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ hospitalId: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.hospitalId.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const result = login(form.hospitalId, form.email, form.password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f2ff 0%, #f8f9fa 50%, #f0f2ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #0058bc, #0070eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,88,188,0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>local_hospital</span>
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 900, color: 'var(--color-primary)',
            letterSpacing: '0.08em', marginBottom: '4px',
          }}>MEDIQUEUE</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Health Systems Internal Portal</p>
        </div>

        {/* Form Card */}
        <div className="card" style={{
          padding: '36px 32px', boxShadow: 'var(--shadow-xl)',
          borderTop: '3px solid #0058bc',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
            Staff Authentication
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>
            Access the secure triage and queue management system.
          </p>

          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }}>error</span>
              <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600, lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Hospital ID */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: 'var(--color-text-secondary)', marginBottom: '6px',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Hospital ID</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--color-text-muted)',
                }}>apartment</span>
                <input type="text" value={form.hospitalId}
                  onChange={e => setForm({ ...form, hospitalId: e.target.value })}
                  placeholder="HOSP-001-01" className="input" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 700,
                color: 'var(--color-text-secondary)', marginBottom: '6px',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Staff Email</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--color-text-muted)',
                }}>mail</span>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="doctor@mediqueue.org" className="input" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '11px', fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--color-text-muted)',
                }}>lock</span>
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="input" style={{ paddingLeft: '40px', paddingRight: '40px' }} required />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer',
                }} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            {/* HIPAA Notice */}
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              padding: '14px 16px', borderRadius: '8px',
              background: 'var(--color-bg)', marginBottom: '24px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#0058bc', flexShrink: 0, marginTop: '1px' }}>verified_user</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2px' }}>Authorized Medical Personnel Only.</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  All access attempts are logged and monitored for compliance with HIPAA and hospital security protocols.
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary"
              style={{
                width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700,
                borderRadius: '10px', letterSpacing: '0.02em',
              }}>
              {loading ? 'Authenticating...' : 'Login'}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>}
            </button>
          </form>
        </div>

        {/* Credentials hint */}
        <div style={{
          marginTop: '20px', padding: '16px', borderRadius: '10px',
          background: 'white', border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0058bc' }}>info</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>Demo Credentials</span>
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: 2, color: 'var(--color-text-secondary)' }}>
            <div><b style={{ color: 'var(--color-text)', width: '85px', display: 'inline-block' }}>Hospital ID:</b> HOSP-001-01</div>
            <div><b style={{ color: 'var(--color-text)', width: '85px', display: 'inline-block' }}>Email:</b> doctor@mediqueue.org</div>
            <div><b style={{ color: 'var(--color-text)', width: '85px', display: 'inline-block' }}>Password:</b> admin@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

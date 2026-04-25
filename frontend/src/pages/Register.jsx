import { useState } from 'react';
import { registerPatient } from '../api/api';

const urgencyOptions = ['Critical', 'High', 'Medium', 'Low'];
const urgencyColors = { Critical: '#dc2626', High: '#d97706', Medium: '#2563eb', Low: '#16a34a' };

export default function Register() {
  const [form, setForm] = useState({ name: '', age: '', emergency_type: '', urgency: 'Medium' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await registerPatient({ ...form, age: parseInt(form.age, 10) });
      setResult(res.data);
      setForm({ name: '', age: '', emergency_type: '', urgency: 'Medium' });
    } catch (err) { setError(err.response?.data?.detail || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left — Form */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{
            padding: '24px 28px', borderBottom: '1px solid var(--color-border)',
            borderLeft: '4px solid #0058bc',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>Patient Admission Details</h2>
            <p style={{ fontSize: '13px', color: '#0058bc', marginTop: '4px' }}>Complete all required fields for accurate priority scoring.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Alexander Pierce" className="input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age (Years)</label>
                <input name="age" type="number" min="0" max="150" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required placeholder="24" className="input" />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Type</label>
              <input name="emergency_type" value={form.emergency_type} onChange={e => setForm({ ...form, emergency_type: e.target.value })} required placeholder="Select Primary Symptom/Condition" className="input" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Urgency Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {urgencyOptions.map(u => (
                  <button key={u} type="button" onClick={() => setForm({ ...form, urgency: u })}
                    style={{
                      padding: '14px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      background: form.urgency === u ? `${urgencyColors[u]}10` : 'var(--color-surface)',
                      border: form.urgency === u ? `2px solid ${urgencyColors[u]}` : '1px solid var(--color-border)',
                      color: form.urgency === u ? urgencyColors[u] : 'var(--color-text-muted)',
                    }}>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: urgencyColors[u], opacity: form.urgency === u ? 1 : 0.4,
                    }} />
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {loading ? 'Processing...' : 'Add to Queue'}
                {!loading && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>}
              </button>
              <button type="button" onClick={() => setForm({ name: '', age: '', emergency_type: '', urgency: 'Medium' })}
                className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '13px' }}>
                Discard Draft
              </button>
            </div>

            {error && (
              <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>{error}
              </div>
            )}
          </form>
        </div>

        {/* Right — Score + Triage Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Priority Score Card */}
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            background: result ? 'linear-gradient(135deg, #001F3F, #0a2d5e)' : 'var(--color-primary)',
            color: 'white', textAlign: 'center', padding: '28px 20px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.7 }}>
              Calculated Priority Score
            </div>
            <div style={{ fontSize: '56px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '12px' }}>
              {result ? result.patient.priority_score : '—'}
            </div>
            {result && (
              <>
                <div style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                  background: result.patient.urgency === 'Critical' ? '#dc2626' : result.patient.urgency === 'High' ? '#d97706' : '#0058bc',
                  marginBottom: '20px', letterSpacing: '0.04em',
                }}>
                  {result.patient.urgency === 'Critical' ? 'IMMEDIATE ATTENTION' : result.patient.urgency === 'High' ? 'URGENT CARE' : 'STANDARD CARE'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', opacity: 0.8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Urgency Base</span><span style={{ fontWeight: 700 }}>{result.score_breakdown.urgency_base}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Age Bonus</span><span style={{ fontWeight: 700 }}>+{result.score_breakdown.age_bonus}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Wait Bonus</span><span style={{ fontWeight: 700 }}>+{result.score_breakdown.wait_time_bonus}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Triage Guide */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0058bc' }}>info</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Triage Guide</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              Priority score accounts for age factors, reported symptoms, and current department capacity.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Aged 65+ auto-increments priority by +5',
                'Chest pain requires immediate ECG sync',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#0058bc' }}>check_circle</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Result */}
      {result && (
        <div className="card animate-fade-in" style={{ padding: '20px', borderColor: 'rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#16a34a' }}>check_circle</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>Patient registered successfully</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {result.patient.name} ({result.patient.patient_id}) — Score: {result.patient.priority_score} — Urgency: {result.patient.urgency}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

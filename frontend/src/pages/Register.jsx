import { useState } from 'react';
import { registerPatient } from '../api/api';

const urgencyOptions = ['Critical', 'High', 'Medium', 'Low'];

export default function Register() {
  const [form, setForm] = useState({ name: '', age: '', emergency_type: '', urgency: 'Medium' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await registerPatient({
        ...form,
        age: parseInt(form.age, 10),
      });
      setResult(res.data);
      setForm({ name: '', age: '', emergency_type: '', urgency: 'Medium' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  const urgencyColors = {
    Critical: 'var(--color-critical)',
    High: 'var(--color-high)',
    Medium: 'var(--color-medium)',
    Low: 'var(--color-low)',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span style={{ color: 'var(--color-primary-light)' }}>Register</span> Patient
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Add a new patient to the priority queue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Patient Name
          </label>
          <input name="name" value={form.name} onChange={handleChange} required
            placeholder="e.g. Amit Sharma"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Age
          </label>
          <input name="age" type="number" min="0" max="150" value={form.age} onChange={handleChange} required
            placeholder="e.g. 45"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Emergency Type */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Emergency Type
          </label>
          <input name="emergency_type" value={form.emergency_type} onChange={handleChange} required
            placeholder="e.g. Chest Pain, Fracture, High Fever"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Urgency Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {urgencyOptions.map((u) => (
              <button key={u} type="button"
                onClick={() => setForm({ ...form, urgency: u })}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: form.urgency === u
                    ? `${urgencyColors[u]}20`
                    : 'var(--color-bg)',
                  border: form.urgency === u
                    ? `2px solid ${urgencyColors[u]}`
                    : '1px solid var(--color-border)',
                  color: form.urgency === u
                    ? urgencyColors[u]
                    : 'var(--color-text-secondary)',
                }}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            color: 'white',
            border: 'none',
          }}>
          {loading ? 'Registering...' : '➕ Register Patient'}
        </button>

        {error && (
          <div className="p-3 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}>
            ❌ {error}
          </div>
        )}
      </form>

      {/* Result */}
      {result && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-low)' }}>
            ✅ Registration Successful
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Patient ID</span>
              <p className="font-mono font-bold mt-1" style={{ color: 'var(--color-accent)' }}>
                {result.patient.patient_id}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
              <p className="font-semibold mt-1">{result.patient.name}</p>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Urgency</span>
              <p className="font-semibold mt-1" style={{ color: urgencyColors[result.patient.urgency] }}>
                {result.patient.urgency}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Score</span>
              <p className="font-bold text-xl mt-1" style={{ color: 'var(--color-primary-light)' }}>
                {result.patient.priority_score}
              </p>
            </div>
          </div>
          {/* Score breakdown */}
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>SCORE BREAKDOWN</p>
            <div className="flex gap-6 text-sm">
              <span>Urgency Base: <b>{result.score_breakdown.urgency_base}</b></span>
              <span>Age Bonus: <b>+{result.score_breakdown.age_bonus}</b></span>
              <span>Wait Bonus: <b>+{result.score_breakdown.wait_time_bonus}</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

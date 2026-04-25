import { useState } from 'react';
import { getPatient, searchPatients, deletePatient } from '../api/api';
import UrgencyBadge from '../components/UrgencyBadge';

export default function Lookup() {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [patient, setPatient] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState('');

  const handleIdSearch = async () => {
    setError(''); setPatient(null); setDeleted('');
    if (!searchId.trim()) return;
    try {
      const res = await getPatient(searchId.trim());
      setPatient(res.data);
    } catch { setError('Patient not found'); }
  };

  const handleNameSearch = async (prefix) => {
    setSearchName(prefix);
    if (prefix.length < 2) { setSuggestions([]); return; }
    try {
      const res = await searchPatients(prefix);
      setSuggestions(res.data.results || []);
    } catch { setSuggestions([]); }
  };

  const handleSelect = (p) => {
    setPatient(p); setSuggestions([]); setSearchName(p.name); setError('');
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      setDeleted(id); setPatient(null);
    } catch { setError('Delete failed'); }
  };

  const statusColors = { waiting: 'var(--color-high)', scheduled: 'var(--color-low)', processed: 'var(--color-accent)', cancelled: 'var(--color-text-muted)' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold"><span style={{ color: 'var(--color-primary-light)' }}>Patient</span> Lookup</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Search by ID (Hash Table O(1)) or Name (Trie prefix search)</p>
      </div>

      {/* Search by ID */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>🔑 Search by Patient ID</h3>
        <div className="flex gap-3">
          <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="e.g. P-A1B2C3"
            className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            onKeyDown={e => e.key === 'Enter' && handleIdSearch()}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
          <button onClick={handleIdSearch} className="px-5 py-3 rounded-lg text-sm font-bold cursor-pointer"
            style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', color: 'white', border: 'none' }}>Search</button>
        </div>
      </div>

      {/* Search by Name */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>📝 Search by Name (Autocomplete)</h3>
        <div className="relative">
          <input value={searchName} onChange={e => handleNameSearch(e.target.value)} placeholder="Type at least 2 characters..."
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => setTimeout(() => { e.target.style.borderColor = 'var(--color-border)'; setSuggestions([]); }, 200)} />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-10"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
              {suggestions.slice(0, 8).map(p => (
                <button key={p.patient_id} onClick={() => handleSelect(p)}
                  className="w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="font-semibold">{p.name}</span>
                  <span className="flex items-center gap-2">
                    <UrgencyBadge urgency={p.urgency} />
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.patient_id}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}>❌ {error}</div>}
      {deleted && <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--color-low)' }}>✅ Patient {deleted} removed</div>}

      {/* Patient Detail Card */}
      {patient && (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{patient.name}</h3>
              <p className="font-mono text-sm mt-1" style={{ color: 'var(--color-accent)' }}>{patient.patient_id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${statusColors[patient.status]}20`, color: statusColors[patient.status] }}>{patient.status?.toUpperCase()}</span>
              <button onClick={() => handleDelete(patient.patient_id)} className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)', border: '1px solid rgba(239,68,68,0.3)' }}>🗑 Remove</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><span style={{ color: 'var(--color-text-muted)' }}>Age</span><p className="font-semibold mt-1">{patient.age}</p></div>
            <div><span style={{ color: 'var(--color-text-muted)' }}>Emergency</span><p className="font-semibold mt-1">{patient.emergency_type}</p></div>
            <div><span style={{ color: 'var(--color-text-muted)' }}>Urgency</span><div className="mt-1"><UrgencyBadge urgency={patient.urgency} /></div></div>
            <div><span style={{ color: 'var(--color-text-muted)' }}>Priority Score</span><p className="font-bold text-xl mt-1" style={{ color: 'var(--color-primary-light)' }}>{patient.priority_score}</p></div>
            <div><span style={{ color: 'var(--color-text-muted)' }}>Urgency Base</span><p className="font-semibold mt-1">{patient.urgency_base}</p></div>
            <div><span style={{ color: 'var(--color-text-muted)' }}>Age Bonus</span><p className="font-semibold mt-1">+{patient.age_bonus}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

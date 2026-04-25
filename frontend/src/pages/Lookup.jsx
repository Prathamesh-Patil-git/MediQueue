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

  const handleIdSearch = async () => { setError(''); setPatient(null); setDeleted(''); if (!searchId.trim()) return; try { const res = await getPatient(searchId.trim()); setPatient(res.data); } catch { setError('Patient not found'); } };
  const handleNameSearch = async (prefix) => { setSearchName(prefix); if (prefix.length < 2) { setSuggestions([]); return; } try { const res = await searchPatients(prefix); setSuggestions(res.data.results || []); } catch { setSuggestions([]); } };
  const handleSelect = (p) => { setPatient(p); setSuggestions([]); setSearchName(p.name); setError(''); };
  const handleDelete = async (id) => { try { await deletePatient(id); setDeleted(id); setPatient(null); } catch { setError('Delete failed'); } };

  const sc = { waiting: '#d97706', scheduled: '#16a34a', processed: '#0058bc', cancelled: '#74777f' };
  const sb = { waiting: 'rgba(217,119,6,0.08)', scheduled: 'rgba(22,163,74,0.08)', processed: 'rgba(0,88,188,0.08)', cancelled: 'rgba(116,119,127,0.08)' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '740px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Patient Lookup</h1>
        <p className="page-subtitle">Search by ID (Hash Table O(1)) or Name (Trie prefix search)</p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>key</span>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Search by Patient ID</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="e.g. P-A1B2C3" className="input" style={{ flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && handleIdSearch()} />
          <button onClick={handleIdSearch} className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span> Search
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>edit_note</span>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Search by Name (Autocomplete)</h3>
        </div>
        <div style={{ position: 'relative' }}>
          <input value={searchName} onChange={e => handleNameSearch(e.target.value)} placeholder="Type at least 2 characters..." className="input"
            onBlur={() => setTimeout(() => setSuggestions([]), 200)} />
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
              borderRadius: '8px', overflow: 'hidden', zIndex: 10,
              background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)',
            }}>
              {suggestions.slice(0, 8).map(p => (
                <button key={p.patient_id} onClick={() => handleSelect(p)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', transition: 'background 0.1s', fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UrgencyBadge urgency={p.urgency} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#74777f' }}>{p.patient_id}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span> {error}
        </div>
      )}
      {deleted && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'rgba(22,163,74,0.06)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span> Patient {deleted} removed
        </div>
      )}

      {patient && (
        <div className="card animate-fade-in" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800 }}>{patient.name}</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '4px', color: '#0058bc' }}>{patient.patient_id}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, background: sb[patient.status], color: sc[patient.status] }}>
                {patient.status?.toUpperCase()}
              </span>
              <button onClick={() => handleDelete(patient.patient_id)} className="btn-danger" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span> Remove
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', fontSize: '14px' }}>
            <div><span style={{ color: '#74777f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Age</span><p style={{ fontWeight: 600, fontSize: '18px', marginTop: '4px' }}>{patient.age}</p></div>
            <div><span style={{ color: '#74777f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency</span><p style={{ fontWeight: 600, marginTop: '4px' }}>{patient.emergency_type}</p></div>
            <div><span style={{ color: '#74777f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Urgency</span><div style={{ marginTop: '4px' }}><UrgencyBadge urgency={patient.urgency} /></div></div>
            <div><span style={{ color: '#74777f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Priority Score</span><p style={{ fontWeight: 800, fontSize: '24px', marginTop: '4px', color: '#001F3F' }}>{patient.priority_score}</p></div>
            <div><span style={{ color: '#74777f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Urgency Base</span><p style={{ fontWeight: 600, marginTop: '4px' }}>{patient.urgency_base}</p></div>
            <div><span style={{ color: '#74777f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Age Bonus</span><p style={{ fontWeight: 600, marginTop: '4px' }}>+{patient.age_bonus}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

import UrgencyBadge from './UrgencyBadge';

const urgencyLabel = {
  Critical: 'EMERGENT',
  High: 'URGENT',
  Medium: 'STABLE',
  Low: 'ROUTINE',
};

export default function QueueTable({ patients }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-border-light)', marginBottom: '8px', display: 'block' }}>
          local_hospital
        </span>
        <p style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '14px' }}>No patients in queue</p>
        <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--color-text-muted)' }}>Register patients or start a simulation</p>
      </div>
    );
  }

  const formatTime = (ts) => ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const getWait = (ts) => {
    if (!ts) return '—';
    const mins = Math.round((Date.now() / 1000 - ts) / 60);
    return `${String(mins).padStart(2, '0')}m`;
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Table Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>list_alt</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Live Patient Queue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>filter_list</span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Filter View</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="table-header">
              {['Rank', 'Patient ID', 'Name', 'Urgency', 'Score', 'Arrived', 'Wait'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 16px',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--color-text-muted)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p, idx) => {
              const waitMins = p.registration_time ? Math.round((Date.now() / 1000 - p.registration_time) / 60) : 0;
              const waitColor = waitMins > 20 ? '#dc2626' : waitMins > 10 ? '#d97706' : 'var(--color-text)';
              return (
                <tr key={p.patient_id || idx} className="table-row"
                  style={{ background: idx === 0 ? 'rgba(0,88,188,0.03)' : 'transparent' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>#{idx + 1}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{p.patient_id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{p.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><UrgencyBadge urgency={p.urgency} /></td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>{p.priority_score}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatTime(p.registration_time)}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: waitColor }}>{getWait(p.registration_time)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

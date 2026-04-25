import UrgencyBadge from './UrgencyBadge';

export default function QueueTable({ patients, onProcess, showActions = false }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-3">🏥</div>
        <p style={{ color: 'var(--color-text-muted)' }}>No patients in queue</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(99, 102, 241, 0.08)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>Patient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>Age</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>Emergency</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>Urgency</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}>Score</th>
              {showActions && (
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}>Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {patients.map((p, idx) => (
              <tr key={p.patient_id || idx}
                className="transition-colors duration-150"
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: idx === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = idx === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent'}
              >
                <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {idx + 1}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--color-accent)' }}>
                  {p.patient_id}
                </td>
                <td className="px-4 py-3 text-sm">{p.age}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.emergency_type}
                </td>
                <td className="px-4 py-3"><UrgencyBadge urgency={p.urgency} /></td>
                <td className="px-4 py-3">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary-light)' }}>
                    {p.priority_score}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <button onClick={() => onProcess?.(p.patient_id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      Process
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

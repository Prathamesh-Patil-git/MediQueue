export default function FairnessGauge({ value, label }) {
  const percentage = Math.round((value || 0) * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  let color = '#dc2626';
  if (value >= 0.8) color = '#16a34a';
  else if (value >= 0.5) color = '#d97706';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="45" fill="none" stroke="#dee2e6" strokeWidth="10" />
          <circle cx="65" cy="65" r="45" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color }}>
            {value != null ? value.toFixed(2) : '—'}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#74777f' }}>
            / 1.00
          </span>
        </div>
      </div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#74777f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label || "Jain's Fairness Index"}
      </span>
    </div>
  );
}

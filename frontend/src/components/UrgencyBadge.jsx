const config = {
  Critical: { label: 'EMERGENT', className: 'badge-critical' },
  High: { label: 'URGENT', className: 'badge-high' },
  Medium: { label: 'STABLE', className: 'badge-medium' },
  Low: { label: 'ROUTINE', className: 'badge-low' },
};

export default function UrgencyBadge({ urgency }) {
  const c = config[urgency] || config.Low;
  return (
    <span className={`badge ${c.className}`} style={{ fontSize: '10px', letterSpacing: '0.04em', fontWeight: 800 }}>
      {c.label}
    </span>
  );
}

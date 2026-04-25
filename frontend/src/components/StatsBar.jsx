export default function StatsBar({ stats }) {
  const items = [
    { label: 'In Queue', value: stats?.queueSize ?? 0, icon: 'groups', color: '#0058bc' },
    { label: 'Scheduled', value: stats?.scheduled ?? 0, icon: 'event_available', color: '#16a34a' },
    { label: 'Fairness', value: stats?.fairness != null ? stats.fairness.toFixed(2) : '—', icon: 'balance', color: '#0d9488' },
    { label: 'Starvation', value: stats?.starvation ?? 0, icon: 'warning', color: stats?.starvation > 0 ? '#dc2626' : '#16a34a' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {items.map((item, i) => (
        <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${item.color}10`,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: item.color }}>{item.icon}</span>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#74777f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

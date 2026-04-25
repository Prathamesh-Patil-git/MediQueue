export default function StatsBar({ stats }) {
  const items = [
    {
      label: 'In Queue',
      value: stats?.queueSize ?? 0,
      icon: '👥',
      color: 'var(--color-primary-light)',
    },
    {
      label: 'Scheduled',
      value: stats?.scheduled ?? 0,
      icon: '✅',
      color: 'var(--color-low)',
    },
    {
      label: 'Fairness',
      value: stats?.fairness != null ? stats.fairness.toFixed(2) : '—',
      icon: '⚖️',
      color: 'var(--color-accent)',
    },
    {
      label: 'Starvation',
      value: stats?.starvation ?? 0,
      icon: '⚠️',
      color: stats?.starvation > 0 ? 'var(--color-critical)' : 'var(--color-low)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4"
          style={{ animationDelay: `${i * 80}ms` }}>
          <div className="text-2xl">{item.icon}</div>
          <div>
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

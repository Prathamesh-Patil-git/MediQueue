export default function UrgencyBadge({ urgency }) {
  const classMap = {
    Critical: 'badge-critical',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };
  const cls = classMap[urgency] || 'badge-low';

  return (
    <span
      className={`${cls} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide`}
    >
      {urgency === 'Critical' && '🔴 '}
      {urgency === 'High' && '🟠 '}
      {urgency === 'Medium' && '🔵 '}
      {urgency === 'Low' && '🟢 '}
      {urgency}
    </span>
  );
}

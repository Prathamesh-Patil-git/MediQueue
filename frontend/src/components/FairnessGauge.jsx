export default function FairnessGauge({ value, label }) {
  // value is 0 to 1
  const percentage = Math.round((value || 0) * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on fairness: green > 0.8, amber > 0.5, red < 0.5
  let color = 'var(--color-critical)';
  if (value >= 0.8) color = 'var(--color-low)';
  else if (value >= 0.5) color = 'var(--color-high)';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="45"
            fill="none" stroke="var(--color-border)" strokeWidth="8" />
          {/* Progress arc */}
          <circle cx="60" cy="60" r="45"
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {value != null ? value.toFixed(2) : '—'}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        {label || 'Fairness Index'}
      </span>
    </div>
  );
}

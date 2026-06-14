export default function ProgressBar({ value, max = 100, variant = 'default', showLabel = true, height }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  let fillClass = '';
  if (variant === 'auto') {
    if (percentage >= 80) fillClass = 'success';
    else if (percentage < 40) fillClass = 'warning';
  } else if (variant !== 'default') {
    fillClass = variant;
  }

  return (
    <div style={{ width: '100%' }}>
      <div className="progress-bar" style={height ? { height } : {}}>
        <div
          className={`progress-bar-fill ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

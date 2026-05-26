interface MetricIconProps {
  type: string;
  metric: string;
  className?: string;
}

export function MetricIcon({ type, metric, className = 'stat-icon' }: MetricIconProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${type}/${metric}.png`}
      alt=""
      aria-hidden="true"
      className={className}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
    />
  );
}

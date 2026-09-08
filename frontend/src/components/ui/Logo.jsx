export default function Logo({ size = 56 }) {
  const bars = [28, 46, 68, 52, 72, 42, 26];
  const barWidth = 9;
  const barGap = 7;
  const step = barWidth + barGap;
  const totalWidth = bars.length * barWidth + (bars.length - 1) * barGap;
  const cx = 80;
  const cy = 80;
  const startX = cx - totalWidth / 2;

  return (
    <div className="mb-4" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#250B50" />
            <stop offset="100%" stopColor="#06020E" />
          </radialGradient>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF00FF" />
            <stop offset="100%" stopColor="#FF1A8C" />
          </linearGradient>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF00FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF1A8C" stopOpacity="0.3" />
          </linearGradient>
          <clipPath id="circleClip">
            <circle cx={cx} cy={cy} r="72" />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r="72" fill="url(#bgGrad)" />
        <circle cx={cx} cy={cy} r="72" fill="none" stroke="url(#ringGrad)" strokeWidth="1.8" />
        <g clipPath="url(#circleClip)" fill="url(#barGrad)">
          {bars.map((h, i) => (
            <rect
              key={i}
              x={startX + i * step}
              y={cy - h / 2}
              width={barWidth}
              height={h}
              rx="4.5"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
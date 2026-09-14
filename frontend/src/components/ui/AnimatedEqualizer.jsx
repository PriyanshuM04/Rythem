export default function AnimatedEqualizer({ size = 16, color = "#D633E0" }) {
  const bars = [0, 1, 2];
  return (
    <div
      className="flex items-end gap-0.5"
      style={{ width: size, height: size }}
    >
      {bars.map((i) => (
        <div
          key={i}
          style={{
            width: "3px",
            backgroundColor: color,
            borderRadius: "1px",
            animation: "eqBar 0.9s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
import AnimatedEqualizer from "./AnimatedEqualizer";

export default function PlayableThumbnail({ isPlaying, className = "", eqSize = 16 }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full h-full bg-gray-300 rounded-md transition-opacity ${
          isPlaying ? "opacity-40" : "opacity-100 group-hover:opacity-70"
        }`}
      />
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedEqualizer size={eqSize} />
        </div>
      )}
    </div>
  );
}
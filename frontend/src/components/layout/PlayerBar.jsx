import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Heart,
  Plus,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import PlayableThumbnail from "../ui/PlayableThumbnail";

// Placeholder — real playlists come from backend later
const mockPlaylists = [
  { id: 1, name: "My Playlist 1" },
  { id: 2, name: "My Playlist 2" },
  { id: 3, name: "My Playlist 3" },
  { id: 4, name: "My Playlist 4" },
  { id: 5, name: "My Playlist 5" },
  { id: 6, name: "My Playlist 6" },
  { id: 7, name: "My Playlist 7" },
  { id: 8, name: "My Playlist 8" },
];

// Placeholder — real menu items/routes decided later
const optionsMenuItems = [{ label: "Option 1", path: "/option-1" }];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isLiked,
    shuffleOn,
    repeatMode,
    togglePlay,
    setProgress,
    setVolume,
    toggleMute,
    toggleLike,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const playlistRef = useRef(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (playlistRef.current && !playlistRef.current.contains(e.target)) setShowPlaylistMenu(false);
      if (optionsRef.current && !optionsRef.current.contains(e.target)) setShowOptionsMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    const interval = setInterval(() => {
      setProgress(progress >= duration ? 0 : progress + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, progress, duration, currentSong, setProgress]);

  if (!currentSong) {
    return (
      <div className="h-20 w-full bg-[#2C2C2C] border-t border-border flex items-center justify-center shrink-0">
        <p className="text-sm text-gray-500 font-serif">No song playing</p>
      </div>
    );
  }

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <div className="h-20 w-full bg-[#2C2C2C] border-t border-border flex items-center px-6 gap-6 shrink-0 font-serif">
      {/* Left: song info */}
      <div className="flex items-center gap-3 w-64 shrink-0 min-w-0">
        <PlayableThumbnail isPlaying={isPlaying} className="w-12 h-12 rounded" eqSize={16} />
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentSong.artists}</p>
        </div>
      </div>

      {/* Center: transport controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition ${shuffleOn ? "text-accent" : "text-gray-400 hover:text-white"}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-gray-300 hover:text-white transition" title="Previous">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-accent transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-black" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
            )}
          </button>
          <button className="text-gray-300 hover:text-white transition" title="Next">
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`transition ${repeatMode !== "off" ? "text-accent" : "text-gray-400 hover:text-white"}`}
            title="Repeat"
          >
            <RepeatIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-[11px] text-gray-400 w-9 text-right">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="flex-1 accent-accent h-1 cursor-pointer"
          />
          <span className="text-[11px] text-gray-400 w-9">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: like, volume, add-to-playlist, options, expand */}
      <div className="flex items-center gap-4 w-64 justify-end shrink-0">
        <button
          onClick={toggleLike}
          className={`transition ${isLiked ? "text-accent" : "text-gray-400 hover:text-white"}`}
          title="Like"
        >
          <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
        </button>

        <div className="flex items-center gap-1.5 group/volume">
          <button onClick={toggleMute} className="text-gray-300 hover:text-white transition" title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-0 group-hover/volume:w-20 opacity-0 group-hover/volume:opacity-100 accent-accent h-1 cursor-pointer transition-all duration-200 overflow-hidden"
          />
        </div>

        {/* Add to playlist */}
        <div className="relative" ref={playlistRef}>
          <button
            onClick={() => setShowPlaylistMenu((o) => !o)}
            className="text-gray-300 hover:text-white transition"
            title="Add to playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
          {showPlaylistMenu && (
            <div className="absolute bottom-10 right-0 w-48 bg-surface-raised border border-border rounded-md shadow-lg z-20">
              <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Add to playlist</p>
              <div className="max-h-42 overflow-y-auto custom-scrollbar">
                {mockPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      // TODO: wire to real "add song to playlist" backend call
                      setShowPlaylistMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition truncate"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Options menu */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptionsMenu((o) => !o)}
            className="text-gray-300 hover:text-white transition"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showOptionsMenu && (
            <div className="absolute bottom-10 right-0 w-40 bg-surface-raised border border-border rounded-md shadow-lg z-20 py-1">
              {optionsMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setShowOptionsMenu(false);
                    navigate(item.path);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => navigate("/player")} className="text-gray-300 hover:text-white transition" title="Expand">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
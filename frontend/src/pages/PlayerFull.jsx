import { useNavigate } from "react-router-dom";
import { Minimize2 } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import PlayableThumbnail from "../components/ui/PlayableThumbnail";

export default function PlayerFull() {
  const navigate = useNavigate();
  const { currentSong, isPlaying } = usePlayerStore();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-surface font-serif p-8 gap-6">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-24 left-8 text-gray-300 hover:text-white transition"
        title="Minimize"
      >
        <Minimize2 className="w-5 h-5" />
      </button>

      {currentSong ? (
        <>
          <PlayableThumbnail isPlaying={isPlaying} className="w-64 h-64 rounded-lg" eqSize={40} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{currentSong.title}</h1>
            <p className="text-gray-400">{currentSong.artists}</p>
          </div>
          <p className="text-sm text-gray-500">Full player view — waveform scrubber and lyrics sync coming later</p>
        </>
      ) : (
        <p className="text-gray-400">No song playing</p>
      )}
    </div>
  );
}
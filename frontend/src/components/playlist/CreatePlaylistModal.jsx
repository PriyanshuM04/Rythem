import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import Input from "../ui/Input";
import { usePlaylistStore } from "../../store/playlistStore";

const VISIBILITY_OPTIONS = [
  { value: true, label: "Public" },
  { value: false, label: "Private" },
];

export default function CreatePlaylistModal({ song, onClose }) {
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const toggleSongInPlaylist = usePlaylistStore((s) => s.toggleSongInPlaylist);

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const visibilityRef = useRef(null);

  // Close the visibility dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (visibilityRef.current && !visibilityRef.current.contains(e.target)) {
        setVisibilityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const playlist = await createPlaylist({ name, isPublic });
      // Opened from "add to playlist", so the song starts checked in the new list.
      await toggleSongInPlaylist(song, playlist.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create the playlist. Try again.");
      setSubmitting(false);
    }
  };

  const selectedLabel = isPublic ? "Public" : "Private";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleCreate}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-81 max-w-[calc(100vw-2rem)] rounded-xl bg-surface px-12 py-6 flex flex-col gap-3 font-serif shadow-xl"
      >
        <h2 className="text-center text-lg font-bold text-white">Create New Playlist</h2>

        <Input
          type="text"
          placeholder="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div className="relative" ref={visibilityRef}>
          <button
            type="button"
            onClick={() => setVisibilityOpen((o) => !o)}
            className="w-full bg-[#757575] text-white rounded-md px-4 py-1.5 text-left font-['Aleo'] flex items-center justify-between outline-none focus:ring-2 focus:ring-accent transition"
          >
            {selectedLabel}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${visibilityOpen ? "rotate-180" : ""}`}
            />
          </button>

          {visibilityOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-[#757575] border border-border rounded-md shadow-lg py-1 z-10">
              {VISIBILITY_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setIsPublic(option.value);
                    setVisibilityOpen(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-sm transition hover:bg-white/10 ${
                    option.value === isPublic ? "text-accent" : "text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-center text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="w-full rounded-md bg-[#4F4F4F] py-1.5 text-white transition hover:bg-[#5c5c5c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create"}
        </button>
      </form>
    </div>,
    document.body
  );
}

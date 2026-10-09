import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  usePlaylistStore,
  selectOwnedPlaylists,
  getSongKey,
} from "../../store/playlistStore";
import CreatePlaylistModal from "./CreatePlaylistModal";

export default function AddToPlaylistMenu({ song }) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const ref = useRef(null);

  const playlists = usePlaylistStore((s) => s.playlists);
  const status = usePlaylistStore((s) => s.status);
  const error = usePlaylistStore((s) => s.error);
  const songMembership = usePlaylistStore((s) => s.songMembership);
  const fetchMyPlaylists = usePlaylistStore((s) => s.fetchMyPlaylists);
  const toggleSongInPlaylist = usePlaylistStore((s) => s.toggleSongInPlaylist);

  const songKey = getSongKey(song);
  const selectedIds = songMembership[songKey] ?? [];

  const ownedPlaylists = useMemo(() => selectOwnedPlaylists(playlists), [playlists]);

  // Load the current user's playlists once the playerbar mounts with a song.
  useEffect(() => {
    fetchMyPlaylists();
  }, [fetchMyPlaylists]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLoading = status === "loading" && playlists.length === 0;
  const isEmpty = status === "success" && playlists.length === 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-gray-300 hover:text-white transition"
        title="Add to playlist"
      >
        <Plus className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-60 bg-surface-raised border border-border rounded-md shadow-lg z-20 overflow-hidden">
          <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Add to playlist</p>

          {/* 5 rows visible (h-10 each); scrolls when there are more. */}
          <div className="max-h-50 overflow-y-auto custom-scrollbar">
            {isLoading && (
              <p className="flex h-10 items-center px-3 text-sm text-gray-500">Loading…</p>
            )}

            {status === "error" && (
              <div className="flex flex-col gap-2 px-3 py-3">
                <p className="text-xs text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={fetchMyPlaylists}
                  className="self-start text-xs text-accent hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {isEmpty && (
              <p className="flex h-10 items-center px-3 text-sm text-gray-500">No playlists yet</p>
            )}

            {ownedPlaylists.map((playlist) => {
              const checked = selectedIds.includes(playlist.id);
              return (
                <label
                  key={playlist.id}
                  className="flex items-center gap-3 h-10 px-3 text-sm text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSongInPlaylist(song, playlist.id)}
                    className="w-4 h-4 shrink-0 accent-accent cursor-pointer"
                  />
                  <span className="truncate">{playlist.name}</span>
                </label>
              );
            })}
          </div>

          {error && status !== "error" && (
            <p className="px-3 pt-1 text-xs text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 h-10 text-sm text-white hover:bg-white/10 transition border-t border-border"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Create New Playlist
          </button>
        </div>
      )}

      {createOpen && <CreatePlaylistModal song={song} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

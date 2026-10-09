import { create } from "zustand";
import { playlistService } from "../services/playlistService";

/** Stable key per song, so selections survive across different playerbar songs. */
export function getSongKey(song) {
  if (!song) return null;
  const id = song.id ?? song.title ?? "unknown";
  return `${song.section ?? "song"}-${id}`;
}

// Songs that carry backend metadata (e.g. duration/play count) have a real song id,
// so membership changes can be persisted. Placeholder songs generated on the Home
// page only have id/title/artists, so their membership stays local until the Home
// page is wired to the songs API.
function isBackendSong(song) {
  return song != null && (song.duration_seconds != null || song.play_count != null);
}

export const usePlaylistStore = create((set, get) => ({
  playlists: [],
  status: "idle", // "idle" | "loading" | "success" | "error"
  error: null,
  // songKey -> [playlistId], the playlists the current user added that song to.
  songMembership: {},

  fetchMyPlaylists: async () => {
    set({ status: "loading", error: null });
    try {
      const playlists = await playlistService.getMine();
      set({ playlists, status: "success" });
    } catch (err) {
      set({
        status: "error",
        error: err.response?.data?.detail || "Couldn't load your playlists.",
      });
    }
  },

  createPlaylist: async ({ name, isPublic = true }) => {
    const created = await playlistService.create({ name: name.trim(), isPublic });
    set((state) => ({
      playlists: [{ id: created.id, name: created.name }, ...state.playlists],
      status: "success",
      error: null,
    }));
    return created;
  },

  toggleSongInPlaylist: async (song, playlistId) => {
    const songKey = getSongKey(song);
    if (!songKey) return;

    const current = get().songMembership[songKey] ?? [];
    const willAdd = !current.includes(playlistId);
    const next = willAdd ? [...current, playlistId] : current.filter((id) => id !== playlistId);

    // Optimistic local update — the checkbox responds immediately.
    set((state) => ({
      songMembership: { ...state.songMembership, [songKey]: next },
      error: null,
    }));

    if (!isBackendSong(song)) return;

    try {
      if (willAdd) await playlistService.addSong(playlistId, song.id);
      else await playlistService.removeSong(playlistId, song.id);
    } catch (err) {
      // Roll back if the backend rejected the change.
      set((state) => ({
        songMembership: { ...state.songMembership, [songKey]: current },
        error: err.response?.data?.detail || "Couldn't update the playlist.",
      }));
    }
  },
}));

/** Newest first — ids are auto-incrementing, so this puts recently created playlists on top. */
export function selectOwnedPlaylists(playlists) {
  return [...playlists].sort((a, b) => b.id - a.id);
}

import api from "./api";

export const playlistService = {
  // Owner-scoped: the backend only returns playlists owned by the current user.
  getMine: async () => {
    const { data } = await api.get("/playlists/mine");
    return data.playlists; // [{ id, name }]
  },

  create: async ({ name, isPublic }) => {
    const { data } = await api.post("/playlists/", { name, is_public: isPublic });
    return data; // PlaylistResponse
  },

  addSong: async (playlistId, songId) => {
    const { data } = await api.post(`/playlists/${playlistId}/songs`, { song_id: songId });
    return data;
  },

  removeSong: async (playlistId, songId) => {
    const { data } = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
    return data;
  },
};

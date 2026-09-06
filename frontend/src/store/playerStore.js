import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 1,
  shuffleLocked: false,

  playSong: (song) => set({ currentSong: song, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
}));
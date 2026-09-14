import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  currentSong: null, // { id, section, title, artists, album }
  isPlaying: false,
  progress: 0, // seconds — mock/simulated until Howler.js is wired
  duration: 210, // mock 3:30 duration until real audio metadata exists
  volume: 0.8,
  previousVolume: 0.8,
  isMuted: false,
  isLiked: false,
  shuffleOn: false,
  shuffleLocked: false, // tier-gated later (T2/T3 always-on)
  repeatMode: "off", // "off" | "all" | "one"

  playSong: (song) =>
    set({ currentSong: song, isPlaying: true, progress: 0, isLiked: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () =>
    set((state) =>
      state.isMuted
        ? { isMuted: false, volume: state.previousVolume || 0.8 }
        : { isMuted: true, previousVolume: state.volume, volume: 0 }
    ),
  toggleLike: () => set((state) => ({ isLiked: !state.isLiked })),
  toggleShuffle: () => set((state) => ({ shuffleOn: !state.shuffleOn })),
  cycleRepeat: () =>
    set((state) => ({
      repeatMode:
        state.repeatMode === "off" ? "all" : state.repeatMode === "all" ? "one" : "off",
    })),
}));
import { create } from "zustand";

export const useQueueStore = create((set) => ({
  queue: [],
  currentIndex: 0,

  setQueue: (songs) => set({ queue: songs, currentIndex: 0 }),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  next: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.queue.length - 1),
    })),
  previous: () =>
    set((state) => ({ currentIndex: Math.max(state.currentIndex - 1, 0) })),
  reorder: (newQueue) => set({ queue: newQueue }),
}));
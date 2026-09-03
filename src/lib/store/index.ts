import { create } from 'zustand';
import type { Tables } from '@/types/database';

/** A track/video the global Vibe Bar can play. */
export interface PlayerTrack {
  id: string;
  kind: 'audio' | 'video' | 'short' | 'live' | 'radio' | 'podcast';
  title: string;
  channelName?: string;
  coverUrl?: string | null;
  sourceType: 'hosted' | 'youtube' | 'soundcloud' | 'vimeo' | 'hls' | 'mp4';
  sourceUrl?: string | null;
  durationSeconds?: number | null;
}

interface AppState {
  // User
  user: Tables<'profiles'> | null;
  wallet: Tables<'wallets'> | null;
  standing: Tables<'standing'> | null;

  // UI
  sidebarOpen: boolean;
  searchOpen: boolean;

  // Media player (the Vibe Bar)
  playerTrack: PlayerTrack | null;
  playerQueue: PlayerTrack[];
  playerPlaying: boolean;
  playerExpanded: boolean;

  // Actions
  setUser: (user: Tables<'profiles'> | null) => void;
  setWallet: (wallet: Tables<'wallets'> | null) => void;
  setStanding: (standing: Tables<'standing'> | null) => void;
  toggleSidebar: () => void;
  toggleSearch: () => void;

  // Player actions
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: PlayerTrack) => void;
  closePlayer: () => void;
  setPlayerExpanded: (expanded: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  wallet: null,
  standing: null,
  sidebarOpen: false,
  searchOpen: false,

  playerTrack: null,
  playerQueue: [],
  playerPlaying: false,
  playerExpanded: false,

  setUser: (user) => set({ user }),
  setWallet: (wallet) => set({ wallet }),
  setStanding: (standing) => set({ standing }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),

  playTrack: (track, queue) =>
    set({
      playerTrack: track,
      playerQueue: queue ?? [track],
      playerPlaying: true,
    }),
  togglePlay: () => set((s) => ({ playerPlaying: !s.playerPlaying })),
  setPlaying: (playing) => set({ playerPlaying: playing }),
  nextTrack: () => {
    const { playerQueue, playerTrack } = get();
    if (!playerTrack || playerQueue.length === 0) return;
    const idx = playerQueue.findIndex((t) => t.id === playerTrack.id);
    const next = playerQueue[idx + 1];
    if (next) set({ playerTrack: next, playerPlaying: true });
  },
  prevTrack: () => {
    const { playerQueue, playerTrack } = get();
    if (!playerTrack || playerQueue.length === 0) return;
    const idx = playerQueue.findIndex((t) => t.id === playerTrack.id);
    const prev = playerQueue[idx - 1];
    if (prev) set({ playerTrack: prev, playerPlaying: true });
  },
  addToQueue: (track) => set((s) => ({ playerQueue: [...s.playerQueue, track] })),
  closePlayer: () => set({ playerTrack: null, playerPlaying: false, playerExpanded: false }),
  setPlayerExpanded: (expanded) => set({ playerExpanded: expanded }),
}));

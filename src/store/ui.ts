import { create } from "zustand";

export type CaptionMode = "plain" | "technical";

interface UiState {
  readonly contactOpen: boolean;
  readonly captionMode: CaptionMode;
  openContact: () => void;
  closeContact: () => void;
  setCaptionMode: (mode: CaptionMode) => void;
}

/** Museum-wide interaction state shared by the top bar, panels and exhibits. */
export const useUiStore = create<UiState>()((set) => ({
  contactOpen: false,
  captionMode: "plain",
  openContact: () => set({ contactOpen: true }),
  closeContact: () => set({ contactOpen: false }),
  setCaptionMode: (captionMode) => set({ captionMode }),
}));

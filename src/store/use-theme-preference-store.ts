import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemePreferenceStore = create<ThemePreferenceState>((set) => ({
  preference: 'system',
  setPreference: (preference) => set({ preference }),
}));

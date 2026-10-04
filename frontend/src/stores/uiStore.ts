import { create } from 'zustand';
import { type Language, translations } from '../lib/i18n';

interface UIState {
  language: Language;
  sidebarOpen: boolean;
  activeNotificationCount: number;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const useUIStore = create<UIState>((set, get) => ({
  language: 'en',
  sidebarOpen: true,
  activeNotificationCount: 17,
  setLanguage: (lang) => set({ language: lang }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  t: (key) => {
    const lang = get().language;
    return translations[lang][key] || translations['en'][key] || key;
  }
}));

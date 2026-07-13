export type ThemeId = 'dark' | 'light' | 'mixed';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  icon: string;
}

export const themes: ThemeOption[] = [
  { id: 'dark', label: 'Dark', icon: '◐' },
  { id: 'light', label: 'Light', icon: '○' },
  { id: 'mixed', label: 'Mixed', icon: '◑' },
];

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemePreferenceStore } from '@/store/use-theme-preference-store';

export function useResolvedColorScheme() {
  const systemScheme = useColorScheme();
  const preference = useThemePreferenceStore((state) => state.preference);
  const scheme = preference === 'system' ? systemScheme : preference;

  return scheme === 'unspecified' || !scheme ? 'light' : scheme;
}

export function useTheme() {
  const theme = useResolvedColorScheme();

  return Colors[theme];
}

import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ToastProps = {
  message: string | null;
};

export function Toast({ message }: ToastProps) {
  const theme = useTheme();

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="none"
      style={styles.wrapper}>
      <Animated.View style={[styles.toast, { backgroundColor: theme.text }]}>
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          size={16}
          tintColor={theme.background}
        />
        <ThemedText type="smallBold" themeColor="background">
          {message}
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BottomTabInset + Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    maxWidth: MaxContentWidth,
  },
});

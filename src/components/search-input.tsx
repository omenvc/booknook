import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

import { Fonts, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchInputProps = Required<Pick<TextInputProps, 'value' | 'onChangeText'>> &
  Pick<TextInputProps, 'placeholder' | 'returnKeyType' | 'autoFocus'>;

const SPRING_CONFIG = { damping: 16, stiffness: 220 };

export function SearchInput({
  value,
  onChangeText,
  placeholder,
  returnKeyType = 'search',
  autoFocus,
}: SearchInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
  }, [isFocused, focusProgress]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [theme.backgroundSelected, theme.primary]
    ),
    transform: [{ scale: interpolate(focusProgress.value, [0, 1], [1, 1.015]) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focusProgress.value, [0, 1], [1, 1.15]) },
      { rotate: `${interpolate(focusProgress.value, [0, 1], [0, -12])}deg` },
    ],
  }));

  const iconBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusProgress.value, [0, 1], [0, 0.14]),
    transform: [{ scale: interpolate(focusProgress.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      style={[styles.container, { backgroundColor: theme.backgroundElement }, containerStyle]}>
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[styles.iconBadge, { backgroundColor: theme.primary }, iconBadgeStyle]}
        />
        <Animated.View style={iconStyle}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="medium"
            tintColor={isFocused ? theme.primary : theme.textSecondary}
          />
        </Animated.View>
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
      />

      {value.length > 0 && (
        <Animated.View entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(150)}>
          <Pressable
            hitSlop={8}
            onPress={() => onChangeText('')}
            style={({ pressed }) => pressed && styles.pressed}>
            <SymbolView
              name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
              size={18}
              tintColor={theme.textSecondary}
            />
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSize.base,
    padding: 0,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  pressed: {
    opacity: 0.6,
  },
});

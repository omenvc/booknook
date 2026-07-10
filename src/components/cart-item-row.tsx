import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { CartItem } from '@/api/books';
import { ThemedText } from '@/components/themed-text';
import { Fonts, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CartItemRowProps = {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  const theme = useTheme();
  const { book, quantity } = item;

  return (
    <View style={[styles.row, { backgroundColor: theme.tertiary }]}>
      <Image
        source={{ uri: book.coverUrl }}
        style={styles.cover}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.details}>
        <ThemedText
          type="default"
          style={{ fontFamily: Fonts.serif, fontWeight: FontWeight.semibold }}
          numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="primary">
          ${book.price.toFixed(2)}
        </ThemedText>

        <View style={styles.controls}>
          <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
            <Pressable
              onPress={onDecrement}
              accessibilityLabel="Decrease quantity"
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold">−</ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={styles.quantity}>
              {quantity}
            </ThemedText>
            <Pressable
              onPress={onIncrement}
              accessibilityLabel="Increase quantity"
              style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold">+</ThemedText>
            </Pressable>
          </View>

          <Pressable
            onPress={onRemove}
            accessibilityLabel={`Remove ${book.title} from cart`}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.remove}>
              Remove
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  cover: {
    width: 56,
    height: 84,
    borderRadius: Spacing.one,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.one,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    minWidth: 16,
    textAlign: 'center',
  },
  remove: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
});

import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Book } from '@/api/books';
import { ThemedText } from '@/components/themed-text';
import { Fonts, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FeaturedBookCardProps = {
  book: Book;
  onPress?: () => void;
};

export const FEATURED_CARD_WIDTH = 140;

export function FeaturedBookCard({ book, onPress }: FeaturedBookCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}, $${book.price.toFixed(2)}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image
        source={{ uri: book.coverUrl }}
        style={[styles.cover, { backgroundColor: theme.tertiary }]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.details}>
        <ThemedText
          type="small"
          style={[styles.title, { fontFamily: Fonts.serif, fontWeight: FontWeight.semibold }]}
          numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="primary">
          ${book.price.toFixed(2)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: FEATURED_CARD_WIDTH,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.85,
  },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: Spacing.two,
  },
  details: {
    gap: Spacing.half,
  },
  title: {
    marginBottom: 0,
  },
});

import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Book } from '@/api/books';
import { ThemedText } from '@/components/themed-text';
import { Fonts, FontWeight, LineHeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BookCardProps = {
  book: Book;
  onPress?: () => void;
};

const COVER_HEIGHT = 96;

export const BOOK_CARD_HEIGHT = Spacing.three * 2 + COVER_HEIGHT;

export function BookCard({ book, onPress }: BookCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}, $${book.price.toFixed(2)}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.tertiary },
        pressed && styles.pressed,
      ]}>
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
          style={[styles.title, { fontFamily: Fonts.serif, fontWeight: FontWeight.semibold }]}
          numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {book.author}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="primary" style={styles.price}>
          ${book.price.toFixed(2)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  cover: {
    width: 64,
    height: COVER_HEIGHT,
    borderRadius: Spacing.one,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.half,
  },
  title: {
    marginBottom: Spacing.half,
    minHeight: LineHeight.base * 2,
  },
  price: {
    marginTop: Spacing.half,
  },
});

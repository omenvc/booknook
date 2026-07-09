import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewItem } from '@/components/review-item';
import { StarRating } from '@/components/star-rating';
import { StockStatusBadge } from '@/components/stock-status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useBookDetails } from '@/hooks/use-book-details';
import { useTheme } from '@/hooks/use-theme';
import { useCartStore } from '@/store/use-cart-store';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { book, loading, error, retry } = useBookDetails(id);
  const addItem = useCartStore((state) => state.addItem);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={styles.centerBox}>
          <ActivityIndicator color={theme.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error || !book) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={styles.centerBox}>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            {error ?? 'Something went wrong.'}
          </ThemedText>
          <Pressable
            onPress={retry}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}>
            <ThemedText themeColor="background" type="smallBold">
              Retry
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const outOfStock = book.stockStatus === 'out-of-stock';
  const averageRating =
    book.reviews.length > 0
      ? book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length
      : 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: book.coverUrl }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />

          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              {book.title}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {book.author}
            </ThemedText>

            <View style={styles.priceRow}>
              <ThemedText type="subtitle" themeColor="primary">
                ${book.price.toFixed(2)}
              </ThemedText>
              <StockStatusBadge status={book.stockStatus} />
            </View>

            {book.reviews.length > 0 && (
              <View style={styles.ratingRow}>
                <StarRating rating={averageRating} size={16} />
                <ThemedText type="small" themeColor="textSecondary">
                  {averageRating.toFixed(1)} ({book.reviews.length} review
                  {book.reviews.length === 1 ? '' : 's'})
                </ThemedText>
              </View>
            )}

            <ThemedText type="default" style={styles.description}>
              {book.description}
            </ThemedText>

            <Pressable
              disabled={outOfStock}
              onPress={() => addItem(book)}
              style={({ pressed }) => [
                styles.addToCartButton,
                { backgroundColor: outOfStock ? theme.backgroundSelected : theme.secondary },
                pressed && !outOfStock && styles.pressed,
              ]}>
              <ThemedText type="smallBold" themeColor={outOfStock ? 'textSecondary' : 'background'}>
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </ThemedText>
            </Pressable>

            {book.reviews.length > 0 && (
              <View style={styles.reviewsSection}>
                <ThemedText type="subtitle" style={styles.reviewsHeading}>
                  Reviews
                </ThemedText>
                {book.reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.85,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.six,
  },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    marginBottom: 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  description: {
    marginTop: Spacing.two,
  },
  addToCartButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: Spacing.five,
  },
  reviewsHeading: {
    marginBottom: Spacing.two,
  },
});

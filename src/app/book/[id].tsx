import { FlyToCartOverlay } from "@/components/fly-to-cart-overlay";
import { ReviewItem } from "@/components/review-item";
import { StarRating } from "@/components/star-rating";
import { StockStatusBadge } from "@/components/stock-status-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast } from "@/components/toast";
import { sharedStyles } from "@/constants/shared-styles";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useBookDetails } from "@/hooks/use-book-details";
import { useFlyToCart } from "@/hooks/use-fly-to-cart";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/use-cart-store";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ADD_TO_CART_DELAY = 3000;

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { book, loading, error, retry } = useBookDetails(id);
  const addItem = useCartStore((state) => state.addItem);
  const { height: windowHeight } = useWindowDimensions();
  const coverHeight = Math.min(windowHeight * 0.42, 420);
  const addToCartRef = useRef<View>(null);
  const { flights, trigger, complete } = useFlyToCart();
  const { toastMessage, showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={sharedStyles.centerBox}>
          <ActivityIndicator color={theme.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error || !book) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={sharedStyles.centerBox}>
          <ThemedText
            themeColor="textSecondary"
            style={sharedStyles.centerText}
          >
            {error ?? "Something went wrong."}
          </ThemedText>
          <Pressable
            onPress={retry}
            style={({ pressed }) => [
              sharedStyles.pillButton,
              { backgroundColor: theme.primary },
              pressed && sharedStyles.pressed,
            ]}
          >
            <ThemedText themeColor="background" type="smallBold">
              Retry
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const outOfStock = book.stockStatus === "out-of-stock";
  const averageRating =
    book.reviews.length > 0
      ? book.reviews.reduce((sum, review) => sum + review.rating, 0) /
        book.reviews.length
      : 0;

  const handleAddToCart = () => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      addItem(book);
      addToCartRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        trigger({ x: pageX, y: pageY, width, height });
      });
      setIsAddingToCart(false);
      showToast("Added to cart");
    }, ADD_TO_CART_DELAY);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={sharedStyles.safeArea}
        edges={["bottom", "left", "right"]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: book.coverUrl }}
            style={[styles.cover, { height: coverHeight }]}
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
                  {book.reviews.length === 1 ? "" : "s"})
                </ThemedText>
              </View>
            )}

            <ThemedText type="default" style={styles.description}>
              {book.description}
            </ThemedText>

            <Pressable
              ref={addToCartRef}
              disabled={outOfStock || isAddingToCart}
              onPress={handleAddToCart}
              style={({ pressed }) => [
                styles.addToCartButton,
                {
                  backgroundColor: outOfStock
                    ? theme.backgroundSelected
                    : theme.secondary,
                },
                pressed && !outOfStock && sharedStyles.pressed,
              ]}
            >
              {isAddingToCart ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <ThemedText
                  type="smallBold"
                  themeColor={outOfStock ? "textSecondary" : "background"}
                >
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </ThemedText>
              )}
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

        <FlyToCartOverlay
          flights={flights}
          coverUrl={book.coverUrl}
          onComplete={complete}
        />
        <Toast message={toastMessage} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.six,
  },
  cover: {
    width: "100%",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  description: {
    marginTop: Spacing.two,
  },
  addToCartButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  reviewsSection: {
    marginTop: Spacing.five,
  },
  reviewsHeading: {
    marginBottom: Spacing.two,
  },
});

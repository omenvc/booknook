import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Book } from '@/api/books';
import { FEATURED_CARD_WIDTH, FeaturedBookCard } from '@/components/featured-book-card';
import { FlyToCartOverlay } from '@/components/fly-to-cart-overlay';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { sharedStyles } from '@/constants/shared-styles';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useBookShelves } from '@/hooks/use-book-shelves';
import { useFlyToCart } from '@/hooks/use-fly-to-cart';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/use-cart-store';

const ADD_TO_CART_DELAY = 3000;

export default function HomeScreen() {
  const theme = useTheme();
  const { shelves, loading, error, retry } = useBookShelves();
  const addItem = useCartStore((state) => state.addItem);
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.min(windowHeight * 0.62, 560);
  const addToCartRef = useRef<View>(null);
  const { flights, trigger, complete } = useFlyToCart();
  const { toastMessage, showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const heroBook = shelves[0]?.books[0] ?? null;

  const handleAddToCart = () => {
    if (!heroBook || isAddingToCart) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      addItem(heroBook);
      addToCartRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        trigger({ x: pageX, y: pageY, width, height });
      });
      setIsAddingToCart(false);
      showToast('Added to cart');
    }, ADD_TO_CART_DELAY);
  };

  const renderShelfItem = useCallback(
    ({ item }: { item: Book }) => (
      <FeaturedBookCard book={item} onPress={() => router.push(`/book/${item.id}`)} />
    ),
    []
  );

  const showFullScreenLoading = loading && shelves.length === 0;
  const showFullScreenError = !!error && shelves.length === 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={sharedStyles.safeArea} edges={['left', 'right']}>
        {showFullScreenLoading && (
          <View style={sharedStyles.centerBox}>
            <ActivityIndicator color={theme.primary} />
          </View>
        )}

        {showFullScreenError && (
          <View style={sharedStyles.centerBox}>
            <ThemedText themeColor="textSecondary" style={sharedStyles.centerText}>
              {error}
            </ThemedText>
            <Pressable
              onPress={retry}
              style={({ pressed }) => [
                sharedStyles.pillButton,
                { backgroundColor: theme.primary },
                pressed && sharedStyles.pressed,
              ]}>
              <ThemedText themeColor="background" type="smallBold">
                Retry
              </ThemedText>
            </Pressable>
          </View>
        )}

        {!showFullScreenLoading && !showFullScreenError && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {heroBook && (
              <View style={[styles.hero, { height: heroHeight }]}>
                <Image
                  source={{ uri: heroBook.coverUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <LinearGradient
                  colors={['transparent', theme.background]}
                  locations={[0.35, 1]}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />

                <View style={styles.heroContent}>
                  <ThemedText type="title" style={styles.heroTitle} numberOfLines={2}>
                    {heroBook.title}
                  </ThemedText>
                  <ThemedText type="default" themeColor="textSecondary" numberOfLines={1}>
                    {heroBook.author}
                  </ThemedText>

                  <View style={styles.heroActions}>
                    <Pressable
                      onPress={() => router.push(`/book/${heroBook.id}`)}
                      style={({ pressed }) => [
                        styles.heroButton,
                        { backgroundColor: theme.secondary },
                        pressed && sharedStyles.pressed,
                      ]}>
                      <SymbolView
                        name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
                        size={16}
                        tintColor={theme.background}
                      />
                      <ThemedText type="smallBold" themeColor="background">
                        Details
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      ref={addToCartRef}
                      disabled={isAddingToCart}
                      onPress={handleAddToCart}
                      style={({ pressed }) => [
                        styles.heroButton,
                        styles.heroButtonSecondary,
                        { backgroundColor: `${theme.background}CC`, borderColor: theme.text },
                        pressed && sharedStyles.pressed,
                      ]}>
                      {isAddingToCart ? (
                        <ActivityIndicator color={theme.text} />
                      ) : (
                        <>
                          <SymbolView
                            name={{
                              ios: 'cart.badge.plus',
                              android: 'add_shopping_cart',
                              web: 'add_shopping_cart',
                            }}
                            size={16}
                            tintColor={theme.text}
                          />
                          <ThemedText type="smallBold">Add to Cart</ThemedText>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.shelvesContainer}>
              {shelves.map((shelf) => (
                <View key={shelf.key} style={styles.section}>
                  <ThemedText type="subtitle" style={styles.sectionHeading}>
                    {shelf.title}
                  </ThemedText>

                  <FlatList
                    data={shelf.books}
                    keyExtractor={(item) => item.id}
                    renderItem={renderShelfItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.shelfContent}
                    getItemLayout={(_data, index) => ({
                      length: FEATURED_CARD_WIDTH + Spacing.three,
                      offset: (FEATURED_CARD_WIDTH + Spacing.three) * index,
                      index,
                    })}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <FlyToCartOverlay flights={flights} coverUrl={heroBook?.coverUrl ?? ''} onComplete={complete} />
        <Toast message={toastMessage} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.one,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  heroTitle: {
    marginBottom: Spacing.half,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  heroButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  heroButtonSecondary: {
    borderWidth: 1,
  },
  shelvesContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionHeading: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  shelfContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
});

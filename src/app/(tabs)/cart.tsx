import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CartItem } from '@/api/books';
import { CartItemRow } from '@/components/cart-item-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { selectCartTotal, useCartStore } from '@/store/use-cart-store';

export default function CartScreen() {
  const theme = useTheme();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore(selectCartTotal);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemRow
        item={item}
        onIncrement={() => updateQuantity(item.book.id, item.quantity + 1)}
        onDecrement={() => updateQuantity(item.book.id, item.quantity - 1)}
        onRemove={() => removeItem(item.book.id)}
      />
    ),
    [updateQuantity, removeItem]
  );

  if (items.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Your cart is empty
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Add some books to get started.
          </ThemedText>
          <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.secondary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" themeColor="background">
              Browse Books
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Cart</ThemedText>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.book.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.footer, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.totalRow}>
            <ThemedText type="default">Total</ThemedText>
            <ThemedText type="subtitle" themeColor="primary">
              ${total.toFixed(2)}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/checkout')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.secondary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" themeColor="background">
              Proceed to Checkout
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.select({ web: Spacing.six, default: Spacing.three }),
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.four,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});

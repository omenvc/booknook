import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCheckout } from '@/hooks/use-checkout';
import { useTheme } from '@/hooks/use-theme';
import { selectCartTotal, useCartStore } from '@/store/use-cart-store';

export default function CheckoutScreen() {
  const theme = useTheme();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const total = useCartStore(selectCartTotal);
  const { loading, error, result, submit } = useCheckout();

  useEffect(() => {
    if (result) {
      clearCart();
    }
  }, [result, clearCart]);

  if (result) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={styles.centerBox} edges={['bottom', 'left', 'right']}>
          <View style={[styles.successBadge, { backgroundColor: theme.secondary }]}>
            <ThemedText type="subtitle" themeColor="background">
              ✓
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.centerText}>
            Order Confirmed
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Order {result.orderId}
          </ThemedText>
          <ThemedText type="smallBold" themeColor="primary">
            ${result.total.toFixed(2)}
          </ThemedText>
          <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.secondary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" themeColor="background">
              Continue Shopping
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={styles.centerBox} edges={['bottom', 'left', 'right']}>
          <ActivityIndicator color={theme.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (items.length === 0) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={styles.centerBox} edges={['bottom', 'left', 'right']}>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Your cart is empty.
          </ThemedText>
          <Pressable
            onPress={() => router.push('/cart')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.secondary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" themeColor="background">
              Back to Cart
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle" style={styles.heading}>
            Order Summary
          </ThemedText>

          {items.map((item) => (
            <View key={item.book.id} style={styles.summaryRow}>
              <ThemedText type="default" style={styles.summaryTitle} numberOfLines={1}>
                {item.book.title} × {item.quantity}
              </ThemedText>
              <ThemedText type="smallBold" themeColor="primary">
                ${(item.book.price * item.quantity).toFixed(2)}
              </ThemedText>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: theme.backgroundElement }]}>
            <ThemedText type="default">Total</ThemedText>
            <ThemedText type="subtitle" themeColor="primary">
              ${total.toFixed(2)}
            </ThemedText>
          </View>

          {error && (
            <ThemedText themeColor="textSecondary" style={styles.errorText}>
              {error}
            </ThemedText>
          )}

          <Pressable
            onPress={() => submit(items)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.secondary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" themeColor="background">
              {error ? 'Retry' : 'Place Order'}
            </ThemedText>
          </Pressable>
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  heading: {
    marginBottom: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  summaryTitle: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
    paddingTop: Spacing.three,
  },
  errorText: {
    marginTop: Spacing.three,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});

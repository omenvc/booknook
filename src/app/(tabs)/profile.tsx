import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderHistoryRow } from '@/components/order-history-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeToggle } from '@/components/theme-toggle';
import { sharedStyles } from '@/constants/shared-styles';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrderHistoryStore } from '@/store/use-order-history-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const orders = useOrderHistoryStore((state) => state.orders);

  const totalBooks = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={sharedStyles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
            <ThemedText themeColor="textSecondary">Your reading activity and preferences.</ThemedText>
          </View>

          {orders.length > 0 && (
            <View style={styles.statsRow}>
              <StatTile value={String(orders.length)} label={orders.length === 1 ? 'Order' : 'Orders'} />
              <StatTile value={String(totalBooks)} label={totalBooks === 1 ? 'Book' : 'Books'} />
              <StatTile value={`$${totalSpent.toFixed(2)}`} label="Spent" />
            </View>
          )}

          <View style={styles.section}>
            <SectionHeading
              icon={{ ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' }}
              title="Appearance"
            />
            <ThemeToggle />
          </View>

          <View style={styles.section}>
            <SectionHeading
              icon={{ ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' }}
              title="Order History"
            />

            {orders.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyCard}>
                <SymbolView
                  name={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }}
                  size={28}
                  tintColor={theme.textSecondary}
                />
                <ThemedText themeColor="textSecondary" style={sharedStyles.centerText}>
                  No orders yet. Your completed orders will show up here.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/books')}
                  style={({ pressed }) => [
                    sharedStyles.pillButton,
                    { backgroundColor: theme.secondary },
                    pressed && sharedStyles.pressed,
                  ]}>
                  <ThemedText type="smallBold" themeColor="background">
                    Browse Books
                  </ThemedText>
                </Pressable>
              </ThemedView>
            ) : (
              orders.map((order) => <OrderHistoryRow key={order.orderId} order={order} />)
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.statTile}>
      <ThemedText type="subtitle" themeColor="primary" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function SectionHeading({ icon, title }: { icon: SymbolViewProps['name']; title: string }) {
  const theme = useTheme();

  return (
    <View style={styles.sectionHeadingRow}>
      <SymbolView name={icon} size={18} tintColor={theme.text} />
      <ThemedText type="subtitle">{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    paddingTop: Platform.select({ web: Spacing.six, default: Spacing.three }),
    paddingBottom: Spacing.two,
    gap: Spacing.half,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.half,
  },
  section: {
    marginTop: Spacing.five,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.five,
    gap: Spacing.three,
  },
});

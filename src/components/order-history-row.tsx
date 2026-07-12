import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Order } from '@/store/use-order-history-store';

type OrderHistoryRowProps = {
  order: Order;
};

const MAX_COVERS = 3;

export function OrderHistoryRow({ order }: OrderHistoryRowProps) {
  const theme = useTheme();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const date = new Date(order.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const covers = order.items.slice(0, MAX_COVERS);
  const extraBooks = order.items.length - covers.length;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.covers}>
        {covers.map((item, index) => (
          <Image
            key={item.book.id}
            source={{ uri: item.book.coverUrl }}
            style={[
              styles.cover,
              {
                backgroundColor: theme.tertiary,
                borderColor: theme.backgroundElement,
                marginLeft: index === 0 ? 0 : -Spacing.three,
                zIndex: covers.length - index,
              },
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ))}
        {extraBooks > 0 && (
          <View
            style={[
              styles.cover,
              styles.coverMore,
              { backgroundColor: theme.backgroundSelected, borderColor: theme.backgroundElement },
            ]}>
            <ThemedText type="small" themeColor="textSecondary">
              +{extraBooks}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.orderId}>
            {order.orderId}
          </ThemedText>
          <ThemedText type="smallBold" themeColor="primary">
            ${order.total.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="small" themeColor="textSecondary">
            {date}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  covers: {
    flexDirection: 'row',
  },
  cover: {
    width: 40,
    height: 56,
    borderRadius: Spacing.one,
    borderWidth: 2,
  },
  coverMore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    flex: 1,
    marginRight: Spacing.two,
  },
});

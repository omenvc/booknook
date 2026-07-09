import { StyleSheet, View } from 'react-native';

import type { StockStatus } from '@/api/books';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StockStatusBadgeProps = {
  status: StockStatus;
};

const STATUS_LABEL: Record<StockStatus, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const theme = useTheme();
  const color =
    status === 'in-stock'
      ? theme.secondary
      : status === 'low-stock'
        ? theme.primary
        : theme.textSecondary;

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="smallBold" style={{ color }}>
        {STATUS_LABEL[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    gap: Spacing.one,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

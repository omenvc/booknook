import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type StarRatingProps = {
  rating: number;
  size?: number;
};

const STAR_COUNT = 5;

export function StarRating({ rating, size = 14 }: StarRatingProps) {
  const theme = useTheme();
  const filledCount = Math.round(Math.min(Math.max(rating, 0), STAR_COUNT));

  return (
    <View style={styles.row} accessibilityLabel={`${rating} out of ${STAR_COUNT} stars`}>
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <ThemedText
          key={index}
          style={{
            fontSize: size,
            lineHeight: size + 2,
            color: index < filledCount ? theme.primary : theme.backgroundSelected,
          }}>
          {index < filledCount ? '★' : '☆'}
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});

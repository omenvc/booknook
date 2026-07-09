import { StyleSheet, View } from 'react-native';

import type { Review } from '@/api/books';
import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ReviewItemProps = {
  review: Review;
};

export function ReviewItem({ review }: ReviewItemProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.backgroundElement }]}>
      <View style={styles.header}>
        <ThemedText type="smallBold">{review.author}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {review.date}
        </ThemedText>
      </View>
      <StarRating rating={review.rating} />
      <ThemedText type="small" style={styles.comment}>
        {review.comment}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comment: {
    marginTop: Spacing.half,
  },
});

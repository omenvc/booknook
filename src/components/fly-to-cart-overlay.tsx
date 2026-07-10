import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BottomTabInset } from '@/constants/theme';
import type { FlyToCartOrigin } from '@/hooks/use-fly-to-cart';
import { useTheme } from '@/hooks/use-theme';

type Flight = {
  id: number;
  origin: FlyToCartOrigin;
};

type FlyToCartOverlayProps = {
  flights: Flight[];
  coverUrl: string;
  onComplete: (id: number) => void;
};

const DURATION = 500;
const COVER_SIZE = 48;

export function FlyToCartOverlay({ flights, coverUrl, onComplete }: FlyToCartOverlayProps) {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {flights.map((flight) => (
        <FlyingCover
          key={flight.id}
          origin={flight.origin}
          coverUrl={coverUrl}
          onComplete={() => onComplete(flight.id)}
        />
      ))}
    </View>
  );
}

function FlyingCover({
  origin,
  coverUrl,
  onComplete,
}: {
  origin: FlyToCartOrigin;
  coverUrl: string;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const progress = useSharedValue(0);

  // The cart tab icon isn't mounted at all on this screen (Book Details is a stack-pushed
  // route outside the (tabs) group, so the tab bar doesn't exist in the tree here, not just
  // in a different navigator). Approximate where it visually sits instead: the floating web
  // tab bar sits near the top; the native tab bar sits at the bottom. Cart is the second
  // (rightward) of the two tabs in both.
  const target = Platform.select({
    web: { x: windowWidth * 0.65, y: 40 },
    default: { x: windowWidth * 0.75, y: windowHeight - BottomTabInset / 2 },
  });

  const startX = origin.x + origin.width / 2 - COVER_SIZE / 2;
  const startY = origin.y + origin.height / 2 - COVER_SIZE / 2;
  const deltaX = target.x - startX;
  const deltaY = target.y - startY;

  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
    // Only the initial mount should start the flight; progress/onComplete are stable for the
    // lifetime of this instance (each flight gets its own component via a unique key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate via transform (translate/scale), not top/left directly — reanimated's web driver
  // reliably drives transform+opacity every frame, but layout-affecting properties like
  // top/left were visually unreliable here (the element would go invisible mid-flight).
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, deltaX]) },
      { translateY: interpolate(progress.value, [0, 1], [0, deltaY]) },
      { scale: interpolate(progress.value, [0, 1], [1, 0.35]) },
    ],
    opacity: interpolate(progress.value, [0, 0.75, 1], [1, 1, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.cover,
        { left: startX, top: startY, backgroundColor: theme.tertiary },
        animatedStyle,
      ]}>
      <Image
        source={{ uri: coverUrl }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

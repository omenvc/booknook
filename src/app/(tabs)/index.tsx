import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Book } from '@/api/books';
import { BookCard } from '@/components/book-card';
import { SearchInput } from '@/components/search-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useBookList } from '@/hooks/use-book-list';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';

export default function BookListScreen() {
  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebouncedValue(searchInput, 400);
  const { books, loading, loadingMore, error, loadMore, retry } = useBookList(searchQuery);

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookCard book={item} onPress={() => router.push(`/book/${item.id}`)} />
    ),
    []
  );

  const showFullScreenLoading = loading && books.length === 0;
  const showFullScreenError = !!error && books.length === 0;
  const showEmpty = !loading && !error && books.length === 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <SearchInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search books or authors"
          />
        </View>

        {showFullScreenLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.primary} />
          </View>
        )}

        {showFullScreenError && (
          <View style={styles.centerBox}>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {error}
            </ThemedText>
            <RetryButton onPress={retry} />
          </View>
        )}

        {!showFullScreenLoading && !showFullScreenError && (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              showEmpty ? (
                <View style={styles.centerBox}>
                  <ThemedText themeColor="textSecondary">No books found.</ThemedText>
                </View>
              ) : null
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : error && books.length > 0 ? (
                <View style={styles.footer}>
                  <ThemedText themeColor="textSecondary" style={styles.centerText}>
                    {error}
                  </ThemedText>
                  <RetryButton onPress={retry} />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function RetryButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.retryButton,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}>
      <ThemedText themeColor="background" type="smallBold">
        Retry
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.select({ web: Spacing.six, default: Spacing.three }),
    paddingBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.85,
  },
});

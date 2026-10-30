import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchMatches } from '../api/matches';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import type { MatchesResponse } from '../types/match';
import {
  FILTER_LABELS,
  filterMatches,
  searchMatches,
  type MatchFilter,
} from '../utils/matchFormat';

const FILTERS: MatchFilter[] = ['all', 'upcoming', 'finished'];

const EMPTY_TEXT: Record<MatchFilter, string> = {
  all: 'В этом туре пока нет матчей',
  upcoming: 'Предстоящих матчей нет',
  finished: 'Завершённых матчей пока нет',
};

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [data, setData] = useState<MatchesResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [query, setQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const { favorites, isFavorite, toggle } = useFavorites();

  const load = useCallback(async () => {
    // Новый запрос отменяет предыдущий, чтобы старый ответ не перезаписал свежий.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchMatches(controller.signal);
      setData(result);
      setUpdatedAt(new Date());
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const visibleMatches = useMemo(
    () => (data ? searchMatches(filterMatches(data.matches, filter), query) : []),
    [data, filter, query],
  );

  const emptyText = query.trim() ? `Ничего не найдено по «${query.trim()}»` : EMPTY_TEXT[filter];

  const title = data?.round ? `Матчи тура · ${data.round}` : 'Матчи тура';

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.center}>
          {error && !loading ? (
            <>
              <Text style={styles.errorText}>Не удалось загрузить матчи</Text>
              <Text style={styles.hint}>{error}</Text>
              <Pressable style={styles.button} onPress={load} accessibilityRole="button">
                <Text style={styles.buttonText}>Повторить</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator size="large" />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.toolbar}>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={load}
          disabled={loading}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{loading ? 'Обновляю…' : 'Обновить'}</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.errorText}>Не удалось обновить: {error}</Text>}

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Поиск по названию клуба"
        placeholderTextColor="#9ca3af"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filter, f === filter && styles.filterActive]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: f === filter }}
          >
            <Text style={[styles.filterText, f === filter && styles.filterTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visibleMatches}
        keyExtractor={(m) => m.id}
        extraData={favorites}
        renderItem={({ item }) => (
          <MatchCard match={item} isFavorite={isFavorite(item.id)} onToggleFavorite={toggle} />
        )}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<Text style={styles.hint}>{emptyText}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
  },
  hint: {
    color: '#6b7280',
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterText: {
    color: '#374151',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    gap: 8,
    paddingBottom: 16,
  },
});

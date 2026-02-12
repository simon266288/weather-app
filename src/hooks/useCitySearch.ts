/**
 * 城市搜索 Hook
 */
import { useState, useCallback, useRef } from 'react';
import { searchCities, type CitySearchItem } from '../services/api/weatherApi';
import { useCityStore } from '../stores/weatherStore';

/**
 * 防抖 Hook（用于函数）
 */
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

/**
 * 城市搜索 Hook
 */
export function useCitySearch() {
  const [results, setResults] = useState<CitySearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { addToSearchHistory } = useCityStore();

  // 搜索历史
  const { searchHistory, clearSearchHistory } = useCityStore();

  // 选择城市
  const { setCurrentCity } = useCityStore();

  // 立即更新 query（用于输入框显示）
  const setSearchQuery = useCallback((keyword: string) => {
    setQuery(keyword);
    if (!keyword || keyword.trim() === '') {
      setResults([]);
    }
  }, []);

  // 实际执行搜索（会被防抖）
  const doSearch = useCallback(async (keyword: string) => {
    if (!keyword || keyword.trim() === '') {
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const data = await searchCities({ query: keyword.trim(), limit: 10 });
      setResults(data);
    } catch (err) {
      setSearchError('搜索失败，请稍后重试');
      console.error('搜索城市失败:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 防抖的搜索函数
  const debouncedSearch = useDebouncedCallback(doSearch, 300);

  // 搜索入口：立即更新 query + 延迟搜索
  const search = useCallback((keyword: string) => {
    setSearchQuery(keyword);
    debouncedSearch(keyword);
  }, [setSearchQuery, debouncedSearch]);

  const selectCity = useCallback(
    (city: CitySearchItem) => {
      addToSearchHistory(city.name);
      setCurrentCity({
        id: `${city.lat}-${city.lon}`,
        name: city.name,
        province: city.state || '',
        district: undefined,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        order: 0,
      });
      setResults([]);
      setQuery('');
      return city;
    },
    [addToSearchHistory, setCurrentCity]
  );

  const clearSearch = useCallback(() => {
    setResults([]);
    setQuery('');
    setSearchError(null);
  }, []);

  return {
    query,
    results,
    isSearching,
    searchError,
    searchHistory,
    search,
    selectCity,
    clearSearch,
    clearSearchHistory,
  };
}

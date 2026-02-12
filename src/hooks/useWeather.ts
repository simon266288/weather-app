/**
 * 天气数据获取 Hook
 */
import { useCallback, useRef } from 'react';
import {
  getCurrentWeatherByLatLon,
  getForecastByLatLon,
  getCurrentWeatherByCity,
  getForecastByCity,
  WeatherApiError,
} from '../services/api/weatherApi';
import { getWeatherCache, setWeatherCache } from '../services/weatherCache';
import { useWeatherStore } from '../stores/weatherStore';

/**
 * 天气数据 Hook
 */
export function useWeather() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    currentWeather,
    forecastData,
    isLoading,
    isRefreshing,
    error,
    lastUpdateTime,
    setCurrentWeather,
    setForecastData,
    setLoading,
    setRefreshing,
    setError,
    updateLastUpdateTime,
  } = useWeatherStore();

  // 按经纬度获取天气数据
  const fetchWeatherByLatLon = useCallback(
    async (lat: number, lon: number) => {
      // 检查缓存
      const cached = getWeatherCache(lat, lon);
      if (cached && !isRefreshing) {
        setCurrentWeather(cached.weather);
        setForecastData(cached.forecast);
        return;
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const [weather, forecast] = await Promise.all([
          getCurrentWeatherByLatLon({ lat, lon }),
          getForecastByLatLon({ lat, lon }),
        ]);

        // 设置缓存
        setWeatherCache(lat, lon, weather, forecast);

        setCurrentWeather(weather);
        setForecastData(forecast);
        updateLastUpdateTime();
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // 请求被取消，不处理错误
        }
        const message =
          err instanceof WeatherApiError
            ? err.message
            : '获取天气数据失败，请稍后重试';
        setError(message);
        console.error('获取天气数据失败:', err);
      }
    },
    [setCurrentWeather, setForecastData, setLoading, setError, updateLastUpdateTime, isRefreshing]
  );

  // 按城市名称获取天气数据
  const fetchWeatherByCity = useCallback(
    async (city: string) => {
      // 检查缓存
      const cached = getWeatherCache(city);
      if (cached && !isRefreshing) {
        setCurrentWeather(cached.weather);
        setForecastData(cached.forecast);
        return;
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const [weather, forecast] = await Promise.all([
          getCurrentWeatherByCity(city),
          getForecastByCity(city),
        ]);

        // 设置缓存
        setWeatherCache(city, undefined, weather, forecast);

        setCurrentWeather(weather);
        setForecastData(forecast);
        updateLastUpdateTime();
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // 请求被取消，不处理错误
        }
        const message =
          err instanceof WeatherApiError
            ? err.message
            : '获取天气数据失败，请稍后重试';
        setError(message);
        console.error('获取天气数据失败:', err);
      }
    },
    [setCurrentWeather, setForecastData, setLoading, setError, updateLastUpdateTime, isRefreshing]
  );

  // 刷新天气数据
  const refresh = useCallback(
    async (lat?: number, lon?: number, cityNameOrPinyin?: string) => {
      if (!currentWeather) return;

      setRefreshing(true);
      try {
        // 如果传入了经纬度，使用经纬度获取
        if (lat !== undefined && lon !== undefined) {
          const [weather, forecast] = await Promise.all([
            getCurrentWeatherByLatLon({ lat, lon }),
            getForecastByLatLon({ lat, lon }),
          ]);
          // 更新缓存
          setWeatherCache(lat, lon, weather, forecast);
          setCurrentWeather(weather);
          setForecastData(forecast);
        } else {
          // 优先使用传入的城市名/拼音，否则使用当前天气数据中的城市名
          const city = cityNameOrPinyin || currentWeather.city;
          if (city) {
            const [w, f] = await Promise.all([
              getCurrentWeatherByCity(city),
              getForecastByCity(city),
            ]);
            // 更新缓存
            setWeatherCache(city, undefined, w, f);
            setCurrentWeather(w);
            setForecastData(f);
          }
        }
        updateLastUpdateTime();
      } catch (err) {
        console.error('刷新天气数据失败:', err);
      } finally {
        setRefreshing(false);
      }
    },
    [currentWeather, setCurrentWeather, setForecastData, setRefreshing, updateLastUpdateTime]
  );

  // 清除天气数据
  const clearWeather = useCallback(() => {
    setCurrentWeather(null);
    setForecastData(null);
    setError(null);
  }, [setCurrentWeather, setForecastData, setError]);

  return {
    currentWeather,
    forecastData,
    isLoading,
    isRefreshing,
    error,
    lastUpdateTime,
    fetchWeatherByLatLon,
    fetchWeatherByCity,
    refresh,
    clearWeather,
  };
}

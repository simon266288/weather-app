/**
 * 天气状态管理
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WeatherData, ForecastData } from '../services/api/weatherApi';

// 天气状态接口
interface WeatherState {
  // 当前天气数据
  currentWeather: WeatherData | null;
  forecastData: ForecastData | null;
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 错误状态
  error: string | null;
  
  // 上次更新时间
  lastUpdateTime: number | null;
  
  // Actions
  setCurrentWeather: (weather: WeatherData | null) => void;
  setForecastData: (forecast: ForecastData | null) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  updateLastUpdateTime: () => void;
  clearWeather: () => void;
}

// 创建天气状态 Store
export const useWeatherStore = create<WeatherState>()(
  (set) => ({
    // 初始状态
    currentWeather: null,
    forecastData: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdateTime: null,
    
    // Actions
    setCurrentWeather: (weather) => set({ currentWeather: weather, error: null }),
    setForecastData: (forecast) => set({ forecastData: forecast }),
    setLoading: (loading) => set({ isLoading: loading }),
    setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
    setError: (error) => set({ error, isLoading: false, isRefreshing: false }),
    updateLastUpdateTime: () => set({ lastUpdateTime: Date.now() }),
    clearWeather: () => set({
      currentWeather: null,
      forecastData: null,
      error: null,
      lastUpdateTime: null,
    }),
  })
);

// 收藏城市接口
export interface FavoriteCity {
  id: string;
  name: string;        // 市/区
  province: string;    // 省/自治区
  district?: string;   // 区/县（可选）
  country: string;
  lat: number;
  lon: number;
  order: number;
  temperature?: number; // 当前温度
  weatherIcon?: string; // 天气图标
  pinyin?: string;      // 拼音（用于 API 调用）
}

// 城市状态接口
interface CityState {
  // 当前城市
  currentCity: FavoriteCity | null;

  // 收藏城市列表
  favoriteCities: FavoriteCity[];

  // 搜索历史
  searchHistory: string[];

  // Actions
  setCurrentCity: (city: FavoriteCity | null) => void;
  addFavoriteCity: (city: FavoriteCity) => void;
  removeFavoriteCity: (cityId: string) => void;
  updateFavoriteCityTemperature: (cityId: string, temperature: number, icon?: string) => void;
  reorderFavoriteCities: (cities: FavoriteCity[]) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

// 创建城市状态 Store（带持久化）
export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      // 初始状态
      currentCity: null,
      favoriteCities: [],
      searchHistory: [],
      
      // Actions
      setCurrentCity: (city) => set({ currentCity: city }),
      
      addFavoriteCity: (city) =>
        set((state) => ({
          favoriteCities: [...state.favoriteCities, city].map((c, i) => ({
            ...c,
            order: i,
          })),
        })),
      
      removeFavoriteCity: (cityId) =>
        set((state) => ({
          favoriteCities: state.favoriteCities
            .filter((c) => c.id !== cityId)
            .map((c, i) => ({ ...c, order: i })),
        })),

      updateFavoriteCityTemperature: (cityId, temperature, icon) =>
        set((state) => ({
          favoriteCities: state.favoriteCities.map((c) =>
            c.id === cityId
              ? { ...c, temperature, weatherIcon: icon }
              : c
          ),
        })),

      reorderFavoriteCities: (cities) =>
        set({ favoriteCities: cities.map((c, i) => ({ ...c, order: i })) }),
      
      addToSearchHistory: (query) =>
        set((state) => ({
          searchHistory: [
            query,
            ...state.searchHistory.filter((q) => q !== query),
          ].slice(0, 10),
        })),
      
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'weather-city-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteCities: state.favoriteCities,
        searchHistory: state.searchHistory,
      }),
    }
  )
);

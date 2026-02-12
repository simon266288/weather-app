/**
 * 收藏城市 Hook
 */
import { useCallback } from 'react';
import { useCityStore, type FavoriteCity } from '../stores/weatherStore';
import { v4 as uuidv4 } from 'uuid';

/**
 * 收藏城市 Hook
 */
export function useFavorites() {
  const {
    favoriteCities,
    addFavoriteCity,
    removeFavoriteCity,
    updateFavoriteCityTemperature,
    reorderFavoriteCities,
  } = useCityStore();

  // 添加收藏
  const add = useCallback(
    (city: Omit<FavoriteCity, 'id' | 'order'>) => {
      const newCity: FavoriteCity = {
        ...city,
        id: uuidv4(),
        order: favoriteCities.length,
      };
      addFavoriteCity(newCity);
      return newCity;
    },
    [favoriteCities, addFavoriteCity]
  );

  // 移除收藏
  const remove = useCallback(
    (cityId: string) => {
      removeFavoriteCity(cityId);
    },
    [removeFavoriteCity]
  );

  // 更新收藏城市温度
  const updateTemperature = useCallback(
    (cityId: string, temperature: number, icon?: string) => {
      updateFavoriteCityTemperature(cityId, temperature, icon);
    },
    [updateFavoriteCityTemperature]
  );

  // 切换收藏状态
  const toggle = useCallback(
    (city: Omit<FavoriteCity, 'id' | 'order'>): boolean => {
      const exists = favoriteCities.some(
        (c) => c.lat === city.lat && c.lon === city.lon
      );

      if (exists) {
        const existingCity = favoriteCities.find(
          (c) => c.lat === city.lat && c.lon === city.lon
        );
        if (existingCity) {
          remove(existingCity.id);
        }
        return false;
      } else {
        add(city);
        return true;
      }
    },
    [favoriteCities, add, remove]
  );

  // 检查是否已收藏
  const isFavorite = useCallback(
    (lat: number, lon: number): boolean => {
      return favoriteCities.some((c) => c.lat === lat && c.lon === lon);
    },
    [favoriteCities]
  );

  // 获取收藏城市
  const getFavorite = useCallback(
    (lat: number, lon: number): FavoriteCity | undefined => {
      return favoriteCities.find((c) => c.lat === lat && c.lon === lon);
    },
    [favoriteCities]
  );

  // 排序
  const reorder = useCallback(
    (cities: FavoriteCity[]) => {
      reorderFavoriteCities(cities);
    },
    [reorderFavoriteCities]
  );

  return {
    favorites: favoriteCities,
    count: favoriteCities.length,
    add,
    remove,
    updateTemperature,
    toggle,
    isFavorite,
    getFavorite,
    reorder,
  };
}

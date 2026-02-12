/**
 * 地理位置信息 Hook
 */
import { useCallback } from 'react';
import { reverseGeocode } from '../services/api/weatherApi';
import type { FavoriteCity } from '../stores/weatherStore';

interface UseGeocodingReturn {
  getLocationInfo: (lat: number, lon: number) => Promise<FavoriteCity | null>;
}

/**
 * 地理位置编码 Hook
 */
export function useGeocoding(): UseGeocodingReturn {
  /**
   * 根据经纬度获取城市信息
   */
  const getLocationInfo = useCallback(async (lat: number, lon: number): Promise<FavoriteCity | null> => {
    try {
      const result = await reverseGeocode({ lat, lon });

      if (result && result.length > 0) {
        const location = result[0];
        // OpenWeatherMap 返回的 state 字段包含省/州信息，name 是城市/区县
        // 例如：state: "Beijing", name: "Haidian District"
        return {
          id: `gps-${lat.toFixed(4)}-${lon.toFixed(4)}`,
          name: location.name || '未知城市',
          province: location.state || location.country || '未知省份',
          district: undefined,
          country: location.country || 'CN',
          lat,
          lon,
          order: 0,
        };
      }

      // 如果没有返回结果，创建一个基本的城市对象
      return {
        id: `gps-${lat.toFixed(4)}-${lon.toFixed(4)}`,
        name: '未知城市',
        province: '未知省份',
        district: undefined,
        country: 'CN',
        lat,
        lon,
        order: 0,
      };
    } catch (error) {
      console.error('获取地理位置信息失败:', error);
      // 返回基本对象而不是null，避免错误处理
      return {
        id: `gps-${lat.toFixed(4)}-${lon.toFixed(4)}`,
        name: '定位失败',
        province: '未知',
        district: undefined,
        country: 'CN',
        lat,
        lon,
        order: 0,
      };
    }
  }, []);

  return {
    getLocationInfo,
  };
}

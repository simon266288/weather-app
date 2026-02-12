/**
 * 天气数据缓存服务
 */
const CACHE_KEY = 'weather_data_cache';
const DEFAULT_CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

interface CachedData {
  [key: string]: {
    weather: any;
    forecast: any;
    timestamp: number;
  };
}

/**
 * 获取缓存键 - 按经纬度
 */
function getCacheKeyByLatLon(lat: number, lon: number): string {
  return `lat:${lat.toFixed(4)},${lon.toFixed(4)}`;
}

/**
 * 获取缓存键 - 按城市名
 */
function getCacheKeyByCity(city: string): string {
  return `city:${city.toLowerCase()}`;
}

/**
 * 获取缓存数据
 */
export function getWeatherCache(
  latOrCity: number | string,
  lon?: number
): { weather: any; forecast: any } | null {
  try {
    let key: string;
    if (typeof latOrCity === 'number' && lon !== undefined) {
      key = getCacheKeyByLatLon(latOrCity, lon);
    } else if (typeof latOrCity === 'string') {
      key = getCacheKeyByCity(latOrCity);
    } else {
      return null;
    }

    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const entry = data[key];

    if (!entry) return null;

    // 检查缓存是否过期
    const now = Date.now();
    if (now - entry.timestamp > DEFAULT_CACHE_DURATION) {
      // 缓存已过期，删除
      delete data[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return null;
    }

    return {
      weather: entry.weather,
      forecast: entry.forecast,
    };
  } catch (error) {
    console.error('读取缓存失败:', error);
    return null;
  }
}

/**
 * 设置缓存数据
 */
export function setWeatherCache(
  latOrCity: number | string,
  lon: number | undefined,
  weather: any,
  forecast: any
): void {
  try {
    let key: string;
    if (typeof latOrCity === 'number' && lon !== undefined) {
      key = getCacheKeyByLatLon(latOrCity, lon);
    } else if (typeof latOrCity === 'string') {
      key = getCacheKeyByCity(latOrCity);
    } else {
      return;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    const data: CachedData = cached ? JSON.parse(cached) : {};

    data[key] = {
      weather,
      forecast,
      timestamp: Date.now(),
    };

    // 限制缓存条目数量，最多50个城市
    const keys = Object.keys(data);
    if (keys.length > 50) {
      // 删除最早的条目
      const sortedKeys = keys.sort(
        (a, b) => data[a].timestamp - data[b].timestamp
      );
      const toDelete = sortedKeys.slice(0, keys.length - 50);
      toDelete.forEach((k) => delete data[k]);
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('写入缓存失败:', error);
  }
}

/**
 * 清除所有缓存
 */
export function clearWeatherCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
}

/**
 * 获取缓存剩余有效期（毫秒）
 */
export function getCacheRemainingTime(
  latOrCity: number | string,
  lon?: number
): number {
  try {
    let key: string;
    if (typeof latOrCity === 'number' && lon !== undefined) {
      key = getCacheKeyByLatLon(latOrCity, lon);
    } else if (typeof latOrCity === 'string') {
      key = getCacheKeyByCity(latOrCity);
    } else {
      return 0;
    }

    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) return 0;

    const data: CachedData = JSON.parse(cached);
    const entry = data[key];

    if (!entry) return 0;

    const remaining = DEFAULT_CACHE_DURATION - (Date.now() - entry.timestamp);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

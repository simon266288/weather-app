/**
 * OpenWeatherMap 天气 API 服务
 * 文档: https://openweathermap.org/api
 */

// ==================== 类型定义 ====================

/**
 * 天气条件信息
 */
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

/**
 * 温度信息
 */
export interface Temperature {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

/**
 * 风力信息
 */
export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

/**
 * 能见度信息
 */
export interface Visibility {
  visibility: number;
}

/**
 * 云量信息
 */
export interface Clouds {
  all: number;
}

/**
 * 太阳信息
 */
export interface SunInfo {
  sunrise: number;
  sunset: number;
}

/**
 * 系统信息
 */
export interface SysInfo {
  country: string;
  id: number;
  sunrise: number;
  sunset: number;
  type: number;
}

/**
 * 城市信息
 */
export interface CityInfo {
  id: number;
  name: string;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

/**
 * 当前天气响应
 */
export interface CurrentWeatherResponse {
  weather: WeatherCondition[];
  main: Temperature;
  wind: Wind;
  visibility: number;
  clouds: Clouds;
  sys: SysInfo;
  base: string;
  dt: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * 天气数据
 */
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  description: string;
  icon: string;
  visibility: number;
  sunrise: number;
  sunset: number;
  updateTime: number;
}

/**
 * 单个预报数据点
 */
export interface ForecastItem {
  dt: number;
  main: Temperature;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  dt_txt: string;
}

/**
 * 预报响应
 */
export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: CityInfo;
}

/**
 * 每日预报汇总
 */
export interface DailyForecast {
  date: string;
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  tempHigh: number;
  tempLow: number;
  description: string;
  icon: string;
  pop: number;
}

/**
 * 预报数据
 */
export interface ForecastData {
  city: string;
  country: string;
  dailyForecasts: DailyForecast[];
  updateTime: number;
}

/**
 * 搜索城市项
 */
export interface CitySearchItem {
  name: string;
  local_names: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * API 错误类型
 */
export type ApiErrorType =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'INVALID_API_KEY'
  | 'CITY_NOT_FOUND'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * API 错误
 */
export class WeatherApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
  originalError?: Error;

  constructor(
    type: ApiErrorType,
    message: string,
    statusCode?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'WeatherApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * 搜索参数
 */
export interface SearchParams {
  query: string;
  limit?: number;
}

/**
 * 经纬度参数
 */
export interface LatLonParams {
  lat: number;
  lon: number;
}

// ==================== 配置 ====================

const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org',
  ENDPOINTS: {
    CURRENT_WEATHER: '/data/2.5/weather',
    FORECAST: '/data/2.5/forecast',
    GEOCODING: '/geo/1.0/direct',
    REVERSE_GEOCODING: '/geo/1.0/reverse',
  },
  TIMEOUT: 10000,
  UNITS: 'metric' as const,
  LANGUAGE: 'zh_cn' as const,
};

function getApiKey(): string {
  const apiKey = import.meta.env?.VITE_OPENWEATHERMAP_API_KEY || '';

  if (!apiKey) {
    throw new WeatherApiError(
      'INVALID_API_KEY',
      'API 密钥未配置，请设置 VITE_OPENWEATHERMAP_API_KEY 环境变量'
    );
  }

  return apiKey;
}

function buildQueryParams(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

// ==================== API 调用函数 ====================

async function fetchApi<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);

  params.appid = apiKey;
  params.units = API_CONFIG.UNITS;
  params.lang = API_CONFIG.LANGUAGE;

  const queryString = buildQueryParams(params);
  url.search = queryString;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorType = getErrorType(response.status);
      throw new WeatherApiError(
        errorType,
        `API 请求失败: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json() as T;
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof WeatherApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new WeatherApiError(
        'NETWORK_ERROR',
        '网络请求失败，请检查网络连接',
        undefined,
        error as Error
      );
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherApiError(
        'TIMEOUT_ERROR',
        'API 请求超时，请稍后重试'
      );
    }

    throw new WeatherApiError(
      'UNKNOWN_ERROR',
      `未知错误: ${(error as Error).message}`,
      undefined,
      error as Error
    );
  }
}

function getErrorType(status: number): ApiErrorType {
  switch (status) {
    case 401:
      return 'INVALID_API_KEY';
    case 429:
      return 'RATE_LIMIT_ERROR';
    case 404:
      return 'CITY_NOT_FOUND';
    case 500:
    case 502:
    case 503:
      return 'SERVER_ERROR';
    default:
      return 'SERVER_ERROR';
  }
}

// ==================== 天气数据 API ====================

export async function getCurrentWeatherByLatLon(
  params: LatLonParams
): Promise<WeatherData> {
  const data = await fetchApi<CurrentWeatherResponse>(
    API_CONFIG.ENDPOINTS.CURRENT_WEATHER,
    {
      lat: params.lat,
      lon: params.lon,
    }
  );

  return transformCurrentWeather(data);
}

export async function getCurrentWeatherByCity(
  city: string
): Promise<WeatherData> {
  const data = await fetchApi<CurrentWeatherResponse>(
    API_CONFIG.ENDPOINTS.CURRENT_WEATHER,
    {
      q: city,
    }
  );

  return transformCurrentWeather(data);
}

function transformCurrentWeather(data: CurrentWeatherResponse): WeatherData {
  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    pressure: data.main.pressure,
    description: data.weather[0]?.description || '',
    icon: data.weather[0]?.icon || '',
    visibility: data.visibility,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    updateTime: data.dt,
  };
}

// ==================== 预报 API ====================

export async function getForecastByLatLon(
  params: LatLonParams
): Promise<ForecastData> {
  const data = await fetchApi<ForecastResponse>(
    API_CONFIG.ENDPOINTS.FORECAST,
    {
      lat: params.lat,
      lon: params.lon,
      cnt: 40,
    }
  );

  return transformForecast(data);
}

export async function getForecastByCity(city: string): Promise<ForecastData> {
  const data = await fetchApi<ForecastResponse>(
    API_CONFIG.ENDPOINTS.FORECAST,
    {
      q: city,
      cnt: 40,
    }
  );

  return transformForecast(data);
}

function transformForecast(data: ForecastResponse): ForecastData {
  const dailyMap = new Map<string, DailyForecast>();

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = getDayOfWeek(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const existing = dailyMap.get(dateStr);

    if (!existing) {
      const dayItems = data.list.filter(
        (i) => new Date(i.dt * 1000).toISOString().split('T')[0] === dateStr
      );

      const temps = dayItems.map((i) => i.main.temp);
      const pops = dayItems.map((i) => i.pop);
      const descriptions = dayItems.map((i) => i.weather[0]?.description || '');
      const icons = dayItems.map((i) => i.weather[0]?.icon || '');

      dailyMap.set(dateStr, {
        date: dateStr,
        year,
        month,
        day,
        dayOfWeek,
        tempHigh: Math.round(Math.max(...temps)),
        tempLow: Math.round(Math.min(...temps)),
        description: descriptions[Math.floor(descriptions.length / 2)] || '',
        icon: icons[Math.floor(icons.length / 2)] || '',
        pop: Math.max(...pops) * 100,
      });
    }
  });

  const dailyForecasts = Array.from(dailyMap.values()).slice(0, 7);

  return {
    city: data.city.name,
    country: data.city.country,
    dailyForecasts,
    updateTime: Date.now() / 1000,
  };
}

function getDayOfWeek(date: Date): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

// ==================== 地理编码 API ====================

export async function searchCities(
  params: SearchParams
): Promise<CitySearchItem[]> {
  const data = await fetchApi<CitySearchItem[]>(
    API_CONFIG.ENDPOINTS.GEOCODING,
    {
      q: params.query,
      limit: params.limit || 10,
    }
  );

  return data;
}

export async function reverseGeocode(
  params: LatLonParams
): Promise<CitySearchItem[]> {
  const data = await fetchApi<CitySearchItem[]>(
    API_CONFIG.ENDPOINTS.REVERSE_GEOCODING,
    {
      lat: params.lat,
      lon: params.lon,
      limit: 1,
    }
  );

  return data;
}

// ==================== 工具函数 ====================

export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(temp * 9 / 5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

export function getWindDirectionDescription(deg: number): string {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function getWeatherIconUrlLarge(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@4x.png`;
}

// ==================== 导出 ====================

export default {
  getCurrentWeatherByLatLon,
  getCurrentWeatherByCity,
  getForecastByLatLon,
  getForecastByCity,
  searchCities,
  reverseGeocode,
  formatTemperature,
  getWindDirectionDescription,
  getWeatherIconUrl,
  getWeatherIconUrlLarge,
  WeatherApiError,
};

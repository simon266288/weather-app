/**
 * 侧边栏组件（收藏城市）- 支持抽屉式
 */
import { useState } from 'react';
import { Search, X, Navigation, Clock, TrendingUp, Trash2 } from 'lucide-react';
import { WeatherIcon } from '../weather/WeatherIcon';
import { useFavorites } from '../../hooks/useFavorites';
import { useWeather } from '../../hooks/useWeather';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useGeocoding } from '../../hooks/useGeocoding';
import { useCityStore, type FavoriteCity } from '../../stores/weatherStore';

import { useCitySearch } from '../../hooks/useCitySearch';
import { translateCityName } from '../../utils/cityNameMap';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { favorites, remove } = useFavorites();
  const { fetchWeatherByLatLon } = useWeather();
  const { requestLocation, isLoading: isLocating } = useGeolocation();
  const { getLocationInfo } = useGeocoding();
  const { currentCity, setCurrentCity } = useCityStore();

  // 搜索相关
  const {
    query,
    results,
    isSearching,
    search,
    clearSearch,
    searchHistory,
    clearSearchHistory,
  } = useCitySearch();

  // 热门城市列表
  const hotCities = [
    { name: '北京', pinyin: 'beijing' },
    { name: '上海', pinyin: 'shanghai' },
    { name: '广州', pinyin: 'guangzhou' },
    { name: '深圳', pinyin: 'shenzhen' },
    { name: '杭州', pinyin: 'hangzhou' },
    { name: '成都', pinyin: 'chengdu' },
    { name: '西安', pinyin: 'xian' },
    { name: '武汉', pinyin: 'wuhan' },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
  };

  const handleSelectCity = (city: any) => {
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
    setIsSearchOpen(false);
    clearSearch();
  };

  // 处理热门城市点击 - 直接切换城市
  const handleSelectHotCity = (city: { name: string; pinyin: string }) => {
    setCurrentCity({
      id: `hot-${city.pinyin}`,
      name: city.name,        // 显示中文名
      pinyin: city.pinyin,    // 用于 API 调用
      province: '',
      district: undefined,
      country: 'CN',
      lat: 0,
      lon: 0,
      order: 0,
    });
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleGetLocation = async () => {
    const pos = await requestLocation();
    if (pos) {
      // 先通过反向地理编码获取城市信息
      const locationInfo = await getLocationInfo(pos.latitude, pos.longitude);
      if (locationInfo) {
        // 更新当前城市
        setCurrentCity(locationInfo);
      }
      // 获取天气数据
      fetchWeatherByLatLon(pos.latitude, pos.longitude);
    }
  };

  const handleCityClick = (city: FavoriteCity) => {
    setCurrentCity(city);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`
      flex-shrink-0 bg-primary/5 h-screen flex flex-col theme-transition
      ${isMobile 
        ? `fixed left-0 top-0 w-72 transform transition-transform duration-300 z-50 ${isOpen ? '' : '-translate-x-full'}`
        : 'relative w-64 z-0'
      }
    `}>
      <div className="flex flex-col h-full p-4">
          {/* 移动端关闭按钮 */}
          {isMobile && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="icon-btn-flat !w-10 !h-10"
                aria-label="关闭菜单"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        {/* 搜索框和定位按钮 */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="btn-flat flex-1 flex items-center justify-center gap-2 py-3"
          >
            <Search className="h-4 w-4 text-tertiary" />
            <span className="text-tertiary font-medium">搜索城市...</span>
          </button>
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="icon-btn-flat !w-11 !h-11 flex-shrink-0"
            title="获取当前位置"
            aria-label={isLocating ? "正在定位..." : "获取当前位置"}
          >
            <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 收藏城市列表 */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold text-primary/80 mb-3 px-1">
            喜欢的城市
          </h3>

          {favorites.length === 0 ? (
            <div className="card-flat p-4 text-center">
              <p className="text-tertiary text-sm">暂无收藏城市</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((city) => (
                <div
                  key={city.id}
                  className={`card-flat p-4 flex items-center gap-4 cursor-pointer transition-all group ${
                    currentCity?.id === city.id ? 'bg-primary/5 border-2 border-primary/30' : ''
                  }`}
                  onClick={() => handleCityClick(city)}
                >
                  {/* 天气图标 - 使用 SVG 组件，配对应颜色背景 */}
                  {city.weatherIcon ? (
                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${getWeatherIconBg(city.weatherIcon)}`}>
                      <WeatherIcon icon={city.weatherIcon} size="sm" className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-xl">
                      <span className="text-gray-400 text-lg">-</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* 城市名称 - 增大字号 */}
                    <div className="font-semibold text-primary text-base truncate">
                      {city.province && city.province !== city.name ? (
                        <span>
                          <span className="text-secondary">{translateCityName(city.province)}</span>
                          <span className="text-tertiary mx-1">/</span>
                          <span>{translateCityName(city.name)}</span>
                        </span>
                      ) : (
                        <span>{translateCityName(city.name)}</span>
                      )}
                    </div>

                    {/* 温度和天气描述 */}
                    <div className="flex items-center gap-2 mt-1">
                      {city.temperature !== undefined ? (
                        <span className="text-xl font-bold text-primary">{city.temperature}°</span>
                      ) : (
                        <span className="text-sm text-tertiary">点击加载</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(city.id);
                    }}
                    className="icon-btn-flat !w-10 !h-10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label={`删除 ${translateCityName(city.name)}`}
                  >
                    <X className="h-4 w-4 text-error" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 搜索弹窗 */}
      {isSearchOpen && (
        <div className={`
          fixed inset-0 z-[99999] flex
          ${isMobile ? 'items-end' : 'items-start justify-center pt-20'}
        `}>
          {/* 遮罩层 */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* 弹窗内容 - 确保层级最高 */}
          <div className={`
            relative neumorph-card bg-card flex flex-col max-h-[85vh] z-[99999]
            ${isMobile
              ? 'w-full rounded-t-2xl animate-slide-up'
              : 'w-full max-w-md rounded-2xl mx-4'
            }
          `}>
            {/* 移动端拖动条 */}
            {isMobile && (
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-secondary rounded-full" />
              </div>
            )}
            
            {/* 搜索头部 */}
            <div className="flex items-center gap-2 p-4 border-b border-secondary/50">
              <Search className="h-5 w-5 text-tertiary flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="搜索城市..."
                className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-tertiary text-base"
                autoFocus
              />
              {query ? (
                <button
                  onClick={clearSearch}
                  className="icon-btn-flat !w-10 !h-10 flex-shrink-0"
                  aria-label="清除搜索"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-sm text-secondary hover:text-primary px-2"
                >
                  取消
                </button>
              )}
            </div>

            {/* 搜索结果区域 */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 搜索结果 */}
              {isSearching ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-2" />
                  <p className="text-sm text-secondary">搜索中...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((city: any) => (
                    <button
                      key={`${city.lat}-${city.lon}`}
                      onClick={() => handleSelectCity(city)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary active:bg-secondary/70 rounded-lg transition-colors text-left"
                    >
                      <span className="text-2xl">
                        {getFlagEmoji(city.country)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary truncate">{translateCityName(city.name)}</div>
                        <div className="text-sm text-secondary">{city.state ? translateCityName(city.state) : city.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="p-8 text-center">
                  <p className="text-secondary mb-2">未找到 "{query}" 相关城市</p>
                  <p className="text-sm text-tertiary">请尝试输入城市拼音或英文名</p>
                </div>
              ) : (
                /* 搜索历史和热门城市 */
                <div className="space-y-6">
                  {/* 搜索历史 */}
                  {searchHistory.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-secondary flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          最近搜索
                        </h4>
                        <button
                          onClick={clearSearchHistory}
                          className="text-xs text-tertiary hover:text-error flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          清空
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((cityName) => (
                          <button
                            key={cityName}
                            onClick={() => search(cityName)}
                            className="px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary active:bg-secondary/70 rounded-full transition-colors"
                          >
                            {cityName}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 分割线 */}
                  {searchHistory.length > 0 && <div className="border-t border-secondary/50" />}

                  {/* 热门城市 */}
                  <section>
                    <h4 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      热门城市
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {hotCities.map((city) => (
                        <button
                          key={city.pinyin}
                          onClick={() => handleSelectHotCity(city)}
                          className="p-2.5 text-sm bg-secondary/30 text-primary hover:bg-[#4A90E2] hover:text-white hover:shadow-md active:bg-[#3A7BC8] rounded-lg transition-all text-center font-medium"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </aside>
  );
}

// 获取国旗表情
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// 根据天气图标获取对应背景色
function getWeatherIconBg(icon: string): string {
  if (icon.includes('01')) {
    // 晴天 - 暖黄色背景
    return 'bg-orange-100';
  } else if (icon.includes('02')) {
    // 少云 - 淡黄色背景
    return 'bg-yellow-50';
  } else if (icon.includes('03') || icon.includes('04')) {
    // 多云/阴天 - 灰色背景
    return 'bg-gray-100';
  } else if (icon.includes('09') || icon.includes('10')) {
    // 雨天 - 蓝色背景
    return 'bg-blue-50';
  } else if (icon.includes('11')) {
    // 雷暴 - 深灰色背景
    return 'bg-gray-200';
  } else if (icon.includes('13')) {
    // 雪天 - 浅蓝色背景
    return 'bg-sky-50';
  } else if (icon.includes('50')) {
    // 雾天 - 浅灰色背景
    return 'bg-gray-50';
  }
  return 'bg-gray-100';
}

/**
 * 主页
 */
import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { CurrentWeather } from '../components/weather/CurrentWeather';
import { ForecastList } from '../components/weather/ForecastList';
import { TemperatureChart } from '../components/chart/TemperatureChart';
import { useWeather } from '../hooks/useWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { useGeocoding } from '../hooks/useGeocoding';
import { useFavorites } from '../hooks/useFavorites';
import { useCityStore } from '../stores/weatherStore';
import { SkeletonCard } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { RefreshCw, Menu } from 'lucide-react';
import { translateCityName } from '../utils/cityNameMap';
import { useIsMobile } from '../hooks/useMediaQuery';
import { getWeatherCache } from '../services/weatherCache';

export function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const initializedRef = useRef(false);

  const {
    currentWeather,
    forecastData,
    isLoading,
    isRefreshing,
    error,
    fetchWeatherByCity,
    fetchWeatherByLatLon,
    refresh,
  } = useWeather();
  const { requestLocation } = useGeolocation();
  const { getLocationInfo } = useGeocoding();
  const { favorites, add, remove, updateTemperature } = useFavorites();
  const { currentCity, setCurrentCity } = useCityStore();

  // 初始化加载 - 优化首屏体验
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initLocation = async () => {
      // 1. 立即尝试加载最后访问的城市缓存
      const lastCity = localStorage.getItem('last_visited_city');
      if (lastCity) {
        try {
          const cityData = JSON.parse(lastCity);
          setCurrentCity(cityData);
          // 如果有缓存天气，直接使用
          const cached = getWeatherCache(
            cityData.lat || 0,
            cityData.lon || 0
          );
          if (cached) {
            // 缓存会在 fetchWeatherByLatLon 中自动读取
            if (cityData.lat !== 0 && cityData.lon !== 0) {
              fetchWeatherByLatLon(cityData.lat, cityData.lon);
            } else {
              fetchWeatherByCity(cityData.pinyin || cityData.name);
            }
          }
        } catch (e) {
          console.error('加载上次城市失败:', e);
        }
      }

      // 2. 并行请求 GPS 定位
      const pos = await requestLocation();
      if (pos) {
        const locationInfo = await getLocationInfo(pos.latitude, pos.longitude);
        if (locationInfo) {
          setCurrentCity(locationInfo);
          fetchWeatherByLatLon(pos.latitude, pos.longitude);
        }
      }
      // 3. 如果没有缓存且 GPS 失败，加载默认城市（北京）
      if (!lastCity) {
        setCurrentCity({
          id: 'default-beijing',
          name: '北京',
          province: '',
          district: undefined,
          country: 'CN',
          lat: 0,
          lon: 0,
          order: 0,
          pinyin: 'beijing',
        });
        fetchWeatherByCity('beijing');
      }
    };

    initLocation();
  }, []);

  // 保存最后访问的城市
  useEffect(() => {
    if (currentCity) {
      try {
        localStorage.setItem('last_visited_city', JSON.stringify(currentCity));
      } catch (e) {
        console.error('保存城市失败:', e);
      }
    }
  }, [currentCity]);

  // 当前城市变化时加载天气（排除初始加载）
  const previousCityIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentCity || currentCity.id === previousCityIdRef.current) {
      return;
    }
    previousCityIdRef.current = currentCity.id;

    if (currentCity.lat !== 0 && currentCity.lon !== 0) {
      fetchWeatherByLatLon(currentCity.lat, currentCity.lon);
    } else {
      const cityName = currentCity.pinyin || currentCity.name;
      fetchWeatherByCity(cityName);
    }
  }, [currentCity, fetchWeatherByLatLon, fetchWeatherByCity]);

  // 获取天气数据后，更新收藏城市的温度，并设置当前城市
  const previousWeatherRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentWeather && currentWeather.city !== previousWeatherRef.current) {
      previousWeatherRef.current = currentWeather.city;

      // 如果 currentCity 还没有设置，用 API 返回的城市名设置
      if (!currentCity) {
        setCurrentCity({
          id: `default-${currentWeather.city}`,
          name: currentWeather.city,
          province: '',
          district: undefined,
          country: currentWeather.country,
          lat: 0,
          lon: 0,
          order: 0,
          temperature: currentWeather.temperature,
          weatherIcon: currentWeather.icon,
        });
      }

      // 查找当前城市是否在收藏中
      const fav = favorites.find((f) => f.name === currentWeather.city);
      if (fav && (fav.temperature !== currentWeather.temperature || fav.weatherIcon !== currentWeather.icon)) {
        updateTemperature(fav.id, currentWeather.temperature, currentWeather.icon);
      }
    }
  }, [currentWeather?.city, currentWeather?.temperature, currentWeather?.icon, currentCity, favorites, updateTemperature, setCurrentCity]);

  const handleRefresh = () => {
    if (currentCity) {
      if (currentCity.lat !== 0 && currentCity.lon !== 0) {
        refresh(currentCity.lat, currentCity.lon);
      } else {
        // 优先使用拼音，否则使用名称
        refresh(undefined, undefined, currentCity.pinyin || currentCity.name);
      }
    }
  };

  const handleAddToFavorites = () => {
    if (currentWeather && currentCity) {
      add({
        name: currentCity.name,
        province: currentCity.province || '',
        district: currentCity.district,
        country: currentWeather.country,
        lat: currentCity.lat || 0,
        lon: currentCity.lon || 0,
        temperature: currentWeather.temperature,
        weatherIcon: currentWeather.icon,
        pinyin: currentCity.pinyin,
      });
    }
  };

  const handleRemoveFromFavorites = () => {
    if (currentCity) {
      const fav = favorites.find((f) => f.name === currentCity.name);
      if (fav) {
        remove(fav.id);
      }
    }
  };

  if (isLoading && !currentWeather) {
    return (
      <div className="min-h-screen bg-primary theme-transition">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              <SkeletonCard />
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SkeletonCard />
                </div>
                <div>
                  <SkeletonCard />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center theme-transition">
        <div className="text-center">
          <p className="text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      </div>
    );
  }

  // 格式化城市显示（使用中文）
  const formatCityName = () => {
    if (!currentCity) return '天气';
    const { province, name, district } = currentCity;
    const cnName = translateCityName(name);
    const cnProvince = province ? translateCityName(province) : '';
    
    if (cnProvince && cnProvince !== cnName) {
      return `${cnProvince} / ${cnName}${district ? ` / ${district}` : ''}`;
    }
    return cnName;
  };

  // 根据天气获取背景样式（仅浅色模式）
  const getWeatherBackground = () => {
    if (!currentWeather) return '';
    
    const icon = currentWeather.icon;
    
    // 根据天气图标代码返回对应背景（仅浅色模式）
    if (icon.includes('01')) { // 晴天
      return 'bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100';
    } else if (icon.includes('02') || icon.includes('03')) { // 多云
      return 'bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100';
    } else if (icon.includes('04')) { // 阴天
      return 'bg-gradient-to-br from-gray-200 via-gray-100 to-slate-200';
    } else if (icon.includes('09') || icon.includes('10')) { // 雨天
      return 'bg-gradient-to-br from-blue-200 via-slate-200 to-blue-300';
    } else if (icon.includes('11')) { // 雷暴
      return 'bg-gradient-to-br from-purple-200 via-slate-200 to-blue-200';
    } else if (icon.includes('13')) { // 雪天
      return 'bg-gradient-to-br from-white via-blue-50 to-slate-100';
    } else if (icon.includes('50')) { // 雾天
      return 'bg-gradient-to-br from-gray-200 via-slate-100 to-gray-300';
    }
    
    return '';
  };

  return (
    <div className={`min-h-screen theme-transition transition-colors duration-500 ${getWeatherBackground() || 'bg-primary'}`}>
      {/* 移动端侧边栏遮罩 */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex relative">
        {/* 侧边栏 - 移动端为抽屉式 */}
        <Sidebar isMobile={isMobile} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-3 md:p-4 lg:p-6 w-full">
          <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
            {/* 顶部操作栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 移动端汉堡菜单按钮 */}
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="icon-btn-flat !w-9 !h-9"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                <h1 className="text-xl md:text-2xl font-bold text-primary">{formatCityName()}</h1>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={isRefreshing}
                  onClick={handleRefresh}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  刷新
                </Button>
                {currentCity && (
                  favorites.some((f) => f.name === currentCity.name) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFromFavorites}
                    >
                      取消收藏
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddToFavorites}
                    >
                      收藏
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* 当前天气 */}
            {currentWeather && (
              <CurrentWeather
                data={currentWeather}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            )}

            {/* 预报列表 */}
            {forecastData && <ForecastList data={forecastData} />}

            {/* 温度趋势图表 - 移到预报下方 */}
            {forecastData && (
              <TemperatureChart data={forecastData.dailyForecasts} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

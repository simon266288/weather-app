/**
 * 当前天气展示组件
 */
import type { WeatherData } from '../../services/api/weatherApi';
import { WeatherIcon } from './WeatherIcon';
import {
  Droplets,
  Wind,
  Sun,
  Moon,
  Eye,
  Gauge,
  Clock,
} from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CurrentWeather({
  data,
}: CurrentWeatherProps) {
  const { formatTemperature, getWindDirectionDescription } = {
    formatTemperature: (temp: number) => `${Math.round(temp)}°C`,
    getWindDirectionDescription: (deg: number) => {
      const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
      return dirs[Math.round(deg / 45) % 8];
    },
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card-flat p-6 theme-transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* 左侧：温度和天气 */}
        <div className="flex items-center gap-6">
          <div className={`rounded-2xl p-4 ${getWeatherIconBg(data.icon)}`}>
            <WeatherIcon icon={data.icon} size="xl" />
          </div>
          <div>
            <div className="temperature-display font-bold">{data.temperature}°</div>
            <div className="text-lg text-secondary capitalize mt-2">
              {data.description}
            </div>
            <div className="text-sm text-tertiary mt-1 font-tabular">
              体感温度 {formatTemperature(data.feelsLike)}
            </div>
          </div>
        </div>

        {/* 右侧：天气详情 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <WeatherDetailItem
            icon={<Droplets className="h-5 w-5 text-primary" />}
            label="湿度"
            value={`${data.humidity}%`}
          />
          <WeatherDetailItem
            icon={<Wind className="h-5 w-5 text-primary" />}
            label="风力"
            value={`${data.windSpeed}m/s${getWindDirectionDescription(data.windDirection)}`}
          />
          <WeatherDetailItem
            icon={<Sun className="h-5 w-5 text-warning" />}
            label="日出"
            value={formatTime(data.sunrise)}
          />
          <WeatherDetailItem
            icon={<Moon className="h-5 w-5 text-primary" />}
            label="日落"
            value={formatTime(data.sunset)}
          />
          <WeatherDetailItem
            icon={<Eye className="h-5 w-5 text-primary" />}
            label="能见度"
            value={`${(data.visibility / 1000).toFixed(1)}km`}
          />
          <WeatherDetailItem
            icon={<Gauge className="h-5 w-5 text-primary" />}
            label="气压"
            value={`${data.pressure}hPa`}
          />
          <WeatherDetailItem
            icon={<Clock className="h-5 w-5 text-secondary" />}
            label="更新时间"
            value={formatTime(data.updateTime)}
          />
        </div>
      </div>
    </div>
  );
}

interface WeatherDetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function WeatherDetailItem({ icon, label, value }: WeatherDetailItemProps) {
  return (
    <div className="neumorph-pressed rounded-lg px-3 py-2 flex items-center gap-2">
      <div className="opacity-70">{icon}</div>
      <div>
        <div className="text-xs text-secondary">{label}</div>
        <div className="text-sm font-medium text-primary">{value}</div>
      </div>
    </div>
  );
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

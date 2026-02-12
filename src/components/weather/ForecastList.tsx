/**
 * 预报列表组件
 */
import type { ForecastData, DailyForecast } from '../../services/api/weatherApi';
import { WeatherIcon } from './WeatherIcon';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ForecastListProps {
  data: ForecastData;
}

export function ForecastList({ data }: ForecastListProps) {
  return (
    <div className="card-flat p-3 md:p-4 theme-transition">
      {/* 移动端：横向滚动；桌面端：网格布局 */}
      <div className="flex md:grid md:grid-cols-6 gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin -mx-1 px-1 md:mx-0 md:px-0">
        {data.dailyForecasts.map((day, index) => (
          <ForecastCard key={day.date} day={day} isToday={index === 0} />
        ))}
      </div>
    </div>
  );
}

interface ForecastCardProps {
  day: DailyForecast;
  isToday?: boolean;
}

function ForecastCard({ day, isToday }: ForecastCardProps) {
  const date = parseISO(day.date);
  const dayName = isToday
    ? '今天'
    : format(date, 'EEEE', { locale: zhCN }).replace('星期', '');

  return (
    <div
      className={`card-flat p-2 md:p-3 text-center transition-all flex-shrink-0 w-[calc(25%-6px)] md:w-auto ${
        isToday ? 'bg-primary/10 shadow-inner' : ''
      }`}
    >
      {/* 年月日显示 - 移动端隐藏 */}
      <span className="hidden md:block text-xs text-secondary/80 mb-1 font-medium">
        {day.year}年{day.month}月{day.day}日
      </span>
      
      {/* 星期几 - 移动端显示月/日 */}
      <span className={`text-xs md:text-sm mb-1 block ${isToday ? 'text-primary font-medium' : 'text-secondary'}`}>
        <span className="md:hidden">{day.month}/{day.day} </span>
        {dayName}
      </span>
      
      <div className="flex justify-center">
        <div className={`rounded-xl p-1 md:p-2 ${getWeatherIconBg(day.icon)}`}>
          <WeatherIcon icon={day.icon} size="md" className="h-6 w-6 md:h-10 md:w-10" />
        </div>
      </div>
      
      <span className="hidden md:block text-xs text-tertiary capitalize mt-1 mb-2">
        {day.description}
      </span>
      
      <div className="flex items-center justify-center gap-1 text-xs md:text-sm font-medium mt-1 md:mt-2">
        <span className="text-primary">{day.tempHigh}°</span>
        <span className="text-tertiary">/</span>
        <span className="text-secondary">{day.tempLow}°</span>
      </div>
      
      {day.pop > 0 && (
        <div className="mt-1 md:mt-2 text-[10px] md:text-xs text-primary bg-primary/10 px-1 md:px-2 py-0.5 rounded-full">
          {day.pop}%
        </div>
      )}
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

/**
 * 天气图标组件 - SVG自定义设计
 */
import { clsx } from 'clsx';

interface WeatherIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

// SVG天气图标组件
export function WeatherIcon({ icon, size = 'md', className }: WeatherIconProps) {
  const sizeClass = sizes[size];
  
  // 根据图标代码渲染对应的SVG
  if (icon.includes('01')) {
    // 晴天
    return <SunnyIcon className={clsx(sizeClass, className)} />;
  } else if (icon.includes('02')) {
    // 少云
    return <PartlyCloudyIcon className={clsx(sizeClass, className)} isDay={!icon.includes('n')} />;
  } else if (icon.includes('03') || icon.includes('04')) {
    // 多云/阴天
    return <CloudyIcon className={clsx(sizeClass, className)} />;
  } else if (icon.includes('09') || icon.includes('10')) {
    // 雨天
    return <RainIcon className={clsx(sizeClass, className)} />;
  } else if (icon.includes('11')) {
    // 雷暴
    return <ThunderstormIcon className={clsx(sizeClass, className)} />;
  } else if (icon.includes('13')) {
    // 雪天
    return <SnowIcon className={clsx(sizeClass, className)} />;
  } else if (icon.includes('50')) {
    // 雾天
    return <FogIcon className={clsx(sizeClass, className)} />;
  }
  
  // 默认晴天
  return <SunnyIcon className={clsx(sizeClass, className)} />;
}

// 晴天图标
function SunnyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* 太阳光晕 */}
      <circle cx="32" cy="32" r="14" className="fill-yellow-400 animate-pulse" />
      {/* 太阳中心 */}
      <circle cx="32" cy="32" r="10" className="fill-yellow-300" />
      {/* 光芒 */}
      {[...Array(8)].map((_, i) => (
        <line
          key={i}
          x1="32"
          y1="8"
          x2="32"
          y2="14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-yellow-400"
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
    </svg>
  );
}

// 少云图标
function PartlyCloudyIcon({ className, isDay }: { className?: string; isDay: boolean }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* 太阳/月亮 */}
      <circle 
        cx="44" cy="20" r="8" 
        className={isDay ? "fill-yellow-400" : "fill-gray-300"} 
      />
      {/* 云朵 */}
      <path
        d="M20 36c-6.6 0-12 5.4-12 12s5.4 12 12 12h24c6.6 0 12-5.4 12-12s-5.4-12-12-12c-.5 0-1 .1-1.5.1C44.5 38.4 40.5 36 36 36c-4.5 0-8.5 2.4-10.5 6.1-.5 0-1-.1-1.5-.1z"
        className="fill-gray-200"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

// 多云图标
function CloudyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <path
        d="M16 40c-4.4 0-8 3.6-8 8s3.6 8 8 8h32c4.4 0 8-3.6 8-8s-3.6-8-8-8c-.3 0-.7 0-1 .1C44.3 42.6 41.7 40.7 38.7 40c-3 0-5.7 1.9-7 4.7-.3 0-.7-.1-1-.1z"
        className="fill-gray-300"
      />
      <path
        d="M24 32c-3.3 0-6 2.7-6 6s2.7 6 6 6h24c3.3 0 6-2.7 6-6s-2.7-6-6-6c-.2 0-.5 0-.8.1C45.2 33.9 43.2 32.5 41 32c-2.2 0-4.2 1.4-5.2 3.5-.2 0-.5-.1-.8-.1z"
        className="fill-gray-400"
      />
    </svg>
  );
}

// 雨天图标
function RainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* 云 */}
      <path
        d="M16 34c-4.4 0-8 3.6-8 8s3.6 8 8 8h32c4.4 0 8-3.6 8-8s-3.6-8-8-8c-.3 0-.7 0-1 .1C44.3 36.6 41.7 34.7 38.7 34c-3 0-5.7 1.9-7 4.7-.3 0-.7-.1-1-.1z"
        className="fill-gray-400"
      />
      {/* 雨滴 */}
      <line x1="24" y1="52" x2="22" y2="58" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" className="animate-bounce" style={{ animationDelay: '0ms' }} />
      <line x1="32" y1="52" x2="30" y2="58" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" className="animate-bounce" style={{ animationDelay: '200ms' }} />
      <line x1="40" y1="52" x2="38" y2="58" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" className="animate-bounce" style={{ animationDelay: '400ms' }} />
    </svg>
  );
}

// 雷暴图标
function ThunderstormIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* 乌云 */}
      <path
        d="M12 30c-4.4 0-8 3.6-8 8s3.6 8 8 8h40c4.4 0 8-3.6 8-8s-3.6-8-8-8c-.3 0-.7 0-1 .1C52.3 32.6 49.7 30.7 46.7 30c-3 0-5.7 1.9-7 4.7-.3 0-.7-.1-1-.1z"
        className="fill-gray-600"
      />
      {/* 闪电 */}
      <path
        d="M30 48L26 58h6l-2 8 10-12h-6l4-6h-8z"
        className="fill-yellow-400"
        stroke="#F59E0B"
        strokeWidth="1"
      />
    </svg>
  );
}

// 雪天图标
function SnowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* 云 */}
      <path
        d="M16 34c-4.4 0-8 3.6-8 8s3.6 8 8 8h32c4.4 0 8-3.6 8-8s-3.6-8-8-8c-.3 0-.7 0-1 .1C44.3 36.6 41.7 34.7 38.7 34c-3 0-5.7 1.9-7 4.7-.3 0-.7-.1-1-.1z"
        className="fill-gray-300"
      />
      {/* 雪花 */}
      {[24, 32, 40].map((x, i) => (
        <g key={i} transform={`translate(${x}, 56)`}>
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" transform="rotate(45)" />
        </g>
      ))}
    </svg>
  );
}

// 雾天图标
function FogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      {/* 雾线条 */}
      <line x1="12" y1="28" x2="52" y2="28" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="36" x2="48" y2="36" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <line x1="12" y1="44" x2="52" y2="44" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="52" x2="48" y2="52" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// 保留原来的emoji备用方案
export function getWeatherIconComponent(icon: string): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[icon] || '☀️';
}

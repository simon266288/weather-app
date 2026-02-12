/**
 * 头部组件
 */
import { useCityStore } from '../../stores/weatherStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header(_props: HeaderProps) {
  const { currentCity } = useCityStore();

  // 格式化显示城市名称（省市区三级）
  const formatCityDisplay = () => {
    if (!currentCity) return null;

    const { province, name, district } = currentCity;

    // 如果有省份信息，显示省市区三级
    if (province && province !== name) {
      return (
        <div className="flex items-center gap-2 text-secondary">
          <span className="text-sm font-medium">{province}</span>
          <span className="text-xs opacity-50">/</span>
          <span className="text-sm font-medium">{name}</span>
          {district && (
            <>
              <span className="text-xs opacity-50">/</span>
              <span className="text-sm font-medium">{district}</span>
            </>
          )}
        </div>
      );
    }

    // 否则只显示城市名
    return (
      <div className="flex items-center gap-2 text-secondary">
        <span className="text-sm font-medium">{name}</span>
      </div>
    );
  };

  return (
    <header className="bg-card !rounded-none p-4 flex items-center justify-between theme-transition border-b border-secondary/30">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-primary">天气</h1>
      </div>

      <div className="flex items-center gap-3">
        {currentCity && formatCityDisplay()}
      </div>
    </header>
  );
}

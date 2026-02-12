/**
 * 地理位置 Hook
 */
import { useState, useCallback } from 'react';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isLoading: boolean;
  requestLocation: () => Promise<GeolocationPosition | null>;
  cancelLocation: () => void;
  watchLocation: () => void;
}

/**
 * 地理位置 Hook
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // 请求位置权限
  const requestLocation = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: '您的浏览器不支持地理定位',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const positionData: GeolocationPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setPosition(positionData);
          setIsLoading(false);
          resolve(positionData);
        },
        (err) => {
          const errorData: GeolocationError = {
            code: err.code,
            message: getErrorMessage(err.code),
          };
          setError(errorData);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 600000, // 10分钟内有效
        }
      );
    });
  }, []);

  // 取消定位
  const cancelLocation = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // 持续监听位置（可选功能）
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setError({
          code: err.code,
          message: getErrorMessage(err.code),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );

    setWatchId(id);
  }, []);

  return {
    position,
    error,
    isLoading,
    requestLocation,
    cancelLocation,
    watchLocation,
  };
}

/**
 * 获取错误消息
 */
function getErrorMessage(code: number): string {
  switch (code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return '您已拒绝位置权限请求，请在浏览器设置中启用';
    case GeolocationPositionError.POSITION_UNAVAILABLE:
      return '无法获取您的位置信息，请稍后重试';
    case GeolocationPositionError.TIMEOUT:
      return '获取位置信息超时，请稍后重试';
    default:
      return '获取位置信息失败';
  }
}

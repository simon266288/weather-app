/**
 * 主题 Hook - 仅支持浅色模式
 * 注意：深色模式已禁用
 */
import { useCallback } from 'react';

/**
 * 主题 Hook
 * 始终返回浅色主题，禁用深色模式切换
 */
export function useTheme() {
  // 设置主题 - 始终设置为浅色
  const setTheme = useCallback((_theme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    // 确保移除暗黑模式属性
    document.documentElement.removeAttribute('data-theme');
  }, []);

  // 切换主题 - 禁用切换功能
  const toggleTheme = useCallback(() => {
    // 深色模式已禁用，不执行任何操作
  }, []);

  // 初始化主题 - 强制浅色
  const initializeTheme = useCallback(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.removeAttribute('data-theme');
  }, []);

  return {
    theme: 'light' as const,
    setTheme,
    toggleTheme,
    initializeTheme,
  };
}

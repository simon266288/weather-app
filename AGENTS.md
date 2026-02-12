# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Development Commands

```bash
# Start development server (Vite + React)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Preview production build locally
npm run preview
```

**Note**: No test runner is configured in this project. E2E tests use Python + Playwright (`test_app.py`).

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
VITE_OPENWEATHERMAP_API_KEY=your_api_key_here
```

Get API key at: https://home.openweathermap.org/api_keys

## Tech Stack

- **React 19** + TypeScript (strict mode enabled)
- **Vite** 7.x as build tool
- **Tailwind CSS v4** with PostCSS plugin
- **Zustand** 5.x for state management
- **Recharts** for data visualization
- **Lucide React** for icons
- **tailwind-merge** + **clsx** for class utilities

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - all strict compiler options active
- **No `any` types** - always use explicit types
- **No `@ts-ignore`** or `@ts-expect-error` - fix type errors properly
- Use `type` for type aliases, `interface` for object shapes
- Components: export as named exports, not default

### Naming Conventions

- **Variables/functions**: camelCase (`fetchWeather`, `isLoading`)
- **Components**: PascalCase (`CurrentWeather`, `WeatherIcon`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Hooks**: prefix with `use` (`useWeather`, `useCitySearch`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### Imports

```typescript
// 1. React imports
import { useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

// 2. Third-party libraries
import { create } from 'zustand';
import { Droplets, Wind } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// 3. Absolute imports from project
import { useWeatherStore } from '../stores/weatherStore';
import type { WeatherData } from '../services/api/weatherApi';

// 4. Relative imports (same directory)
import { WeatherIcon } from './WeatherIcon';
```

### Comments

- Use Chinese for all comments and JSDoc
- Add file header comment describing purpose
- Add JSDoc for complex functions

```typescript
/**
 * 天气数据获取 Hook
 */

/**
 * 按经纬度获取天气数据
 */
const fetchWeatherByLatLon = useCallback(async (lat: number, lon: number) => {
  // 检查缓存
}, []);
```

### Component Structure

```typescript
/**
 * 组件描述
 */
import type { FC } from 'react';

interface Props {
  data: WeatherData;
  onRefresh?: () => void;
}

export function ComponentName({ data, onRefresh }: Props) {
  // hooks first
  // derived state
  // handlers
  // render
}

// Internal components after main export
interface InternalProps {
  label: string;
}

function InternalComponent({ label }: InternalProps) {
  // ...
}
```

### Error Handling

- Use custom `WeatherApiError` class for API errors
- Always handle AbortError for request cancellation
- Set user-friendly error messages in Chinese

```typescript
try {
  const data = await fetchApi(...);
} catch (err) {
  if ((err as Error).name === 'AbortError') {
    return; // 请求被取消，不处理错误
  }
  const message = err instanceof WeatherApiError
    ? err.message
    : '获取天气数据失败，请稍后重试';
  setError(message);
}
```

### State Management (Zustand)

- One store per domain (weather, city)
- Use `persist` middleware for localStorage persistence
- Keep actions in the store, selectors outside

```typescript
interface WeatherState {
  currentWeather: WeatherData | null;
  isLoading: boolean;
  setCurrentWeather: (weather: WeatherData | null) => void;
}

export const useWeatherStore = create<WeatherState>()((set) => ({
  currentWeather: null,
  isLoading: false,
  setCurrentWeather: (weather) => set({ currentWeather: weather }),
}));
```

### Styling (Tailwind + Neumorphism)

- Use custom Neumorphism classes from `index.css`:
  - `.neumorph-card` - card containers
  - `.neumorph-btn` - buttons
  - `.neumorph-input` - inputs
  - `.neumorph-icon-btn` - icon buttons
- Use `twMerge()` for conditional class merging
- Theme switching via `[data-theme="dark"]` attribute

### File Organization

```
src/
├── components/
│   ├── chart/          # Chart components
│   ├── common/         # Reusable UI (Button, Card, Loading)
│   ├── layout/         # Layout components
│   └── weather/        # Weather-specific
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API layer
│   ├── api/           # API clients
│   └── *.ts           # Services
├── stores/             # Zustand stores
├── utils/              # Utility functions
└── index.css          # Global styles + CSS variables
```

Each folder exports via `index.ts`:

```typescript
// src/hooks/index.ts
export * from './useWeather';
export * from './useCitySearch';
```

### API Layer Patterns

- Centralize in `src/services/api/`
- Export types with API functions
- Transform API responses to app models
- Handle errors with custom error class
- Use AbortController for request cancellation

### Performance

- Use `useCallback` for handlers passed to children
- Use `useMemo` for expensive computations
- Implement request cancellation with AbortController
- Cache API responses (see `weatherCache.ts`)

## Important Notes

- City names from OpenWeatherMap are English; use `translateCityName()` for Chinese display
- The `pinyin` field stores pinyin for API calls when lat/lon unavailable
- GPS location requested on app load but doesn't block rendering
- Tailwind CSS v4 uses `@import "tailwindcss"` syntax

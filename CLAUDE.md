# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

This app uses OpenWeatherMap API. The API key must be configured in `.env`:

```
VITE_OPENWEATHERMAP_API_KEY=your_api_key_here
```

Get an API key at: https://home.openweathermap.org/api_keys

## Architecture Overview

### Tech Stack
- **React 19** with TypeScript
- **Vite** as build tool
- **Tailwind CSS v4** for styling (uses PostCSS plugin)
- **Zustand** for state management
- **Recharts** for data visualization
- **Lucide React** for icons

### Project Structure

```
src/
├── components/          # React components
│   ├── chart/          # Chart components (TemperatureChart, PrecipitationChart)
│   ├── common/         # Reusable UI components (Button, Card, Loading)
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── weather/        # Weather-specific components (CurrentWeather, ForecastList, WeatherIcon)
├── hooks/              # Custom React hooks (business logic layer)
├── pages/              # Page components (Home)
├── services/           # API and service layer
│   ├── api/           # OpenWeatherMap API client
│   └── weatherCache.ts # LocalStorage-based caching service
├── stores/             # Zustand state management
├── utils/              # Utility functions (city name mapping)
└── index.css          # Tailwind + Neumorphism theme
```

### Key Architectural Patterns

**1. API Layer (`src/services/api/weatherApi.ts`)**
- Centralized OpenWeatherMap API client with type definitions
- Error handling with custom `WeatherApiError` class
- Includes geocoding, current weather, and forecast endpoints
- Data transformation from API responses to app models

**2. State Management (`src/stores/weatherStore.ts`)**
- `useWeatherStore`: Current weather, forecast data, loading/error states
- `useCityStore`: Current city, favorite cities, search history (persisted to localStorage)
- City favorites support reordering and temperature updates

**3. Custom Hooks as Business Logic Layer**
- `useWeather`: Fetches weather data, handles caching, request cancellation
- `useGeolocation`: Browser geolocation with permissions
- `useGeocoding`: Reverse geocoding (lat/lon → city name)
- `useFavorites`: Manages favorite cities
- `useCitySearch`: City search with OpenWeatherMap geocoding API
- `useTheme`: Dark/light mode toggle with data-theme attribute

**4. Caching Strategy (`src/services/weatherCache.ts`)**
- 10-minute cache duration
- Cache keys by lat/lon or city name
- Max 50 cached cities, evicts oldest entries
- `getWeatherCache()` and `setWeatherCache()` used by `useWeather` hook

**5. Component Organization**
- Layout components handle responsive sidebar (drawer on mobile)
- Weather components display current conditions and forecasts
- Chart components use Recharts for temperature/precipitation visualization
- Common components use custom Tailwind utility classes

## Styling System

The app uses a **Neumorphism design system** with light/dark mode support:

- CSS variables defined in `src/index.css`
- Toggle controlled via `[data-theme="dark"]` attribute
- Custom Tailwind classes:
  - `.neumorph-card`, `.neumorph-btn`, `.neumorph-input`, `.neumorph-icon-btn`
  - `.theme-transition` for smooth theme changes
- Background colors adapt based on weather conditions (see `getWeatherBackground()` in Home.tsx)

## Important Notes

- City names from OpenWeatherMap are returned in English; use `translateCityName()` from `src/utils/cityNameMap.ts` for Chinese display
- The `pinyin` field on `FavoriteCity` stores pinyin for API calls when lat/lon is unavailable
- GPS location is requested on app load but doesn't block rendering - cached data or default city is shown first
- Request cancellation is handled via AbortController in `useWeather` to prevent stale responses
import { WeatherData, WeatherForecast } from '@/types';

// Mock weather data for the Front Range
// In production, this would call a real weather API (OpenWeatherMap, Weather.gov, etc.)

const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Light Rain', 'Clear'];

function getSeasonalTemp(): { high: number; low: number; current: number } {
  const month = new Date().getMonth();
  // Front Range seasonal temperatures (rough approximations)
  const seasonal: Record<number, { high: number; low: number }> = {
    0: { high: 45, low: 20 }, // January
    1: { high: 48, low: 23 }, // February
    2: { high: 55, low: 28 }, // March
    3: { high: 62, low: 34 }, // April
    4: { high: 71, low: 43 }, // May
    5: { high: 82, low: 52 }, // June
    6: { high: 88, low: 58 }, // July
    7: { high: 86, low: 57 }, // August
    8: { high: 78, low: 48 }, // September
    9: { high: 66, low: 37 }, // October
    10: { high: 52, low: 26 }, // November
    11: { high: 45, low: 20 }, // December
  };

  const base = seasonal[month] || { high: 60, low: 35 };
  // Add some daily variation
  const variation = Math.floor(Math.random() * 10) - 5;
  const current = Math.floor((base.high + base.low) / 2 + variation);

  return {
    high: base.high + variation,
    low: base.low + variation,
    current,
  };
}

function generateForecast(days: number): WeatherForecast[] {
  const forecast: WeatherForecast[] = [];
  const baseTemp = getSeasonalTemp();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // Vary temperature slightly day to day
    const tempVariation = Math.floor(Math.random() * 8) - 4;

    forecast.push({
      date: date.toISOString().split('T')[0],
      high: baseTemp.high + tempVariation,
      low: baseTemp.low + tempVariation,
      condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      precipitationChance: Math.floor(Math.random() * 40), // 0-40% for Front Range
    });
  }

  return forecast;
}

// Simulated weather cache
let cachedWeather: WeatherData | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getWeather(location: string = 'Denver, CO'): Promise<WeatherData> {
  // Return cached data if still valid
  if (cachedWeather && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedWeather;
  }

  // In production, this would be a real API call:
  // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=imperial`);
  // const data = await response.json();

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const temps = getSeasonalTemp();
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  const weather: WeatherData = {
    location,
    temperature: temps.current,
    condition,
    humidity: 30 + Math.floor(Math.random() * 30), // 30-60%
    windSpeed: Math.floor(Math.random() * 15), // 0-15 mph
    precipitation24h: Math.random() < 0.2 ? Math.random() * 0.5 : 0, // 20% chance of precip
    forecast: generateForecast(5),
    lastUpdated: new Date().toISOString(),
  };

  // Cache the result
  cachedWeather = weather;
  cacheTime = Date.now();

  return weather;
}

// Check if conditions suggest trails might be impacted
export function getWeatherImpact(weather: WeatherData): {
  level: 'good' | 'caution' | 'poor';
  message: string;
} {
  // Recent precipitation
  if (weather.precipitation24h > 0.25) {
    return {
      level: 'caution',
      message: 'Recent rain may have affected trail conditions. Check reports before riding.',
    };
  }

  // Temperature extremes
  if (weather.temperature < 35) {
    return {
      level: 'caution',
      message: 'Cold temperatures may mean icy conditions, especially on north-facing slopes.',
    };
  }

  // Check upcoming forecast for precipitation
  const upcomingRain = weather.forecast.slice(0, 2).some((day) => day.precipitationChance > 50);
  if (upcomingRain) {
    return {
      level: 'caution',
      message: 'Rain in the forecast. Trails may be impacted soon.',
    };
  }

  // Good conditions
  if (weather.condition.includes('Sunny') || weather.condition.includes('Clear')) {
    return {
      level: 'good',
      message: 'Great weather for riding! Check individual trail reports for current conditions.',
    };
  }

  return {
    level: 'good',
    message: 'Weather looks fine for riding. Check trail reports for current conditions.',
  };
}

'use client';

import { useState, useEffect } from 'react';
import { WeatherData } from '@/types';
import { getWeather, getWeatherImpact } from '@/lib/weather';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';

function WeatherIcon({ condition }: { condition: string }) {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes('rain')) {
    return <CloudRain className="w-8 h-8 text-blue-500" />;
  }
  if (conditionLower.includes('snow')) {
    return <Snowflake className="w-8 h-8 text-blue-300" />;
  }
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return <Sun className="w-8 h-8 text-yellow-500" />;
  }
  return <Cloud className="w-8 h-8 text-gray-400" />;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const data = await getWeather('Denver, CO');
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-32 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const impact = getWeatherImpact(weather);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Main weather display */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon condition={weather.condition} />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{weather.temperature}°F</span>
                <span className="text-sm text-gray-500">{weather.condition}</span>
              </div>
              <p className="text-xs text-gray-400">{weather.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>{weather.windSpeed} mph</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span>{weather.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Trail impact indicator */}
        <div
          className={`mt-3 flex items-start gap-2 p-2 rounded-lg ${
            impact.level === 'good'
              ? 'bg-green-50 text-green-700'
              : impact.level === 'caution'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {impact.level === 'good' ? (
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-xs">{impact.message}</p>
        </div>
      </button>

      {/* Expanded forecast */}
      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-3">5-DAY FORECAST</h4>
          <div className="grid grid-cols-5 gap-2">
            {weather.forecast.map((day, index) => {
              const date = new Date(day.date);
              const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div key={day.date} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{dayName}</p>
                  <WeatherIcon condition={day.condition} />
                  <p className="text-sm font-medium mt-1">{day.high}°</p>
                  <p className="text-xs text-gray-400">{day.low}°</p>
                  {day.precipitationChance > 0 && (
                    <p className="text-xs text-blue-500 mt-1">
                      {day.precipitationChance}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {weather.precipitation24h > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Recent precipitation:</span>{' '}
                {weather.precipitation24h.toFixed(2)}&quot; in the last 24 hours
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

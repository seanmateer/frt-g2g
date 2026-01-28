'use client';

import { Mountain, List, Map, Info } from 'lucide-react';

interface HeaderProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

export default function Header({ view, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">FRT G2G</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Front Range Trail Status</p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'map'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Info button */}
          <button
            onClick={() => window.open('https://github.com', '_blank')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="About this app"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

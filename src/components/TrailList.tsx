'use client';

import { useState, useMemo } from 'react';
import { TrailCenter, ConfidenceScore, TrailStatus, TrailFilters } from '@/types';
import TrailCard from './TrailCard';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface TrailListProps {
  trailCenters: TrailCenter[];
  statusMap: Record<string, ConfidenceScore>;
  onSelectCenter: (center: TrailCenter) => void;
  regions: string[];
}

export default function TrailList({
  trailCenters,
  statusMap,
  onSelectCenter,
  regions,
}: TrailListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TrailFilters>({
    status: [],
    region: [],
  });
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'recent'>('name');

  // Filter and sort trail centers
  const filteredCenters = useMemo(() => {
    let result = [...trailCenters];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter((c) => {
        const status = statusMap[c.id]?.status || 'unknown';
        return filters.status!.includes(status);
      });
    }

    // Region filter
    if (filters.region && filters.region.length > 0) {
      result = result.filter((c) => filters.region!.includes(c.region));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        const statusOrder: Record<string, number> = {
          open: 0,
          muddy: 1,
          snowy: 2,
          closed: 3,
          unknown: 4,
        };
        const aStatus = statusMap[a.id]?.status || 'unknown';
        const bStatus = statusMap[b.id]?.status || 'unknown';
        return statusOrder[aStatus] - statusOrder[bStatus];
      } else if (sortBy === 'recent') {
        const aAge = statusMap[a.id]?.lastReportAge ?? Infinity;
        const bAge = statusMap[b.id]?.lastReportAge ?? Infinity;
        return aAge - bAge;
      }
      return 0;
    });

    return result;
  }, [trailCenters, searchQuery, filters, sortBy, statusMap]);

  // Status filter options
  const statusOptions: { value: TrailStatus; label: string; color: string }[] = [
    { value: 'open', label: 'Open', color: 'bg-green-500' },
    { value: 'muddy', label: 'Muddy', color: 'bg-amber-500' },
    { value: 'snowy', label: 'Snow/Ice', color: 'bg-blue-500' },
    { value: 'closed', label: 'Closed', color: 'bg-red-500' },
  ];

  const toggleStatusFilter = (status: TrailStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...(prev.status || []), status],
    }));
  };

  const toggleRegionFilter = (region: string) => {
    setFilters((prev) => ({
      ...prev,
      region: prev.region?.includes(region)
        ? prev.region.filter((r) => r !== region)
        : [...(prev.region || []), region],
    }));
  };

  const clearFilters = () => {
    setFilters({ status: [], region: [] });
    setSearchQuery('');
  };

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.region && filters.region.length > 0) ||
    searchQuery;

  return (
    <div className="flex flex-col h-full">
      {/* Search and filter header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        {/* Search input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter toggle and sort */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">
                {(filters.status?.length || 0) + (filters.region?.length || 0) + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="recent">Recent Activity</option>
            </select>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Status filters */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleStatusFilter(option.value)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.status?.includes(option.value)
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region filters */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Region</p>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => toggleRegionFilter(region)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.region?.includes(region)
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
        {filteredCenters.length} trail {filteredCenters.length === 1 ? 'system' : 'systems'}
      </div>

      {/* Trail list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredCenters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No trails match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredCenters.map((center) => (
            <TrailCard
              key={center.id}
              center={center}
              status={statusMap[center.id] || { status: 'unknown', confidence: 0, reportCount: 0, lastReportAge: Infinity, recentReports: [] }}
              onClick={() => onSelectCenter(center)}
            />
          ))
        )}
      </div>
    </div>
  );
}

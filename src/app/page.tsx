'use client';

import { useState } from 'react';
import { TrailCenter } from '@/types';
import { useTrailStatus } from '@/hooks/useTrailStatus';
import {
  Header,
  TrailList,
  TrailDetail,
  MapWrapper,
  ReportForm,
  WeatherWidget,
} from '@/components';

export default function Home() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedCenter, setSelectedCenter] = useState<TrailCenter | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const {
    trailCenters,
    trailheads,
    trails,
    statusMap,
    regions,
    isLoading,
    addReport,
    getReportsForCenter,
    getTrailsForCenter,
    getTrailheadsForCenter,
  } = useTrailStatus();

  const handleSelectCenter = (center: TrailCenter) => {
    setSelectedCenter(center);
  };

  const handleCloseDetail = () => {
    setSelectedCenter(null);
  };

  const handleSubmitReport = (report: Parameters<typeof addReport>[0]) => {
    addReport(report);
    setShowReportForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trail data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header view={view} onViewChange={setView} />

      <main className="flex-1 flex overflow-hidden">
        {/* List View */}
        {view === 'list' && (
          <div className="flex-1 flex">
            {/* Main list area */}
            <div className={`flex-1 ${selectedCenter ? 'hidden lg:block' : ''}`}>
              {/* Weather widget - desktop */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <WeatherWidget />
              </div>

              <TrailList
                trailCenters={trailCenters}
                statusMap={statusMap}
                onSelectCenter={handleSelectCenter}
                regions={regions}
              />
            </div>

            {/* Detail panel */}
            {selectedCenter && (
              <div className="w-full lg:w-[420px] lg:border-l border-gray-200 bg-white">
                <TrailDetail
                  center={selectedCenter}
                  trails={getTrailsForCenter(selectedCenter.id)}
                  trailheads={getTrailheadsForCenter(selectedCenter.id)}
                  status={statusMap[selectedCenter.id]}
                  reports={getReportsForCenter(selectedCenter.id)}
                  onClose={handleCloseDetail}
                  onReportClick={() => setShowReportForm(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {view === 'map' && (
          <div className="flex-1 flex relative">
            {/* Map takes full width on mobile, shares with panel on desktop */}
            <div className={`flex-1 ${selectedCenter ? 'hidden lg:block' : ''}`}>
              <MapWrapper
                trailCenters={trailCenters}
                trailheads={trailheads}
                trails={trails}
                statusMap={statusMap}
                selectedCenter={selectedCenter}
                onSelectCenter={handleSelectCenter}
                showTrails={true}
              />
            </div>

            {/* Detail panel overlay for map view */}
            {selectedCenter && (
              <div className="absolute inset-0 lg:relative lg:inset-auto lg:w-[420px] bg-white lg:border-l border-gray-200">
                <TrailDetail
                  center={selectedCenter}
                  trails={getTrailsForCenter(selectedCenter.id)}
                  trailheads={getTrailheadsForCenter(selectedCenter.id)}
                  status={statusMap[selectedCenter.id]}
                  reports={getReportsForCenter(selectedCenter.id)}
                  onClose={handleCloseDetail}
                  onReportClick={() => setShowReportForm(true)}
                />
              </div>
            )}

            {/* Weather widget overlay for map view - positioned at top */}
            {!selectedCenter && (
              <div className="absolute top-4 right-4 w-80 z-[1000]">
                <WeatherWidget />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Report Form Modal */}
      {showReportForm && selectedCenter && (
        <ReportForm
          center={selectedCenter}
          trails={getTrailsForCenter(selectedCenter.id)}
          onSubmit={handleSubmitReport}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
}

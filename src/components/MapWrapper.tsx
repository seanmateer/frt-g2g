'use client';

import dynamic from 'next/dynamic';
import { TrailCenter, Trailhead, Trail, ConfidenceScore } from '@/types';

// Loading component
function MapLoading() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  );
}

// Dynamically import the map component with no SSR
const TrailMap = dynamic(() => import('./TrailMap'), {
  ssr: false,
  loading: () => <MapLoading />,
});

interface MapWrapperProps {
  trailCenters: TrailCenter[];
  trailheads: Trailhead[];
  trails: Trail[];
  statusMap: Record<string, ConfidenceScore>;
  selectedCenter: TrailCenter | null;
  onSelectCenter: (center: TrailCenter) => void;
  showTrails: boolean;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <TrailMap {...props} />;
}

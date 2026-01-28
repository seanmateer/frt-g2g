'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { TrailCenter, Trailhead, Trail, ConfidenceScore } from '@/types';
import { getStatusDisplay, getConfidenceLabel } from '@/lib/confidence';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons based on trail status
const createStatusIcon = (status: string) => {
  const colors: Record<string, string> = {
    open: '#22c55e',
    muddy: '#f59e0b',
    snowy: '#3b82f6',
    closed: '#ef4444',
    unknown: '#9ca3af',
  };

  const color = colors[status] || colors.unknown;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Trail difficulty colors
const difficultyColors: Record<string, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  black: '#1f2937',
  'double-black': '#7c3aed',
};

interface MapControllerProps {
  selectedCenter: TrailCenter | null;
}

function MapController({ selectedCenter }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedCenter) {
      map.flyTo(
        [selectedCenter.centerCoordinates.lat, selectedCenter.centerCoordinates.lng],
        14,
        { duration: 1 }
      );
    }
  }, [selectedCenter, map]);

  return null;
}

interface TrailMapProps {
  trailCenters: TrailCenter[];
  trailheads: Trailhead[];
  trails: Trail[];
  statusMap: Record<string, ConfidenceScore>;
  selectedCenter: TrailCenter | null;
  onSelectCenter: (center: TrailCenter) => void;
  showTrails: boolean;
}

export default function TrailMap({
  trailCenters,
  trailheads,
  trails,
  statusMap,
  selectedCenter,
  onSelectCenter,
  showTrails,
}: TrailMapProps) {
  const [zoom, setZoom] = useState(10);

  // Center of the Front Range (around Golden/Denver)
  const defaultCenter: [number, number] = [39.7392, -105.2414];

  // Get status for a trail center
  const getCenterStatus = (centerId: string) => {
    return statusMap[centerId] || { status: 'unknown', confidence: 0 };
  };

  // Filter trails for selected center
  const visibleTrails = useMemo(() => {
    if (!showTrails || zoom < 12) return [];
    if (selectedCenter) {
      return trails.filter((t) => t.trailCenterId === selectedCenter.id);
    }
    return [];
  }, [trails, selectedCenter, showTrails, zoom]);

  // Filter trailheads for selected center
  const visibleTrailheads = useMemo(() => {
    if (zoom < 12) return [];
    if (selectedCenter) {
      return trailheads.filter((th) => th.trailCenterId === selectedCenter.id);
    }
    return trailheads;
  }, [trailheads, selectedCenter, zoom]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        className="w-full h-full"
        zoomControl={false}
        style={{ background: '#f0f0f0' }}
      >
        <ZoomControl position="topright" />
        <MapController selectedCenter={selectedCenter} />

        {/* Base map layer - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Trail center markers */}
        {trailCenters.map((center) => {
          const status = getCenterStatus(center.id);
          const statusDisplay = getStatusDisplay(status.status);

          return (
            <Marker
              key={center.id}
              position={[center.centerCoordinates.lat, center.centerCoordinates.lng]}
              icon={createStatusIcon(status.status)}
              eventHandlers={{
                click: () => onSelectCenter(center),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg">{center.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{center.region}</p>

                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                    <span className="mr-1">{statusDisplay.icon}</span>
                    {statusDisplay.label}
                  </div>

                  {status.confidence > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getConfidenceLabel(status.confidence)} confidence ({status.reportCount} reports)
                    </p>
                  )}

                  <div className="mt-2 text-sm">
                    <p>{center.totalMiles} miles of trails</p>
                    <p>Elevation: {center.elevation.toLocaleString()} ft</p>
                  </div>

                  <button
                    onClick={() => onSelectCenter(center)}
                    className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Trailhead markers (visible when zoomed in) */}
        {visibleTrailheads.map((trailhead) => (
          <Marker
            key={trailhead.id}
            position={[trailhead.coordinates.lat, trailhead.coordinates.lng]}
            icon={L.divIcon({
              className: 'trailhead-marker',
              html: `
                <div style="
                  background-color: white;
                  width: 16px;
                  height: 16px;
                  border-radius: 3px;
                  border: 2px solid #374151;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                ">P</div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              popupAnchor: [0, -8],
            })}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h4 className="font-semibold">{trailhead.name}</h4>
                {trailhead.description && (
                  <p className="text-xs text-gray-600 mt-1">{trailhead.description}</p>
                )}
                <div className="flex gap-2 mt-2 text-xs">
                  {trailhead.hasParking && (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">Parking</span>
                  )}
                  {trailhead.hasRestrooms && (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">Restrooms</span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Trail lines (visible when zoomed in on a selected center) */}
        {visibleTrails.map((trail) => (
          <Polyline
            key={trail.id}
            positions={trail.coordinates.map(([lng, lat]) => [lat, lng])}
            pathOptions={{
              color: difficultyColors[trail.difficulty] || '#6b7280',
              weight: 3,
              opacity: 0.8,
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h4 className="font-semibold">{trail.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: difficultyColors[trail.difficulty] }}
                  />
                  <span className="text-xs capitalize">{trail.difficulty}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {trail.lengthMiles} mi • {trail.elevationGainFeet} ft gain
                </p>
                <p className="text-xs text-gray-500 mt-1">{trail.description}</p>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-xs font-semibold mb-2 text-gray-700">Trail Status</h4>
        <div className="space-y-1">
          {[
            { status: 'open', label: 'Open / Dry' },
            { status: 'muddy', label: 'Muddy' },
            { status: 'snowy', label: 'Snow/Ice' },
            { status: 'closed', label: 'Closed' },
            { status: 'unknown', label: 'Unknown' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{
                  backgroundColor: {
                    open: '#22c55e',
                    muddy: '#f59e0b',
                    snowy: '#3b82f6',
                    closed: '#ef4444',
                    unknown: '#9ca3af',
                  }[status],
                }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

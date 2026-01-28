// Geographic coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Trail condition status
export type TrailStatus = 'open' | 'muddy' | 'snowy' | 'closed' | 'unknown';

// Trail difficulty (IMBA scale)
export type TrailDifficulty = 'green' | 'blue' | 'black' | 'double-black';

// Trail direction
export type TrailDirection = 'one-way' | 'both-ways';

// Individual trail within a trail center
export interface Trail {
  id: string;
  name: string;
  trailCenterId: string;
  difficulty: TrailDifficulty;
  direction: TrailDirection;
  lengthMiles: number;
  elevationGainFeet: number;
  description: string;
  // GeoJSON LineString coordinates for rendering trail on map
  coordinates: [number, number][]; // [lng, lat] pairs
}

// Trail center (e.g., Green Mountain, North Table)
export interface TrailCenter {
  id: string;
  name: string;
  description: string;
  region: string; // e.g., "Golden", "Denver", "Boulder"
  elevation: number; // base elevation in feet
  totalMiles: number;
  website?: string;
  // Center point for the trail system
  centerCoordinates: Coordinates;
  // All trailheads for this center
  trailheadIds: string[];
  // All trails in this center
  trailIds: string[];
}

// Trailhead (parking/access point)
export interface Trailhead {
  id: string;
  name: string;
  trailCenterId: string;
  coordinates: Coordinates;
  hasParking: boolean;
  hasRestrooms: boolean;
  description?: string;
}

// Condition report submitted by a user
export interface TrailReport {
  id: string;
  trailId?: string; // Optional - can report on specific trail
  trailCenterId: string; // Required - always associated with a center
  status: TrailStatus;
  comment?: string;
  timestamp: string; // ISO date string
  // Anonymous user info (no auth required)
  reporterNickname?: string;
  // Weather at time of report (can be auto-populated)
  weatherTemp?: number;
  weatherCondition?: string;
}

// Calculated confidence score for trail status
export interface ConfidenceScore {
  status: TrailStatus;
  confidence: number; // 0-100
  reportCount: number;
  lastReportAge: number; // hours since last report
  recentReports: TrailReport[];
}

// Aggregated trail center status
export interface TrailCenterStatus {
  trailCenterId: string;
  overallStatus: TrailStatus;
  confidence: number;
  trailStatuses: Record<string, ConfidenceScore>; // keyed by trailId
  lastUpdated: string;
}

// Weather data for a location
export interface WeatherData {
  location: string;
  temperature: number; // Fahrenheit
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation24h: number; // inches in last 24h
  forecast: WeatherForecast[];
  lastUpdated: string;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitationChance: number;
}

// Map view state
export interface MapViewState {
  center: Coordinates;
  zoom: number;
}

// App filters
export interface TrailFilters {
  status?: TrailStatus[];
  difficulty?: TrailDifficulty[];
  region?: string[];
  minConfidence?: number;
}

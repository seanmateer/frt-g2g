import { Trailhead } from '@/types';

export const trailheads: Trailhead[] = [
  // North Table Mountain
  {
    id: 'north-table-main',
    name: 'North Table Mountain Trailhead',
    trailCenterId: 'north-table',
    coordinates: { lat: 39.7789, lng: -105.2214 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main parking area off CO-93. Popular starting point.',
  },
  {
    id: 'north-table-east',
    name: 'North Table East Trailhead',
    trailCenterId: 'north-table',
    coordinates: { lat: 39.7823, lng: -105.2089 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Quieter access from the east side.',
  },
  // South Table Mountain
  {
    id: 'south-table-main',
    name: 'South Table Mountain Trailhead',
    trailCenterId: 'south-table',
    coordinates: { lat: 39.7497, lng: -105.2045 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main access point off 19th Street.',
  },
  // Apex Park
  {
    id: 'apex-main',
    name: 'Apex Park Trailhead',
    trailCenterId: 'apex',
    coordinates: { lat: 39.7378, lng: -105.2567 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Primary trailhead with large parking lot.',
  },
  {
    id: 'apex-heritage',
    name: 'Heritage Square Trailhead',
    trailCenterId: 'apex',
    coordinates: { lat: 39.7314, lng: -105.2478 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Alternative access near Heritage Square.',
  },
  // White Ranch
  {
    id: 'white-ranch-lower',
    name: 'White Ranch Lower Trailhead',
    trailCenterId: 'white-ranch',
    coordinates: { lat: 39.7989, lng: -105.2578 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Lower access point. Big climb to get to the good stuff.',
  },
  {
    id: 'white-ranch-upper',
    name: 'White Ranch Upper Trailhead',
    trailCenterId: 'white-ranch',
    coordinates: { lat: 39.8234, lng: -105.3012 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Upper access saves some climbing.',
  },
  // Green Mountain
  {
    id: 'green-mountain-west',
    name: 'Green Mountain West Trailhead',
    trailCenterId: 'green-mountain',
    coordinates: { lat: 39.6978, lng: -105.1667 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Popular west side access. Can be crowded on weekends.',
  },
  {
    id: 'green-mountain-rooney',
    name: 'Rooney Road Trailhead',
    trailCenterId: 'green-mountain',
    coordinates: { lat: 39.6912, lng: -105.1534 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Access to Rooney Valley trails.',
  },
  // Bear Creek
  {
    id: 'bear-creek-main',
    name: 'Bear Creek Lake Park Trailhead',
    trailCenterId: 'bear-creek',
    coordinates: { lat: 39.6512, lng: -105.1578 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main entrance requires park fee.',
  },
  // Matthews/Winters
  {
    id: 'matthews-winters-main',
    name: 'Matthews/Winters Trailhead',
    trailCenterId: 'matthews-winters',
    coordinates: { lat: 39.7089, lng: -105.2089 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main trailhead off CO-93.',
  },
  {
    id: 'matthews-dinosaur',
    name: 'Dinosaur Ridge Trailhead',
    trailCenterId: 'matthews-winters',
    coordinates: { lat: 39.6967, lng: -105.1978 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Access from the Dinosaur Ridge area.',
  },
  // Lair o' the Bear
  {
    id: 'lair-main',
    name: 'Lair O\' the Bear Trailhead',
    trailCenterId: 'lair-o-bear',
    coordinates: { lat: 39.6631, lng: -105.2614 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main parking area along Bear Creek.',
  },
  // Betasso
  {
    id: 'betasso-main',
    name: 'Betasso Preserve Trailhead',
    trailCenterId: 'betasso',
    coordinates: { lat: 40.0178, lng: -105.3364 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main access. Note: Closed to bikes Wed & Sat.',
  },
  // Walker Ranch
  {
    id: 'walker-main',
    name: 'Walker Ranch Trailhead',
    trailCenterId: 'walker-ranch',
    coordinates: { lat: 39.9534, lng: -105.3367 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main trailhead for the Walker Ranch Loop.',
  },
  {
    id: 'walker-ethel-harrold',
    name: 'Ethel Harrold Trailhead',
    trailCenterId: 'walker-ranch',
    coordinates: { lat: 39.9489, lng: -105.3612 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Alternative access point.',
  },
  // Hall Ranch
  {
    id: 'hall-ranch-main',
    name: 'Hall Ranch Trailhead',
    trailCenterId: 'hall-ranch',
    coordinates: { lat: 40.1978, lng: -105.2867 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main access point off Highway 7.',
  },
  // Heil Valley
  {
    id: 'heil-main',
    name: 'Heil Valley Ranch Trailhead',
    trailCenterId: 'heil-valley',
    coordinates: { lat: 40.1289, lng: -105.2912 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main parking area and trailhead.',
  },
  // Buffalo Creek
  {
    id: 'buffalo-creek-main',
    name: 'Buffalo Creek Trailhead',
    trailCenterId: 'buffalo-creek',
    coordinates: { lat: 39.4178, lng: -105.2789 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main staging area for Buffalo Creek trails.',
  },
  {
    id: 'buffalo-colorado-trail',
    name: 'Colorado Trail Trailhead',
    trailCenterId: 'buffalo-creek',
    coordinates: { lat: 39.3989, lng: -105.3078 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Access to Colorado Trail segments.',
  },
  // Elk Meadow
  {
    id: 'elk-meadow-main',
    name: 'Elk Meadow Park Trailhead',
    trailCenterId: 'elk-meadow',
    coordinates: { lat: 39.6612, lng: -105.3534 },
    hasParking: true,
    hasRestrooms: true,
    description: 'Main trailhead off Stagecoach Blvd.',
  },
  {
    id: 'elk-meadow-bergen',
    name: 'Bergen Peak Trailhead',
    trailCenterId: 'elk-meadow',
    coordinates: { lat: 39.6456, lng: -105.3667 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Access for Bergen Peak climb.',
  },
  // Chimney Gulch
  {
    id: 'chimney-main',
    name: 'Chimney Gulch Trailhead',
    trailCenterId: 'chimney-gulch',
    coordinates: { lat: 39.7567, lng: -105.2378 },
    hasParking: true,
    hasRestrooms: false,
    description: 'Small parking area at the base of the climb.',
  },
];

export const getTrailheadById = (id: string): Trailhead | undefined => {
  return trailheads.find((th) => th.id === id);
};

export const getTrailheadsByCenter = (centerId: string): Trailhead[] => {
  return trailheads.filter((th) => th.trailCenterId === centerId);
};

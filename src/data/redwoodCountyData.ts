import { Report, ServiceFacility, NeedCategory } from '../lib/types';
import { getH3IndexFromCoordinates } from '../lib/hexGrid';

// 5 towns in Redwood Valley County
export const TOWNS = [
  { name: 'North Redwood', lat: 39.22, lng: -123.25 },
  { name: 'Pine Ridge', lat: 39.18, lng: -123.12 },
  { name: 'Mill Creek', lat: 39.12, lng: -123.28 },
  { name: 'South Valley', lat: 39.05, lng: -123.18 },
  { name: 'East Bend', lat: 39.14, lng: -123.05 },
];

// Service Facilities in Redwood Valley County
export const INITIAL_FACILITIES: ServiceFacility[] = [
  {
    id: 'fac-1',
    name: 'Redwood Memorial Hospital & Clinic',
    facilityType: 'clinic_hospital',
    category: 'healthcare',
    latitude: 39.12,
    longitude: -123.28,
    addressOrAreaDescription: '100 Hospital Way, Mill Creek',
    hours: 'Mon-Sun 24/7',
    source: 'Public County Facility Registry',
    verifiedAt: '2026-01-15',
    isSynthetic: true,
  },
  {
    id: 'fac-2',
    name: 'South Valley Pharmacy & Express Clinic',
    facilityType: 'pharmacy',
    category: 'healthcare',
    latitude: 39.06,
    longitude: -123.17,
    addressOrAreaDescription: '450 Main St, South Valley',
    hours: 'Mon-Fri 9am-6pm',
    source: 'Public Pharmacy Registry',
    verifiedAt: '2026-02-01',
    isSynthetic: true,
  },
  {
    id: 'fac-3',
    name: 'Pine Ridge Community Health Center',
    facilityType: 'clinic_hospital',
    category: 'healthcare',
    latitude: 39.19,
    longitude: -123.10,
    addressOrAreaDescription: '12 Ridge Rd, Pine Ridge',
    hours: 'Mon-Thu 8am-4pm (Limited Hours)',
    source: 'County Health Dept',
    verifiedAt: '2026-02-10',
    isSynthetic: true,
  },
  {
    id: 'fac-4',
    name: 'Central Redwood Clean Water Station',
    facilityType: 'water_station',
    category: 'water_sanitation',
    latitude: 39.13,
    longitude: -123.25,
    addressOrAreaDescription: 'Mill Creek Water Treatment Facility',
    hours: 'Daily 7am-7pm',
    source: 'Public Utilities Dept',
    verifiedAt: '2026-01-20',
    isSynthetic: true,
  },
  {
    id: 'fac-5',
    name: 'East Bend Emergency Tank Water Supply',
    facilityType: 'water_station',
    category: 'water_sanitation',
    latitude: 39.15,
    longitude: -123.04,
    addressOrAreaDescription: 'East Bend Community Center Parking Lot',
    hours: '24/7 Bulk Tank',
    source: 'County Emergency Management',
    verifiedAt: '2026-03-01',
    isSynthetic: true,
  },
  {
    id: 'fac-6',
    name: 'Redwood Valley Rural Transit Hub',
    facilityType: 'transit_hub',
    category: 'transportation_emergency',
    latitude: 39.11,
    longitude: -123.27,
    addressOrAreaDescription: 'Mill Creek Transit Center, Depot St',
    hours: 'Mon-Sat 6am-8pm',
    source: 'Regional Transit Authority',
    verifiedAt: '2026-01-10',
    isSynthetic: true,
  },
  {
    id: 'fac-7',
    name: 'North Redwood Volunteer Fire Station 4',
    facilityType: 'emergency_station',
    category: 'transportation_emergency',
    latitude: 39.24,
    longitude: -123.24,
    addressOrAreaDescription: 'Station 4, North Redwood Highway',
    hours: '24/7 On-Call EMS',
    source: 'County Fire District',
    verifiedAt: '2026-02-15',
    isSynthetic: true,
  },
];

// Helper to generate realistic synthetic reports with date distribution
export function generateSyntheticReports(scenario: 'healthcare' | 'water' | 'transit' = 'healthcare'): Report[] {
  const reports: Report[] = [];
  const now = new Date('2026-10-01');

  // Healthcare Access gap scenario (North Redwood & East Bend lack pharmacy & clinic access)
  const templates = {
    healthcare: [
      { text: 'Long travel required to reach an open pharmacy for prescription refills.', sub: 'pharmacy_distance', category: 'healthcare' as NeedCategory, lat: 39.22, lng: -123.25, town: 'North Redwood', sev: 'high' },
      { text: 'Evening primary care or urgent care unavailable within 45 minute drive.', sub: 'clinic_access', category: 'healthcare' as NeedCategory, lat: 39.23, lng: -123.26, town: 'North Redwood', sev: 'high' },
      { text: 'Lack of local transportation to regional hospital appointments.', sub: 'medical_transit', category: 'healthcare' as NeedCategory, lat: 39.21, lng: -123.24, town: 'North Redwood', sev: 'medium' },
      { text: 'Seniors reporting difficulty picking up essential medications.', sub: 'pharmacy_access', category: 'healthcare' as NeedCategory, lat: 39.14, lng: -123.05, town: 'East Bend', sev: 'high' },
      { text: 'Clinic hours in Pine Ridge are restricted to morning shifts only.', sub: 'clinic_hours', category: 'healthcare' as NeedCategory, lat: 39.18, lng: -123.12, town: 'Pine Ridge', sev: 'low' },
    ],
    water: [
      { text: 'Low pressure and turbidity concerns reported during dry summer period.', sub: 'water_quality', category: 'water_sanitation' as NeedCategory, lat: 39.18, lng: -123.12, town: 'Pine Ridge', sev: 'high' },
      { text: 'Community water well system requiring frequent maintenance outages.', sub: 'water_outage', category: 'water_sanitation' as NeedCategory, lat: 39.19, lng: -123.13, town: 'Pine Ridge', sev: 'high' },
      { text: 'Residents requesting mobile drinking water testing or delivery station.', sub: 'water_testing', category: 'water_sanitation' as NeedCategory, lat: 39.20, lng: -123.11, town: 'Pine Ridge', sev: 'medium' },
      { text: 'Public facility water fountain non-operational.', sub: 'public_fountain', category: 'water_sanitation' as NeedCategory, lat: 39.05, lng: -123.18, town: 'South Valley', sev: 'low' },
    ],
    transit: [
      { text: 'Rural bus route missed scheduled pickup for healthcare commute.', sub: 'transit_reliability', category: 'transportation_emergency' as NeedCategory, lat: 39.05, lng: -123.18, town: 'South Valley', sev: 'high' },
      { text: 'Extended emergency response wait time reported for outlying road area.', sub: 'ems_wait', category: 'transportation_emergency' as NeedCategory, lat: 39.04, lng: -123.19, town: 'South Valley', sev: 'high' },
      { text: 'Unpaved access road damaged after storm, slowing emergency access.', sub: 'road_access', category: 'transportation_emergency' as NeedCategory, lat: 39.14, lng: -123.05, town: 'East Bend', sev: 'high' },
    ],
  };

  let idCounter = 1;

  // Generate ~180 reports across all towns with deliberate cluster concentrations
  const allTemplates = [...templates.healthcare, ...templates.water, ...templates.transit];

  allTemplates.forEach((template) => {
    // Generate multiple occurrences over 180 days with recent escalation
    const count = scenario === template.category ? 25 : 8;
    for (let i = 0; i < count; i++) {
      // Offset coordinates slightly to simulate neighborhood dispersion within town
      const latOffset = (Math.random() - 0.5) * 0.03;
      const lngOffset = (Math.random() - 0.5) * 0.03;
      const reportLat = template.lat + latOffset;
      const reportLng = template.lng + lngOffset;

      // Random date in past 180 days, weighted towards past 30 days
      const daysAgo = Math.floor(Math.pow(Math.random(), 1.5) * 180);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const gridId = getH3IndexFromCoordinates(reportLat, reportLng);

      reports.push({
        id: `rep-${idCounter++}`,
        category: template.category,
        subcategory: template.sub,
        severity: (i % 5 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low') as any,
        sourceType: (i % 3 === 0 ? 'public_service_request' : 'community_survey') as any,
        summary: template.text,
        approximateLatitude: reportLat,
        approximateLongitude: reportLng,
        locationGridId: gridId,
        town: template.town,
        occurredAt: date.toISOString(),
        createdAt: date.toISOString(),
        isSynthetic: true,
        status: 'active',
        tags: [template.category, template.town.toLowerCase().replace(' ', '_')],
      });
    }
  });

  return reports;
}

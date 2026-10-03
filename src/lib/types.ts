export type NeedCategory =
  | 'healthcare'
  | 'water_sanitation'
  | 'transportation_emergency'
  | 'food_access'
  | 'broadband';

export type SeverityLevel = 'low' | 'medium' | 'high';

export type PriorityLabel = 'Monitor' | 'Review' | 'High-priority review';

export type SourceType =
  | 'public_service_request'
  | 'community_survey'
  | 'approved_incident_summary'
  | 'demo';

export interface Report {
  id: string;
  category: NeedCategory;
  subcategory: string;
  severity: SeverityLevel;
  sourceType: SourceType;
  summary: string;
  approximateLatitude: number;
  approximateLongitude: number;
  locationGridId: string; // H3 index or town cell ID
  town?: string;
  occurredAt: string; // ISO date string
  createdAt: string;
  isSynthetic: boolean;
  status: 'active' | 'archived';
  tags: string[];
}

export type FacilityType =
  | 'pharmacy'
  | 'clinic_hospital'
  | 'water_station'
  | 'transit_hub'
  | 'emergency_station'
  | 'shelter';

export interface ServiceFacility {
  id: string;
  name: string;
  facilityType: FacilityType;
  category: NeedCategory;
  latitude: number;
  longitude: number;
  addressOrAreaDescription: string;
  hours?: string;
  phone?: string;
  source: string;
  verifiedAt: string;
  isSynthetic: boolean;
}

export interface NeedZone {
  id: string; // H3 index
  gridId: string;
  centerLatitude: number;
  centerLongitude: number;
  hexBoundary: [number, number][]; // LatLng polygon points
  category: NeedCategory;
  priorityScore: number; // 0 - 100
  priorityLabel: PriorityLabel;
  confidenceLevel: 'low' | 'medium' | 'high';
  signalCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  recent30DayCount: number;
  prior30DayCount: number;
  trendDirection: 'decreasing' | 'stable' | 'increasing';
  nearestFacilityDistanceKm: number;
  nearestFacilityName?: string;
  nearestFacilityType?: FacilityType;
  sampleSummaries: string[];
  explanation: string;
  recommendedActions: string[];
  townName?: string;
  updatedAt: string;
  isSynthetic: boolean;
}

export interface FilterOptions {
  categories: NeedCategory[];
  severities: SeverityLevel[];
  sourceTypes: SourceType[];
  dateRangeDays: number; // e.g., 30, 90, 180, 365
  minSignalCount: number;
  showFacilities: boolean;
  showReportClusters: boolean;
}

export interface PIIHeaderCheckResult {
  hasPIIHeader: boolean;
  flaggedHeaders: string[];
  message: string;
}

export interface CSVParseResult {
  success: boolean;
  records: Report[];
  acceptedCount: number;
  rejectedCount: number;
  validationMessages: string[];
  containsPII: boolean;
  flaggedHeaders: string[];
}

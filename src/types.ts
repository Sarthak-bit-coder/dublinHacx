export type IssueCategory = 
  | 'road' 
  | 'bridge' 
  | 'water' 
  | 'power' 
  | 'health' 
  | 'telecom';

export type SeverityLevel = 'minor' | 'moderate' | 'high' | 'critical';

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: SeverityLevel;
  status: 'pending_review' | 'verified' | 'scheduled_repair' | 'resolved';
  coordinates: {
    lat: number;
    lng: number;
    // Map grid percentage coordinates (0 - 100) for custom GIS map canvas
    x: number;
    y: number;
  };
  districtId: string;
  districtName: string;
  locationName: string;
  dateReported: string;
  upvotes: number;
  verifiedCount: number;
  photoUrl?: string;
  affectedHouseholds: number;
  infrastructureType: string;
  reporterType: 'farmer' | 'resident' | 'school_bus_driver' | 'health_worker' | 'technician';
  emergencyAccessBlocked: boolean;
}

export interface PriorityRepair {
  id: string;
  reportId?: string;
  rank: number;
  assetName: string;
  district: string;
  degradationScore: number; // 0 - 100 (100 = total collapse)
  isolationRiskScore: number; // 0 - 100
  urgencyScore: number; // combined metric
  estimatedCrewDays: number;
  requiredMachinery: string[];
  estimatedCostUsd: number;
  status: 'urgent_dispatch' | 'queued' | 'in_progress' | 'scheduled';
  locationName: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  rationale: string;
}

export interface StrategicSite {
  id: string;
  type: 'hospital' | 'technician_depot' | 'mobile_clinic_post' | 'water_purification_hub';
  name: string;
  categoryLabel: string;
  status: 'recommended_by_ai' | 'council_shortlist' | 'pre_engineering';
  coordinates: { x: number; y: number; lat: number; lng: number };
  coveragePopulation: number;
  avgTravelTimeReductionMin: number;
  keyJustification: string;
  estimatedCapExUsd: number;
  priorityScore: number;
  recommendedEquipment?: string[];
  district: string;
}

export interface AIPatternCluster {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'moderate';
  confidence: number;
  affectedPopulation: number;
  description: string;
  actionRecommendation: string;
  relatedReportIds: string[];
  districtName: string;
  categoryFocus: IssueCategory;
}

export interface DistrictProfile {
  id: string;
  name: string;
  state: string;
  population: number;
  areaSqKm: number;
  roadNetworkKm: number;
  activeReportsCount: number;
  criticalIssuesCount: number;
  nearestGeneralHospitalKm: number;
  avgAmbulanceTimeMin: number;
  soilErosionIndex: 'High' | 'Severe' | 'Moderate';
}

export interface WeatherDistrictBreakdown {
  district: string;
  precipitationMm: number;
  saturationPct: number;
  washoutRisk: 'Critical' | 'High' | 'Moderate' | 'Low';
  primaryVulnerability: string;
}

export interface WeatherImpactData {
  timestamp: string;
  overallImpactLevel: 'Severe' | 'High' | 'Moderate' | 'Low';
  erosionMultiplier: number;
  precipitation24hMm: number;
  soilSaturationPct: number;
  weatherCondition: string;
  temperatureC: number;
  windSpeedKph: number;
  alertHeadline: string;
  districtBreakdown: WeatherDistrictBreakdown[];
}

// 8-Stage Spatial Data Pipeline Contracts
export type PipelineStageId = 
  | 'raw_staging'
  | 'normalization'
  | 'geography'
  | 'acs_enrichment'
  | 'screening_features'
  | 'candidate_sites'
  | 'optimization'
  | 'final_enrichment';

export interface PipelineStageStatus {
  id: PipelineStageId;
  stageNumber: number;
  name: string;
  description: string;
  sourcesUsed: string[];
  status: 'completed' | 'running' | 'queued';
  recordsProcessed: number;
  checksumHash: string;
  timestamp: string;
  details: string;
}

export interface CandidateSiteOptimization {
  siteId: string;
  candidateName: string;
  censusTractId: string;
  districtName: string;
  coordinates: { lat: number; lng: number; x: number; y: number };
  accessImprovementScore: number; // 0-100
  capacityScore: number;          // 0-100
  vulnerabilityScore: number;     // SVI & HRSA MUA/P weight
  configurationFitScore: number; // 0-100
  costEfficiencyScore: number;    // 0-100
  totalOptimizationScore: number; // Weighted total score 0-100
  adjustedDriveTimeMin: number;   // Rural vs urban road factor
  baselineDriveTimeMin: number;
  timeSavedMin: number;
  recommendedServices: string[];
}

export interface PipelineExecutionResult {
  executionId: string;
  pipelineVersion: string;
  timestamp: string;
  stages: PipelineStageStatus[];
  candidateOptimizations: CandidateSiteOptimization[];
  snapshotChecksum: string;
  summaryMetrics: {
    totalTractsEvaluated: number;
    facilitiesGeocoded: number;
    sviVulnerabilityIndexAvg: number;
    hrsaShortageAreasCount: number;
    avgDriveTimeReductionMin: number;
  };
}


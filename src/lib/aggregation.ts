import { Report, ServiceFacility, NeedZone, FilterOptions, NeedCategory } from './types';
import { getH3HexBoundary, getH3CenterCoordinates } from './hexGrid';
import { calculateHaversineDistanceKm } from './distance';
import { calculatePriorityScore } from './scoring';
import { CATEGORY_META } from './constants';

export function aggregateReportsToNeedZones(
  reports: Report[],
  facilities: ServiceFacility[],
  filters: FilterOptions
): NeedZone[] {
  const now = new Date('2026-10-01');
  const cutoffDate = new Date(now.getTime() - filters.dateRangeDays * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // 1. Filter reports according to selected filter options
  const filteredReports = reports.filter((rep) => {
    const repDate = new Date(rep.occurredAt);
    if (repDate < cutoffDate) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(rep.category)) return false;
    if (filters.severities.length > 0 && !filters.severities.includes(rep.severity)) return false;
    if (filters.sourceTypes.length > 0 && !filters.sourceTypes.includes(rep.sourceType)) return false;
    return true;
  });

  // 2. Group reports by H3 Index
  const groups: Record<string, Report[]> = {};
  filteredReports.forEach((rep) => {
    const key = rep.locationGridId || 'default-grid';
    if (!groups[key]) groups[key] = [];
    groups[key].push(rep);
  });

  // Determine max signal count for volume normalization
  const maxSignalCount = Math.max(1, ...Object.values(groups).map((g) => g.length));

  // 3. Compute NeedZone for each H3 cell
  const zones: NeedZone[] = [];

  Object.entries(groups).forEach(([h3Index, cellReports]) => {
    if (cellReports.length < filters.minSignalCount) return;

    const [centerLat, centerLng] = getH3CenterCoordinates(h3Index);
    const boundary = getH3HexBoundary(h3Index);

    // Primary category in this zone
    const categoryCounts: Record<string, number> = {};
    cellReports.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const primaryCategory = (Object.keys(categoryCounts).sort(
      (a, b) => categoryCounts[b] - categoryCounts[a]
    )[0] || 'healthcare') as NeedCategory;

    // Severity counts
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let recent30Count = 0;
    let prior30Count = 0;

    cellReports.forEach((r) => {
      if (r.severity === 'high') highCount++;
      else if (r.severity === 'medium') mediumCount++;
      else lowCount++;

      const date = new Date(r.occurredAt);
      if (date >= thirtyDaysAgo) recent30Count++;
      else if (date >= sixtyDaysAgo) prior30Count++;
    });

    // Find nearest relevant facility
    let minDistance = 999;
    let nearestFacilityName = 'None listed within 25 km';
    let nearestFacilityType = undefined;

    facilities.forEach((fac) => {
      if (fac.category === primaryCategory || facilities.length < 5) {
        const dist = calculateHaversineDistanceKm(centerLat, centerLng, fac.latitude, fac.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestFacilityName = fac.name;
          nearestFacilityType = fac.facilityType;
        }
      }
    });

    if (minDistance === 999) minDistance = 15;

    // Score calculation
    const scoreResult = calculatePriorityScore({
      signalCount: cellReports.length,
      maxSignalCount,
      highSeverityCount: highCount,
      mediumSeverityCount: mediumCount,
      lowSeverityCount: lowCount,
      recent30DayCount: recent30Count,
      prior30DayCount: prior30Count,
      nearestFacilityDistanceKm: minDistance,
    });

    // Trend direction
    let trendDirection: 'decreasing' | 'stable' | 'increasing' = 'stable';
    if (recent30Count > prior30Count * 1.25) trendDirection = 'increasing';
    else if (recent30Count < prior30Count * 0.75) trendDirection = 'decreasing';

    const townName = cellReports.find((r) => r.town)?.town || 'Rural District';
    const catLabel = CATEGORY_META[primaryCategory]?.label || primaryCategory;

    const explanation = generateZoneExplanation({
      categoryLabel: catLabel,
      signalCount: cellReports.length,
      highSeverityCount: highCount,
      distanceKm: minDistance,
      facilityName: nearestFacilityName,
      trendDirection,
      townName,
    });

    const recommendedActions = generateZoneRecommendations(primaryCategory, minDistance, scoreResult.label);

    const sampleSummaries = Array.from(new Set(cellReports.map((r) => r.summary))).slice(0, 3);

    zones.push({
      id: h3Index,
      gridId: h3Index,
      centerLatitude: centerLat,
      centerLongitude: centerLng,
      hexBoundary: boundary,
      category: primaryCategory,
      priorityScore: scoreResult.score,
      priorityLabel: scoreResult.label,
      confidenceLevel: cellReports.length >= 10 ? 'high' : cellReports.length >= 4 ? 'medium' : 'low',
      signalCount: cellReports.length,
      highSeverityCount: highCount,
      mediumSeverityCount: mediumCount,
      lowSeverityCount: lowCount,
      recent30DayCount: recent30Count,
      prior30DayCount: prior30Count,
      trendDirection,
      nearestFacilityDistanceKm: minDistance,
      nearestFacilityName,
      nearestFacilityType,
      sampleSummaries,
      explanation,
      recommendedActions,
      townName,
      updatedAt: new Date().toISOString(),
      isSynthetic: true,
    });
  });

  return zones.sort((a, b) => b.priorityScore - a.priorityScore);
}

function generateZoneExplanation(params: {
  categoryLabel: string;
  signalCount: number;
  highSeverityCount: number;
  distanceKm: number;
  facilityName: string;
  trendDirection: string;
  townName: string;
}): string {
  const { categoryLabel, signalCount, highSeverityCount, distanceKm, facilityName, trendDirection, townName } = params;

  return `Flagged for ${categoryLabel.toLowerCase()} in ${townName} based on ${signalCount} aggregated community reports (${highSeverityCount} high urgency). The nearest listed facility (${facilityName}) is approximately ${distanceKm} km away. Signal volume is currently ${trendDirection}.`;
}

function generateZoneRecommendations(category: NeedCategory, distanceKm: number, priority: string): string[] {
  const actions: string[] = [];

  if (priority === 'High-priority review') {
    actions.push('Validate signals with local community organizations and county officials.');
  }

  if (category === 'healthcare') {
    if (distanceKm > 10) {
      actions.push('Evaluate feasibility of mobile clinic visits or pharmacy delivery partnerships.');
    }
    actions.push('Conduct targeted community survey regarding evening healthcare accessibility.');
  } else if (category === 'water_sanitation') {
    actions.push('Coordinate with rural water district for pressure testing and quality sampling.');
    actions.push('Consider temporary bulk clean water distribution station.');
  } else if (category === 'transportation_emergency') {
    actions.push('Review rural transit route coverage and response times with local dispatch.');
    actions.push('Inspect road access conditions with county public works.');
  } else {
    actions.push('Convene local advisory group to review regional access barriers.');
  }

  return actions;
}

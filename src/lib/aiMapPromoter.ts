import { Report, NeedZone, NeedCategory } from './types';
import { getH3IndexFromCoordinates, getH3CenterCoordinates, getH3HexBoundary } from './hexGrid';
import { calculatePriorityScore } from './scoring';
import { CATEGORY_META } from './constants';

export interface AIMapPromotionResult {
  promotedZones: NeedZone[];
  newlyAddedZoneIds: string[];
  logMessages: string[];
}

/**
 * AI Map Promotion Engine:
 * Ingests incoming low-bandwidth rural report batches, aggregates them by H3 hex cell,
 * and when the report count meets or exceeds the threshold (min 3 signals),
 * automatically promotes the cluster into a brand new Need Zone on the map!
 */
export function evaluateAndPromoteReportsToMap(
  allReports: Report[],
  minThreshold: number = 3
): AIMapPromotionResult {
  const groups: Record<string, Report[]> = {};

  allReports.forEach((rep) => {
    const key = rep.locationGridId || getH3IndexFromCoordinates(rep.approximateLatitude, rep.approximateLongitude);
    if (!groups[key]) groups[key] = [];
    groups[key].push(rep);
  });

  const maxSignalCount = Math.max(1, ...Object.values(groups).map((g) => g.length));
  const promotedZones: NeedZone[] = [];
  const newlyAddedZoneIds: string[] = [];
  const logMessages: string[] = [];

  Object.entries(groups).forEach(([h3Index, cellReports]) => {
    // If enough rural reports accumulate in this grid cell, AI promotes it to a Need Zone on the map!
    if (cellReports.length >= minThreshold) {
      const [centerLat, centerLng] = getH3CenterCoordinates(h3Index);
      const boundary = getH3HexBoundary(h3Index);

      const categoryCounts: Record<string, number> = {};
      cellReports.forEach((r) => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      });

      const primaryCategory = (Object.keys(categoryCounts).sort(
        (a, b) => categoryCounts[b] - categoryCounts[a]
      )[0] || 'healthcare') as NeedCategory;

      const highCount = cellReports.filter((r) => r.severity === 'high').length;
      const mediumCount = cellReports.filter((r) => r.severity === 'medium').length;
      const lowCount = cellReports.filter((r) => r.severity === 'low').length;

      const scoreResult = calculatePriorityScore({
        signalCount: cellReports.length,
        maxSignalCount,
        highSeverityCount: highCount,
        mediumSeverityCount: mediumCount,
        lowSeverityCount: lowCount,
        recent30DayCount: cellReports.length,
        prior30DayCount: 0,
        nearestFacilityDistanceKm: 12,
      });

      const townName = cellReports.find((r) => r.town)?.town || 'Outlying Rural Zone';
      const catMeta = CATEGORY_META[primaryCategory];

      const isNewResidentCluster = cellReports.some((r) => r.tags.includes('resident_report') || r.tags.includes('low_data_report'));

      if (isNewResidentCluster) {
        newlyAddedZoneIds.push(h3Index);
        logMessages.push(
          `AI Engine: ${cellReports.length} rural reports accumulated in ${townName}. Cluster threshold met -> Automatically added new ${catMeta.label} Need Zone to map!`
        );
      }

      promotedZones.push({
        id: h3Index,
        gridId: h3Index,
        centerLatitude: centerLat,
        centerLongitude: centerLng,
        hexBoundary: boundary,
        category: primaryCategory,
        priorityScore: scoreResult.score,
        priorityLabel: scoreResult.label,
        confidenceLevel: cellReports.length >= 8 ? 'high' : 'medium',
        signalCount: cellReports.length,
        highSeverityCount: highCount,
        mediumSeverityCount: mediumCount,
        lowSeverityCount: lowCount,
        recent30DayCount: cellReports.length,
        prior30DayCount: 0,
        trendDirection: 'increasing',
        nearestFacilityDistanceKm: 12,
        nearestFacilityName: 'Regional County Health Center',
        sampleSummaries: Array.from(new Set(cellReports.map((r) => r.summary))).slice(0, 3),
        explanation: `AI Map Engine automatically created this zone after receiving ${cellReports.length} rural signals from low-data resident submissions in ${townName}.`,
        recommendedActions: [
          'AI Recommended: Dispatch local field survey team to validate community reports.',
          `Consider temporary mobile ${catMeta.label.toLowerCase()} outreach unit.`,
        ],
        townName,
        updatedAt: new Date().toISOString(),
        isSynthetic: false,
      });
    }
  });

  return {
    promotedZones,
    newlyAddedZoneIds,
    logMessages,
  };
}

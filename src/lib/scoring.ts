import { PriorityLabel } from './types';

export interface RawZoneMetrics {
  signalCount: number;
  maxSignalCount: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  recent30DayCount: number;
  prior30DayCount: number;
  nearestFacilityDistanceKm: number;
}

export interface CalculatedScore {
  score: number; // 0 - 100
  label: PriorityLabel;
  components: {
    volumeScore: number;
    severityScore: number;
    growthScore: number;
    distanceScore: number;
  };
}

export function calculatePriorityScore(metrics: RawZoneMetrics): CalculatedScore {
  const {
    signalCount,
    maxSignalCount,
    highSeverityCount,
    mediumSeverityCount,
    recent30DayCount,
    prior30DayCount,
    nearestFacilityDistanceKm,
  } = metrics;

  // 1. Normalized Signal Volume (0 - 100)
  const volumeNorm = maxSignalCount > 0 ? Math.min(100, (signalCount / Math.max(1, maxSignalCount)) * 100) : 0;

  // 2. Normalized Severity Weight (0 - 100)
  // High severity = weight 1.0, Medium = 0.6, Low = 0.2
  const totalWeight = highSeverityCount * 1.0 + mediumSeverityCount * 0.6 + (signalCount - highSeverityCount - mediumSeverityCount) * 0.2;
  const maxPossibleWeight = Math.max(1, signalCount) * 1.0;
  const severityNorm = Math.min(100, (totalWeight / maxPossibleWeight) * 100);

  // 3. Normalized Recent Growth (0 - 100)
  let growthNorm = 50; // default stable
  if (prior30DayCount === 0 && recent30DayCount > 0) {
    growthNorm = 85; // new spike
  } else if (prior30DayCount > 0) {
    const growthRatio = (recent30DayCount - prior30DayCount) / prior30DayCount;
    if (growthRatio > 0.5) growthNorm = 100;
    else if (growthRatio > 0.2) growthNorm = 80;
    else if (growthRatio >= -0.2) growthNorm = 50; // stable
    else growthNorm = 20; // decreasing
  }

  // 4. Normalized Facility Distance (0 - 100)
  // Distance > 20 km = 100 score, 0 km = 0 score
  const distanceNorm = Math.min(100, (nearestFacilityDistanceKm / 20) * 100);

  // Weighted Sum: 0.35 Volume + 0.25 Severity + 0.20 Growth + 0.20 Distance
  const finalScore = Math.round(
    0.35 * volumeNorm +
    0.25 * severityNorm +
    0.20 * growthNorm +
    0.20 * distanceNorm
  );

  const boundedScore = Math.max(0, Math.min(100, finalScore));

  let label: PriorityLabel = 'Monitor';
  if (boundedScore >= 65) {
    label = 'High-priority review';
  } else if (boundedScore >= 35) {
    label = 'Review';
  }

  return {
    score: boundedScore,
    label,
    components: {
      volumeScore: Math.round(volumeNorm),
      severityScore: Math.round(severityNorm),
      growthScore: Math.round(growthNorm),
      distanceScore: Math.round(distanceNorm),
    },
  };
}

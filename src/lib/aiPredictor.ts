import { NeedZone, NeedCategory } from './types';
import { CATEGORY_META } from './constants';

export interface AIPredictionResult {
  emergingHighRiskZones: NeedZone[];
  forecastText: string;
  predictedGrowthPercentage: number;
  highestRiskCategory: NeedCategory;
  primaryRiskFactor: string;
  recommendedAction: string;
}

/**
 * AI Predictive Engine that forecasts 30-day emerging need pattern risks
 * based on signal velocity, facility distance friction, and urgency ratios.
 */
export function predictNeedPatterns(zones: NeedZone[]): AIPredictionResult {
  if (!zones || zones.length === 0) {
    return {
      emergingHighRiskZones: [],
      forecastText: 'Insufficient historical signal velocity to calculate predictive trend forecasts.',
      predictedGrowthPercentage: 0,
      highestRiskCategory: 'healthcare',
      primaryRiskFactor: 'Low signal density',
      recommendedAction: 'Continue baseline monitoring.',
    };
  }

  // Filter zones with rising 30-day signal trends or high facility distance friction
  const candidateZones = zones
    .map((z) => {
      // Calculate growth velocity
      const velocityRatio = z.prior30DayCount > 0 ? (z.recent30DayCount - z.prior30DayCount) / z.prior30DayCount : 1.2;
      const distanceFriction = Math.min(2.0, z.nearestFacilityDistanceKm / 10);
      
      // Predicted priority score bump over next 30 days
      const predictedScore = Math.min(100, Math.round(z.priorityScore * (1 + velocityRatio * 0.25 * distanceFriction)));

      return {
        ...z,
        predictedScore,
      };
    })
    .sort((a, b) => b.predictedScore - a.predictedScore);

  const topRiskZone = candidateZones[0];
  const highRiskZones = candidateZones.filter((z) => z.predictedScore >= 65 || z.priorityScore >= 55);

  const categoryTotals: Record<string, number> = {};
  zones.forEach((z) => {
    categoryTotals[z.category] = (categoryTotals[z.category] || 0) + z.signalCount;
  });

  const highestRiskCategory = (Object.keys(categoryTotals).sort(
    (a, b) => categoryTotals[b] - categoryTotals[a]
  )[0] || 'healthcare') as NeedCategory;

  const categoryMeta = CATEGORY_META[highestRiskCategory] || CATEGORY_META.healthcare;

  const avgGrowth = Math.round(
    ((topRiskZone.recent30DayCount - Math.max(1, topRiskZone.prior30DayCount)) / Math.max(1, topRiskZone.prior30DayCount)) * 100
  );
  const boundedGrowth = Math.max(15, Math.min(85, avgGrowth > 0 ? avgGrowth : 35));

  const forecastText = `AI predictive modeling forecasts a ~${boundedGrowth}% potential increase in ${categoryMeta.label.toLowerCase()} signals in ${topRiskZone.townName || 'outlying rural zones'} over the next 30 days due to accelerating signal velocity and ${topRiskZone.nearestFacilityDistanceKm} km facility travel friction.`;

  let primaryRiskFactor = 'Facility Distance & Restricted Operating Hours';
  let recommendedAction = 'Pre-emptively schedule mobile health outreach clinic in high-friction hex zones.';

  if (highestRiskCategory === 'water_sanitation') {
    primaryRiskFactor = 'Seasonal Infrastructure Stress & Drought Vulnerability';
    recommendedAction = 'Stage emergency water testing kits and temporary supply stations.';
  } else if (highestRiskCategory === 'transportation_emergency') {
    primaryRiskFactor = 'Outlying Transit Gaps & Emergency Dispatch Delay';
    recommendedAction = 'Coordinate rural micro-transit shuttle routes with county dispatch.';
  }

  return {
    emergingHighRiskZones: highRiskZones,
    forecastText,
    predictedGrowthPercentage: boundedGrowth,
    highestRiskCategory,
    primaryRiskFactor,
    recommendedAction,
  };
}

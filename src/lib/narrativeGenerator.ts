import { NeedZone, NeedCategory } from './types';
import { CATEGORY_META } from './constants';

export function generateNarrativeSummary(zones: NeedZone[]): string {
  if (!zones || zones.length === 0) {
    return 'No potential need zones currently meet the active filter criteria. Try adjusting the signal threshold or expanding the date range.';
  }

  const highPriorityZones = zones.filter((z) => z.priorityLabel === 'High-priority review');
  const topZone = zones[0];
  const topCategoryLabel = CATEGORY_META[topZone.category]?.label || topZone.category;

  const categoryCounts: Record<NeedCategory, number> = {} as any;
  zones.forEach((z) => {
    categoryCounts[z.category] = (categoryCounts[z.category] || 0) + z.signalCount;
  });

  const dominantCategory = (Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b as NeedCategory] - categoryCounts[a as NeedCategory]
  )[0] || 'healthcare') as NeedCategory;

  const dominantLabel = CATEGORY_META[dominantCategory]?.label || dominantCategory;

  const increasingZones = zones.filter((z) => z.trendDirection === 'increasing');

  let text = `Analysis of Redwood Valley County signals identified ${zones.length} candidate need zones. `;

  if (highPriorityZones.length > 0) {
    text += `${highPriorityZones.length} zone(s) meet High-Priority Review status, led by ${topZone.townName || 'North Redwood'} (${topCategoryLabel}). `;
  } else {
    text += `All identified zones are currently categorized under Monitor or Review priority levels. `;
  }

  text += `The most frequent community concern across active signals is ${dominantLabel}. `;

  if (topZone.nearestFacilityDistanceKm > 8) {
    text += `In top-ranked areas, the nearest listed service facility is approximately ${topZone.nearestFacilityDistanceKm} km away. `;
  }

  if (increasingZones.length > 0) {
    text += `Report volume is rising in ${increasingZones.length} region(s), suggesting recent escalating access concerns over the past 30 days. `;
  }

  text += `These findings identify candidate areas for human evaluation and community survey validation.`;

  return text;
}

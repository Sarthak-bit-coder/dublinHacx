import Papa from 'papaparse';
import { CSVParseResult, Report, NeedCategory, SeverityLevel, SourceType } from './types';
import { scanHeadersForPII } from './piiScanner';
import { getH3IndexFromCoordinates } from './hexGrid';

export function parseAndValidateCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const piiCheck = scanHeadersForPII(headers);

        const acceptedRecords: Report[] = [];
        const validationMessages: string[] = [];
        let rejectedCount = 0;

        if (piiCheck.hasPIIHeader) {
          validationMessages.push(piiCheck.message);
        }

        results.data.forEach((row, index) => {
          try {
            // Flexible column matching
            const categoryRaw = getRowValue(row, ['category', 'service_category', 'type', 'need_category']);
            const severityRaw = getRowValue(row, ['severity', 'urgency', 'priority']);
            const summaryRaw = getRowValue(row, ['summary', 'description', 'issue', 'details', 'comment']);
            const latRaw = getRowValue(row, ['approximate_latitude', 'latitude', 'lat', 'approx_lat']);
            const lngRaw = getRowValue(row, ['approximate_longitude', 'longitude', 'lng', 'lon', 'approx_lng']);
            const dateRaw = getRowValue(row, ['date', 'occurred_at', 'timestamp', 'created_at']);

            const lat = parseFloat(latRaw || '0');
            const lng = parseFloat(lngRaw || '0');

            if (!latRaw || !lngRaw || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
              rejectedCount++;
              if (index < 5) validationMessages.push(`Row ${index + 1}: Missing or invalid approximate latitude/longitude.`);
              return;
            }

            const category = normalizeCategory(categoryRaw);
            const severity = normalizeSeverity(severityRaw);
            const summary = sanitizeSummary(summaryRaw);
            const occurredAt = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();
            const gridId = getH3IndexFromCoordinates(lat, lng);

            const report: Report = {
              id: `upload-${Date.now()}-${index}`,
              category,
              subcategory: categoryRaw || 'general',
              severity,
              sourceType: 'community_survey' as SourceType,
              summary: summary || 'Community service access concern submitted via data import.',
              approximateLatitude: lat,
              approximateLongitude: lng,
              locationGridId: gridId,
              occurredAt,
              createdAt: new Date().toISOString(),
              isSynthetic: false,
              status: 'active',
              tags: ['user_upload'],
            };

            acceptedRecords.push(report);
          } catch {
            rejectedCount++;
          }
        });

        resolve({
          success: acceptedRecords.length > 0,
          records: acceptedRecords,
          acceptedCount: acceptedRecords.length,
          rejectedCount,
          validationMessages,
          containsPII: piiCheck.hasPIIHeader,
          flaggedHeaders: piiCheck.flaggedHeaders,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          records: [],
          acceptedCount: 0,
          rejectedCount: 0,
          validationMessages: [`Failed to parse CSV file: ${error.message}`],
          containsPII: false,
          flaggedHeaders: [],
        });
      },
    });
  });
}

function getRowValue(row: Record<string, string>, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    const matchedKey = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
    if (matchedKey && row[matchedKey]) {
      return row[matchedKey].toString().trim();
    }
  }
  return '';
}

function normalizeCategory(val: string): NeedCategory {
  const lower = val.toLowerCase();
  if (lower.includes('health') || lower.includes('pharm') || lower.includes('clinic') || lower.includes('doctor')) return 'healthcare';
  if (lower.includes('water') || lower.includes('sanitat') || lower.includes('well') || lower.includes('pipe')) return 'water_sanitation';
  if (lower.includes('transit') || lower.includes('bus') || lower.includes('road') || lower.includes('emerg') || lower.includes('ride')) return 'transportation_emergency';
  if (lower.includes('food') || lower.includes('pantry') || lower.includes('grocer')) return 'food_access';
  if (lower.includes('internet') || lower.includes('broadband') || lower.includes('wifi')) return 'broadband';
  return 'healthcare';
}

function normalizeSeverity(val: string): SeverityLevel {
  const lower = val.toLowerCase();
  if (lower.includes('high') || lower.includes('urgent') || lower.includes('critical') || lower === '3') return 'high';
  if (lower.includes('med') || lower.includes('moderate') || lower === '2') return 'medium';
  return 'low';
}

function sanitizeSummary(val: string): string {
  if (!val) return 'Generalized community signal record.';
  // Strip email addresses or phone numbers if present in free text
  return val
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED PHONE]')
    .slice(0, 180); // Cap text length
}

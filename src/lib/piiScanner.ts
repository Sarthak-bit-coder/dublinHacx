import { PIIHeaderCheckResult } from './types';

// Sensitive PII header keywords to check
const SENSITIVE_HEADERS = [
  'name',
  'fullname',
  'full_name',
  'first_name',
  'last_name',
  'email',
  'email_address',
  'phone',
  'telephone',
  'mobile',
  'ssn',
  'social_security',
  'address',
  'home_address',
  'street_address',
  'dob',
  'birthdate',
  'date_of_birth',
  'patient_name',
  'medical_record',
  'case_number',
  'zipcode_exact',
];

/**
 * Scans CSV headers for potential PII fields.
 */
export function scanHeadersForPII(headers: string[]): PIIHeaderCheckResult {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, '_'));
  const flagged: string[] = [];

  normalizedHeaders.forEach((header, index) => {
    const original = headers[index];
    if (SENSITIVE_HEADERS.some((sensitive) => header.includes(sensitive))) {
      flagged.push(original);
    }
  });

  if (flagged.length > 0) {
    return {
      hasPIIHeader: true,
      flaggedHeaders: flagged,
      message: `Warning: Uploaded file contains columns that may expose personally identifiable information (${flagged.join(', ')}). NeedMap automatically strips or redacts these fields.`,
    };
  }

  return {
    hasPIIHeader: false,
    flaggedHeaders: [],
    message: 'Headers passed client-side PII check.',
  };
}

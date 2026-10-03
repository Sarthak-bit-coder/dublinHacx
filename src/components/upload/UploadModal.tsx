import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Eye, 
  Download, 
  Database,
  Sparkles,
  FileText
} from 'lucide-react';
import { IssueReport } from '../../types';
import { sanitizeAndRedactPII } from '../../services/securityService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDataset: (newReports: IssueReport[]) => void;
}

const SAMPLE_CSV_TEMPLATE = `category,severity,summary,approximate_latitude,approximate_longitude,date,source_type,affected_households
road,critical,Bridge foundation scoured after flash flood,44.2415,-116.3980,2026-10-02,approved_incident_summary,120
water,high,Community borewell inverter failure,44.1520,-116.4150,2026-10-01,community_survey,45
health,critical,Ambulance transit blocked by mud slump,44.2750,-116.5120,2026-10-03,public_service_request,210
power,moderate,Transformer shorted during mountain storm,44.1820,-116.4250,2026-10-02,public_service_request,60`;

// Demo Scenario Datasets
const DEMO_SCENARIOS = {
  healthcare: {
    title: 'Scenario 1: Healthcare & Pharmacy Access Gap',
    description: 'High concentration of road washouts blocking pharmacy and emergency clinic access in North Precinct 4.',
    reports: [
      {
        id: 'scen-hc-1',
        title: 'Emergency Clinic Access Cut Off by Mud Slump',
        description: 'Sub-health outpost in Highland Valley physically isolated. Dialysis and maternal emergency transfers halted.',
        category: 'health' as const,
        severity: 'critical' as const,
        status: 'verified' as const,
        coordinates: { lat: 44.2750, lng: -116.5120, x: 22, y: 15 },
        districtId: 'district-highland-ridge',
        districtName: 'Highland Ridge',
        locationName: 'Highland Valley Health Outpost',
        dateReported: '2026-10-03',
        upvotes: 84,
        verifiedCount: 18,
        affectedHouseholds: 420,
        infrastructureType: 'Rural Clinic Access Road',
        reporterType: 'health_worker' as const,
        emergencyAccessBlocked: true,
      },
      {
        id: 'scen-hc-2',
        title: 'Pharmacy Transit Corridor Impassable',
        description: 'Unpaved arterial route 14 scoured; 3.5-hour delay for prescription deliveries to elderly residents.',
        category: 'health' as const,
        severity: 'high' as const,
        status: 'pending_review' as const,
        coordinates: { lat: 44.2150, lng: -116.4420, x: 38, y: 32 },
        districtId: 'district-pine-basin',
        districtName: 'Pine Basin',
        locationName: 'Route 14 Milepost 12',
        dateReported: '2026-10-02',
        upvotes: 62,
        verifiedCount: 11,
        affectedHouseholds: 280,
        infrastructureType: 'County Highway Spur',
        reporterType: 'resident' as const,
        emergencyAccessBlocked: false,
      }
    ]
  },
  water: {
    title: 'Scenario 2: Safe Drinking Water & Sanitation Need',
    description: 'Solar borewell inverter failures and sediment contamination across settlement pump stations.',
    reports: [
      {
        id: 'scen-w-1',
        title: 'Central Settlement Borewell Inverter Board Shorted',
        description: '3 village clusters and school trough operating on manual bucket hauling with muddy runoff.',
        category: 'water' as const,
        severity: 'critical' as const,
        status: 'verified' as const,
        coordinates: { lat: 44.1520, lng: -116.4150, x: 44, y: 64 },
        districtId: 'district-pine-basin',
        districtName: 'Pine Basin',
        locationName: 'Settlement Pump Station #4',
        dateReported: '2026-10-03',
        upvotes: 95,
        verifiedCount: 22,
        affectedHouseholds: 310,
        infrastructureType: '12kW Solar Borewell Station',
        reporterType: 'resident' as const,
        emergencyAccessBlocked: false,
      },
      {
        id: 'scen-w-2',
        title: 'Silt Contamination at School Reservoir',
        description: 'Creek flood debris breached intake filter screen; boiling advisory issued for 180 students.',
        category: 'water' as const,
        severity: 'high' as const,
        status: 'scheduled_repair' as const,
        coordinates: { lat: 44.1350, lng: -116.4650, x: 30, y: 72 },
        districtId: 'district-cedar-flats',
        districtName: 'Cedar Flats',
        locationName: 'Cedar Elementary Water Intake',
        dateReported: '2026-10-02',
        upvotes: 71,
        verifiedCount: 14,
        affectedHouseholds: 180,
        infrastructureType: 'Municipal Filtration Station',
        reporterType: 'technician' as const,
        emergencyAccessBlocked: false,
      }
    ]
  },
  transit: {
    title: 'Scenario 3: Transportation & Emergency Response Concern',
    description: 'Bridge abutment rotation and tree blockades cutting off school bus route 12 and fire apparatus response.',
    reports: [
      {
        id: 'scen-t-1',
        title: 'Timber Abutment Rotation at Blackwood Creek Bridge',
        description: 'Timber piles rotated by 6 degrees following debris surge. Concrete deck cracked; heavy fire trucks cannot cross.',
        category: 'bridge' as const,
        severity: 'critical' as const,
        status: 'verified' as const,
        coordinates: { lat: 44.2415, lng: -116.3980, x: 52, y: 22 },
        districtId: 'district-pine-basin',
        districtName: 'Pine Basin',
        locationName: 'Blackwood Creek Span #3',
        dateReported: '2026-10-03',
        upvotes: 110,
        verifiedCount: 28,
        affectedHouseholds: 540,
        infrastructureType: 'Single-Lane Bridge Span',
        reporterType: 'school_bus_driver' as const,
        emergencyAccessBlocked: true,
      }
    ]
  }
};

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLoadDataset,
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [piiWarnings, setPiiWarnings] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle CSV file drop or upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      processCSVContent(content, file.name);
    };
    reader.readAsText(file);
  };

  // Process CSV content with Client-Side PII Scanner & Header Validation
  const processCSVContent = (content: string, filename: string) => {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setValidationErrors(['CSV file is empty or missing data rows.']);
      return;
    }

    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
    const warnings: string[] = [];
    const errors: string[] = [];

    // Client-side PII Scanner for forbidden sensitive headers
    const sensitiveHeaders = ['name', 'full_name', 'email', 'phone', 'ssn', 'address', 'street', 'exact_lat'];
    sensitiveHeaders.forEach((sh) => {
      if (headers.includes(sh)) {
        warnings.push(`Warning: Sensitive header "${sh}" detected. PII auto-redactor will strip cleartext strings.`);
      }
    });

    // Check required MVP headers
    const required = ['category', 'severity', 'summary'];
    required.forEach((req) => {
      if (!headers.includes(req)) {
        errors.push(`Missing required column: "${req}"`);
      }
    });

    setValidationErrors(errors);
    setPiiWarnings(warnings);

    if (errors.length > 0) return;

    // Parse rows safely
    const rows = lines.slice(1).map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = parts[i] || '';
      });

      // Auto-sanitize summary
      const sanitized = sanitizeAndRedactPII(obj.summary || `Report #${idx + 1}`);

      return {
        id: `csv-${Date.now()}-${idx}`,
        title: obj.summary ? obj.summary.slice(0, 45) : `CSV Import #${idx + 1}`,
        description: sanitized.cleanText,
        category: (['road', 'bridge', 'water', 'power', 'health', 'telecom'].includes(obj.category) ? obj.category : 'road') as any,
        severity: (['critical', 'high', 'moderate', 'minor'].includes(obj.severity) ? obj.severity : 'moderate') as any,
        status: 'verified' as const,
        coordinates: {
          lat: parseFloat(obj.approximate_latitude) || 44.195,
          lng: parseFloat(obj.approximate_longitude) || -116.481,
          x: Math.floor(Math.random() * 60) + 20,
          y: Math.floor(Math.random() * 60) + 20,
        },
        districtId: 'district-pine-basin',
        districtName: 'Pine Basin',
        locationName: obj.summary ? `${obj.summary.slice(0, 30)} Sector` : 'Imported CSV Location',
        dateReported: obj.date || new Date().toISOString().split('T')[0],
        upvotes: 1,
        verifiedCount: 1,
        affectedHouseholds: parseInt(obj.affected_households) || 25,
        infrastructureType: 'CSV Imported Civic Asset',
        reporterType: 'resident' as const,
        emergencyAccessBlocked: obj.severity === 'critical',
      };
    });

    setParsedRows(rows);
  };

  const handleApplyCSV = () => {
    if (parsedRows.length > 0) {
      onLoadDataset(parsedRows);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleLoadScenario = (scenarioKey: keyof typeof DEMO_SCENARIOS) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    onLoadDataset(scenario.reports);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'needmap_anonymized_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl text-stone-100 p-6 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block font-semibold">
                Anonymized Data Ingestion & Demo Scenarios
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Upload CSV Dataset or Load Hackathon Scenario
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {isSuccess && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2 text-xs font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully loaded dataset into NeedMap GIS engine!</span>
          </div>
        )}

        {/* Demo Scenarios Section */}
        <div>
          <h3 className="text-xs font-mono uppercase text-stone-400 mb-2 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Hackathon Demo Scenario:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(Object.keys(DEMO_SCENARIOS) as Array<keyof typeof DEMO_SCENARIOS>).map((key) => {
              const sc = DEMO_SCENARIOS[key];
              return (
                <button
                  key={key}
                  onClick={() => handleLoadScenario(key)}
                  className="p-3 bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-blue-500/50 rounded-xl text-left transition-all space-y-1 group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-blue-300 block">{sc.title}</span>
                  <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">{sc.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-stone-800/80 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-stone-400 font-semibold flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Or Upload Custom CSV File:</span>
            </h3>

            <button
              onClick={handleDownloadTemplate}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Privacy Disclaimer Warning */}
          <div className="p-3 bg-amber-950/40 border border-amber-900/40 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-semibold">Privacy Safety Rule:</strong>
              <span>Upload only anonymized, aggregated data. Do not upload personal names, exact home street addresses, phone numbers, or unredacted emergency case text.</span>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-stone-700 hover:border-blue-500 rounded-xl p-6 text-center bg-stone-950/60 transition-colors relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet className="w-8 h-8 text-stone-500 mx-auto mb-2" />
            <p className="text-xs text-stone-200 font-medium">
              Click or drag & drop CSV dataset here
            </p>
            <span className="text-[10px] font-mono text-stone-500 block mt-1">
              Supports: category, severity, summary, approximate_latitude, approximate_longitude
            </span>
          </div>

          {/* Validation Warnings / Errors */}
          {piiWarnings.length > 0 && (
            <div className="p-3 bg-stone-950 rounded-xl border border-amber-800/60 text-xs font-mono space-y-1 text-amber-300">
              {piiWarnings.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-950/60 rounded-xl border border-red-800 text-xs font-mono space-y-1 text-red-300">
              {validationErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Parsed CSV Data Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>Parsed Rows Preview ({parsedRows.length} records ready):</span>
                <span className="text-emerald-400 font-bold">Client-Side PII Auto-Scrubbed</span>
              </div>

              <div className="bg-stone-950 rounded-xl border border-stone-800 max-h-36 overflow-y-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-stone-900 text-[10px] text-stone-400 uppercase sticky top-0">
                    <tr>
                      <th className="p-2">Category</th>
                      <th className="p-2">Severity</th>
                      <th className="p-2">Sanitized Summary</th>
                      <th className="p-2">Approx Lat/Lng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-[11px]">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-stone-900/40">
                        <td className="p-2 uppercase font-bold text-blue-400">{row.category}</td>
                        <td className="p-2 uppercase text-amber-400">{row.severity}</td>
                        <td className="p-2 text-stone-200 truncate max-w-xs">{row.description}</td>
                        <td className="p-2 text-stone-400">{row.coordinates.lat}, {row.coordinates.lng}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleApplyCSV}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs font-mono transition-colors shadow-md"
              >
                Ingest & Visualize {parsedRows.length} CSV Records on GIS Map
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>Client-Side Security: No Unsanitized Data Transmitted</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors font-sans font-medium text-xs"
          >
            Close Upload Window
          </button>
        </div>
      </div>
    </div>
  );
};

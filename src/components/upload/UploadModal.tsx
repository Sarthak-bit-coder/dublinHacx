import React, { useState } from 'react';
import { Upload, X, FileText, AlertTriangle, CheckCircle, ShieldCheck, Download } from 'lucide-react';
import { parseAndValidateCSV } from '../../lib/csvValidator';
import { CSVParseResult, Report } from '../../lib/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (newReports: Report[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onImportData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const result = await parseAndValidateCSV(selectedFile);
      setParseResult(result);
    } catch {
      alert('Error parsing CSV file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.records.length > 0) {
      onImportData(parseResult.records);
      onClose();
      // Reset state
      setFile(null);
      setParseResult(null);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'category,severity,summary,approximate_latitude,approximate_longitude,date\n' +
      'healthcare,high,"Pharmacy distance issue in north region",39.2200,-123.2500,2026-09-15\n' +
      'water_sanitation,medium,"Water pressure drop reported",39.1800,-123.1200,2026-09-20\n' +
      'transportation_emergency,high,"Missed rural transit connection",39.0500,-123.1800,2026-09-22\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'needmap_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base tracking-tight">Upload Community Signal CSV</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Privacy Guidance Callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Client-Side Privacy Guarantee:</strong> NeedMap processes CSVs entirely in your browser. Raw files are never uploaded to any remote server or database. Do not upload personal names, exact house numbers, or phone numbers.
            </div>
          </div>

          {/* Download Template Link */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600">Need a sample CSV format?</span>
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 hover:underline"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Dropzone */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-800">
                  Drag and drop your .csv dataset here
                </p>
                <p className="text-xs text-slate-500 mt-1">or click to browse your computer</p>
                <p className="text-[11px] text-slate-400 mt-3 font-mono">
                  Expected headers: category, severity, summary, approximate_latitude, approximate_longitude
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900">{file.name}</span>
                  <span className="text-slate-400 font-mono">({Math.round(file.size / 1024)} KB)</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParseResult(null);
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Remove file
                </button>
              </div>

              {isProcessing && (
                <div className="p-4 text-center text-xs text-slate-600 animate-pulse">
                  Scanning headers and validating coordinates...
                </div>
              )}

              {/* PII Alert if Flagged */}
              {parseResult?.containsPII && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-900 mb-1">PII Warning Detected</h5>
                    <p className="text-amber-800">
                      Found potential personal identification columns ({parseResult.flaggedHeaders.join(', ')}). NeedMap automatically stripped these attributes to protect resident privacy.
                    </p>
                  </div>
                </div>
              )}

              {/* Parse Validation Results Summary */}
              {parseResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Accepted Records:</span>
                    <strong className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {parseResult.acceptedCount} valid records
                    </strong>
                  </div>

                  {parseResult.rejectedCount > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Rejected invalid rows:</span>
                      <strong className="text-red-600">{parseResult.rejectedCount} rows</strong>
                    </div>
                  )}

                  {/* Preview of first 3 records */}
                  {parseResult.records.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Sanitized Ingestion Preview
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {parseResult.records.slice(0, 3).map((rec, i) => (
                          <div key={i} className="text-xs bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                            <span className="truncate max-w-xs text-slate-700">"{rec.summary}"</span>
                            <span className="font-mono text-slate-500 shrink-0 ml-2">
                              {rec.approximateLatitude.toFixed(2)}, {rec.approximateLongitude.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!parseResult || parseResult.acceptedCount === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
          >
            Analyze & Update Map ({parseResult?.acceptedCount || 0} Records)
          </button>
        </div>
      </div>
    </div>
  );
};

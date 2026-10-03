import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Report } from '../../lib/types';
import { CATEGORY_META } from '../../lib/constants';

interface ReportMarkersProps {
  reports: Report[];
}

function createCustomReportIcon(category: string, severity: string): L.DivIcon {
  let bgColor = '#2563eb';
  if (category === 'water_sanitation') bgColor = '#0891b2';
  else if (category === 'transportation_emergency') bgColor = '#d97706';
  else if (category === 'food_access') bgColor = '#16a34a';

  const borderColor = severity === 'high' ? '#ef4444' : '#ffffff';

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
      border: 2px solid ${borderColor};
      opacity: 0.9;
    ">
      <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-report-signal-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export const ReportMarkers: React.FC<ReportMarkersProps> = ({ reports }) => {
  // Show max 60 report markers to keep map fast and clean
  const displayReports = reports.slice(0, 60);

  return (
    <>
      {displayReports.map((rep) => {
        const icon = createCustomReportIcon(rep.category, rep.severity);
        const meta = CATEGORY_META[rep.category];

        return (
          <Marker key={rep.id} position={[rep.approximateLatitude, rep.approximateLongitude]} icon={icon}>
            <Popup className="font-sans text-xs">
              <div className="p-1 max-w-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta?.badgeColor || 'bg-blue-100 text-blue-800'}`}>
                    {meta?.label || rep.category}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {rep.severity} Urgency
                  </span>
                </div>
                <p className="text-slate-800 font-medium text-xs mb-1.5">"{rep.summary}"</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1">
                  <span>Location: {rep.town || 'Rural Zone'}</span>
                  <span>{new Date(rep.occurredAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

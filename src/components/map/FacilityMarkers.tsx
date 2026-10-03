import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ServiceFacility } from '../../lib/types';

interface FacilityMarkersProps {
  facilities: ServiceFacility[];
}

// Function to generate custom Leaflet divIcon with clean HTML & SVG
function createCustomFacilityIcon(type: string): L.DivIcon {
  let bgColor = '#2563eb'; // blue
  let symbolSvg = `<path d="M12 2v20M2 12h20" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`; // Hospital plus

  if (type === 'pharmacy') {
    bgColor = '#16a34a'; // green
    symbolSvg = `<circle cx="12" cy="12" r="6" fill="none" stroke="white" stroke-width="2.5"/>`;
  } else if (type === 'water_station') {
    bgColor = '#0891b2'; // cyan
    symbolSvg = `<path d="M12 2.5C12 2.5 5 10 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2.5 12 2.5Z" fill="white"/>`;
  } else if (type === 'transit_hub') {
    bgColor = '#d97706'; // amber
    symbolSvg = `<path d="M4 16l8-8 8 8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`;
  } else if (type === 'emergency_station') {
    bgColor = '#dc2626'; // red
    symbolSvg = `<polygon points="12,2 22,22 2,22" fill="white"/>`;
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
      border: 2px solid white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        ${symbolSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-facility-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export const FacilityMarkers: React.FC<FacilityMarkersProps> = ({ facilities }) => {
  return (
    <>
      {facilities.map((fac) => {
        const icon = createCustomFacilityIcon(fac.facilityType);

        return (
          <Marker key={fac.id} position={[fac.latitude, fac.longitude]} icon={icon}>
            <Popup className="font-sans text-xs">
              <div className="p-1 max-w-xs">
                <div className="font-bold text-slate-900 text-sm mb-1">{fac.name}</div>
                <div className="text-slate-600 text-xs mb-1.5">{fac.addressOrAreaDescription}</div>
                {fac.hours && (
                  <div className="text-[11px] text-slate-500 bg-slate-100 p-1.5 rounded-md border border-slate-200 mb-1">
                    Hours: <strong>{fac.hours}</strong>
                  </div>
                )}
                <div className="text-[10px] text-slate-400">Verified: {fac.verifiedAt} ({fac.source})</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

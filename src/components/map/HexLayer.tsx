import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { NeedZone } from '../../lib/types';
import { PRIORITY_META } from '../../lib/constants';

interface HexLayerProps {
  needZones: NeedZone[];
  selectedZone: NeedZone | null;
  onSelectZone: (zone: NeedZone | null) => void;
}

export const HexLayer: React.FC<HexLayerProps> = ({
  needZones,
  selectedZone,
  onSelectZone,
}) => {
  return (
    <>
      {needZones.map((zone) => {
        const isSelected = selectedZone?.id === zone.id;
        const priorityMeta = PRIORITY_META[zone.priorityLabel];
        const color = priorityMeta.hexColor;

        return (
          <Polygon
            key={zone.id}
            positions={zone.hexBoundary}
            pathOptions={{
              color: isSelected ? '#1e293b' : color,
              weight: isSelected ? 3.5 : 1.8,
              fillColor: color,
              fillOpacity: isSelected ? 0.75 : 0.45,
              dashArray: isSelected ? undefined : zone.priorityLabel === 'Monitor' ? '4, 4' : undefined,
            }}
            eventHandlers={{
              click: () => onSelectZone(zone),
            }}
          >
            <Tooltip sticky className="custom-hex-tooltip font-sans shadow-md">
              <div className="p-1 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-bold text-slate-900 text-xs">{zone.townName} Zone</span>
                </div>
                <div className="text-xs text-slate-600 mb-1">
                  Priority: <strong style={{ color }}>{zone.priorityLabel} ({zone.priorityScore}/100)</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Aggregated Signals: <strong>{zone.signalCount}</strong> ({zone.highSeverityCount} high urgency)
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
};

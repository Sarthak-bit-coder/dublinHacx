import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { NeedZone, ServiceFacility, Report } from '../../lib/types';
import { MAP_DEFAULTS } from '../../lib/constants';
import { HexLayer } from './HexLayer';
import { FacilityMarkers } from './FacilityMarkers';
import { ReportMarkers } from './ReportMarkers';
import { MapLegend } from './MapLegend';

interface MapViewProps {
  needZones: NeedZone[];
  facilities: ServiceFacility[];
  reports?: Report[];
  selectedZone: NeedZone | null;
  onSelectZone: (zone: NeedZone | null) => void;
  showFacilities: boolean;
  showReportClusters: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  needZones,
  facilities,
  reports = [],
  selectedZone,
  onSelectZone,
  showFacilities,
  showReportClusters,
}) => {
  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      <MapContainer
        center={MAP_DEFAULTS.center}
        zoom={MAP_DEFAULTS.zoom}
        minZoom={MAP_DEFAULTS.minZoom}
        maxZoom={MAP_DEFAULTS.maxZoom}
        className="w-full h-full z-10"
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tile Layer (Free, clean style) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* H3 Hexagonal Grid Zones Layer */}
        <HexLayer
          needZones={needZones}
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
        />

        {/* Service Facilities Markers Layer */}
        {showFacilities && <FacilityMarkers facilities={facilities} />}

        {/* Individual Anonymized Report Markers Layer */}
        {showReportClusters && <ReportMarkers reports={reports} />}
      </MapContainer>

      {/* Floating Map Legend */}
      <MapLegend />
    </div>
  );
};;

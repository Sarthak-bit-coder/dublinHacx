import * as h3 from 'h3-js';
import { MAP_DEFAULTS } from './constants';

/**
 * Gets the H3 cell index for a geographic point at resolution 7.
 */
export function getH3IndexFromCoordinates(
  lat: number,
  lng: number,
  resolution: number = MAP_DEFAULTS.h3Resolution
): string {
  return h3.latLngToCell(lat, lng, resolution);
}

/**
 * Gets the polygon boundary coordinates [lat, lng][] for a given H3 cell index.
 * Useful for Leaflet polygon rendering.
 */
export function getH3HexBoundary(h3Index: string): [number, number][] {
  try {
    const boundary = h3.cellToBoundary(h3Index);
    // h3.cellToBoundary returns Array of [lat, lng]
    return boundary.map(([lat, lng]) => [lat, lng] as [number, number]);
  } catch {
    // Fallback default polygon if invalid index
    return [];
  }
}

/**
 * Gets the center centerLatitude and centerLongitude of an H3 cell.
 */
export function getH3CenterCoordinates(h3Index: string): [number, number] {
  try {
    const [lat, lng] = h3.cellToLatLng(h3Index);
    return [lat, lng];
  } catch {
    return [MAP_DEFAULTS.center[0], MAP_DEFAULTS.center[1]];
  }
}

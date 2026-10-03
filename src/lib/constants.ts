import { NeedCategory, PriorityLabel, FacilityType } from './types';

export const CATEGORY_META: Record<
  NeedCategory,
  { label: string; description: string; color: string; badgeColor: string; iconName: string }
> = {
  healthcare: {
    label: 'Healthcare & Pharmacy Access',
    description: 'Long travel distance to urgent care, primary clinics, or evening pharmacies.',
    color: '#2563eb', // Blue
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconName: 'Activity',
  },
  water_sanitation: {
    label: 'Safe Water & Sanitation',
    description: 'Unreliable water delivery, pressure drops, or water quality concerns.',
    color: '#0891b2', // Cyan / Teal
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    iconName: 'Droplets',
  },
  transportation_emergency: {
    label: 'Transit & Emergency Access',
    description: 'Sparse emergency response coverage, missed transit rides, or road closures.',
    color: '#d97706', // Amber / Orange
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'Truck',
  },
  food_access: {
    label: 'Food Access & Pantry Services',
    description: 'Distance to fresh groceries or community nutrition pantries.',
    color: '#16a34a', // Green
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    iconName: 'ShoppingBag',
  },
  broadband: {
    label: 'Broadband & Digital Services',
    description: 'Unreliable internet connectivity for remote health or municipal services.',
    color: '#9333ea', // Purple
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconName: 'Wifi',
  },
};

export const PRIORITY_META: Record<
  PriorityLabel,
  { label: string; minScore: number; maxScore: number; hexColor: string; bgClass: string; textClass: string; borderClass: string }
> = {
  Monitor: {
    label: 'Monitor',
    minScore: 0,
    maxScore: 34,
    hexColor: '#64748b', // Slate
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
  },
  Review: {
    label: 'Review',
    minScore: 35,
    maxScore: 64,
    hexColor: '#f59e0b', // Amber
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
  },
  'High-priority review': {
    label: 'High-priority review',
    minScore: 65,
    maxScore: 100,
    hexColor: '#ef4444', // Red
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
  },
};

export const FACILITY_META: Record<FacilityType, { label: string; iconName: string }> = {
  pharmacy: { label: 'Pharmacy', iconName: 'Pill' },
  clinic_hospital: { label: 'Clinic / Urgent Care', iconName: 'Hospital' },
  water_station: { label: 'Safe Water Distribution', iconName: 'Droplet' },
  transit_hub: { label: 'Transit Stop / Mobility Hub', iconName: 'Bus' },
  emergency_station: { label: 'Fire / EMS Station', iconName: 'Siren' },
  shelter: { label: 'Community Resource Center', iconName: 'Home' },
};

// Redwood Valley County Center (Fictional rural county mapped around coordinates 39.15, -123.20)
export const MAP_DEFAULTS = {
  center: [39.15, -123.20] as [number, number],
  zoom: 10,
  minZoom: 8,
  maxZoom: 14,
  h3Resolution: 7, // ~5 km2 hex cells
};

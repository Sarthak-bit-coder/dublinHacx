import { WeatherImpactData } from '../types';

export async function fetchWeatherImpact(): Promise<WeatherImpactData> {
  try {
    const res = await fetch('/api/weather-impact');
    if (!res.ok) {
      throw new Error(`Weather telemetry server returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Using client fallback weather telemetry:', error);
    return {
      timestamp: new Date().toISOString(),
      overallImpactLevel: 'Severe',
      erosionMultiplier: 2.4,
      precipitation24hMm: 41.8,
      soilSaturationPct: 86,
      weatherCondition: 'High-Volume Monsoon Runoff',
      temperatureC: 7.8,
      windSpeedKph: 36,
      alertHeadline: 'Creek Basin Surcharge & Embankment Erosion Alert',
      districtBreakdown: [
        {
          district: 'Pine Basin',
          precipitationMm: 47.0,
          saturationPct: 92,
          washoutRisk: 'Critical',
          primaryVulnerability: 'East Ridge culvert overflow & timber foundation scouring',
        },
        {
          district: 'Highland Ridge',
          precipitationMm: 38.0,
          saturationPct: 86,
          washoutRisk: 'High',
          primaryVulnerability: 'Highland pass hillside slump & ambulance access blockage',
        },
        {
          district: 'Cedar Flats',
          precipitationMm: 24.5,
          saturationPct: 70,
          washoutRisk: 'Moderate',
          primaryVulnerability: 'Silt sedimentation in school drinking water borehole',
        },
      ],
    };
  }
}

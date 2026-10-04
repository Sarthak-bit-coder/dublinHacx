import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

type Category =
  | "all"
  | "healthcare"
  | "water"
  | "transportation"
  | "emergency_response"
  | "food"
  | "broadband"
  | "other";

type TimeRange = "all" | "24h" | "7d" | "30d";

type Complaint = {
  id: string;
  latitude: number;
  longitude: number;
  category: Exclude<Category, "all">;
  severity: string;
  summary: string;
  locationPrecision: string;
  submittedAt?: { toDate?: () => Date };
};

type Recommendation = {
  id: string;
  category: Exclude<Category, "all">;
  service: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  priorityScore: number;
  complaints: Complaint[];
  connectionDistanceKm: number;
};

type MapViewport = {
  south: number;
  west: number;
  north: number;
  east: number;
};

const urgencyWeight: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const complaintColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

const categoryLabels: Record<Exclude<Category, "all">, string> = {
  healthcare: "Healthcare",
  water: "Water",
  transportation: "Transport",
  emergency_response: "Emergency response",
  food: "Food access",
  broadband: "Broadband",
  other: "Other services",
};

const categoryFilterLabels: Record<Category, string> = {
  all: "All",
  healthcare: "Healthcare",
  water: "Water",
  transportation: "Transport",
  emergency_response: "Emergency",
  food: "Food",
  broadband: "Broadband",
  other: "Other",
};

const serviceRecommendations: Record<Exclude<Category, "all">, string> = {
  healthcare: "Candidate pharmacy / clinic access point",
  water: "Candidate water-access assessment point",
  transportation: "Candidate transport / road-access review point",
  emergency_response: "Candidate emergency-response access point",
  food: "Candidate food-access distribution point",
  broadband: "Candidate broadband access hub",
  other: "Candidate essential-service review point",
};

const MIN_REPORTS_PER_CLUSTER = 2;
const MIN_CONNECTION_DISTANCE_KM = 2;
const MAX_CONNECTION_DISTANCE_KM = 100;
const CONNECTION_DISTANCE_MULTIPLIER = 2.5;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return replacements[character];
  });
}

function formatSeverity(severity: string) {
  if (!severity) return "Not specified";
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function formatTime(submittedAt: Complaint["submittedAt"]) {
  if (!submittedAt?.toDate) return "Just submitted";

  return submittedAt.toDate().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function distanceInKm(first: Complaint, second: Complaint) {
  const earthRadiusKm = 6371;
  const latitudeDifference =
    ((second.latitude - first.latitude) * Math.PI) / 180;
  const longitudeDifference =
    ((second.longitude - first.longitude) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos((first.latitude * Math.PI) / 180) *
      Math.cos((second.latitude * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function adaptiveConnectionDistanceKm(categoryReports: Complaint[]) {
  if (categoryReports.length < 2) {
    return MIN_CONNECTION_DISTANCE_KM;
  }

  const nearestNeighborDistances = categoryReports.map((complaint) => {
    const distances = categoryReports
      .filter((otherComplaint) => otherComplaint.id !== complaint.id)
      .map((otherComplaint) => distanceInKm(complaint, otherComplaint))
      .sort((first, second) => first - second);

    return distances[0];
  });

  const sortedDistances = nearestNeighborDistances.sort(
    (first, second) => first - second,
  );

  const middle = Math.floor(sortedDistances.length / 2);

  const medianDistance =
    sortedDistances.length % 2 === 0
      ? (sortedDistances[middle - 1] + sortedDistances[middle]) / 2
      : sortedDistances[middle];

  return Math.max(
    MIN_CONNECTION_DISTANCE_KM,
    Math.min(
      MAX_CONNECTION_DISTANCE_KM,
      medianDistance * CONNECTION_DISTANCE_MULTIPLIER,
    ),
  );
}

function buildRecommendations(complaints: Complaint[]) {
  const byCategory = new Map<Exclude<Category, "all">, Complaint[]>();

  complaints.forEach((complaint) => {
    const categoryReports = byCategory.get(complaint.category) || [];
    categoryReports.push(complaint);
    byCategory.set(complaint.category, categoryReports);
  });

  const recommendations: Recommendation[] = [];

  byCategory.forEach((categoryReports, category) => {
    const connectionDistanceKm =
      adaptiveConnectionDistanceKm(categoryReports);

    const remaining = [...categoryReports];

    while (remaining.length > 0) {
      const seed = remaining.shift();

      if (!seed) continue;

      const cluster = [seed];

      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        if (
          cluster.some(
            (clusterComplaint) =>
              distanceInKm(clusterComplaint, remaining[index]) <=
              connectionDistanceKm,
          )
        ) {
          cluster.push(remaining[index]);
          remaining.splice(index, 1);
        }
      }

      if (cluster.length < MIN_REPORTS_PER_CLUSTER) continue;

      const totalWeight = cluster.reduce(
        (total, complaint) =>
          total + (urgencyWeight[complaint.severity] || 1),
        0,
      );

      const latitude =
        cluster.reduce(
          (total, complaint) =>
            total +
            complaint.latitude * (urgencyWeight[complaint.severity] || 1),
          0,
        ) / totalWeight;

      const longitude =
        cluster.reduce(
          (total, complaint) =>
            total +
            complaint.longitude * (urgencyWeight[complaint.severity] || 1),
          0,
        ) / totalWeight;

      recommendations.push({
        id: `${category}-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
        category,
        service: serviceRecommendations[category],
        latitude,
        longitude,
        reportCount: cluster.length,
        priorityScore: totalWeight,
        complaints: cluster,
        connectionDistanceKm,
      });
    }
  });

  return recommendations.sort(
    (first, second) => second.priorityScore - first.priorityScore,
  );
}

function reportIsInsideTimeRange(
  complaint: Complaint,
  timeRange: TimeRange,
) {
  if (timeRange === "all" || !complaint.submittedAt?.toDate) {
    return true;
  }

  const ageInMilliseconds =
    Date.now() - complaint.submittedAt.toDate().getTime();

  const rangeInMilliseconds: Record<Exclude<TimeRange, "all">, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  return ageInMilliseconds <= rangeInMilliseconds[timeRange];
}

function pointIsInsideViewport(
  latitude: number,
  longitude: number,
  viewport: MapViewport | null,
) {
  if (!viewport) return false;

  return (
    latitude >= viewport.south &&
    latitude <= viewport.north &&
    longitude >= viewport.west &&
    longitude <= viewport.east
  );
}

function recommendationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #16a34a;
        border: 3px solid white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        color: white;
        font-size: 22px;
        font-weight: 800;
      ">+</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export default function ControlPanelDashboard() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const complaintLayerRef = useRef<L.LayerGroup | null>(null);
  const recommendationLayerRef = useRef<L.LayerGroup | null>(null);
  const recommendationMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("all");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    [],
  );
  const [viewport, setViewport] = useState<MapViewport | null>(null);

  const visibleComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const categoryMatches =
        selectedCategory === "all" ||
        complaint.category === selectedCategory;

      return (
        categoryMatches &&
        reportIsInsideTimeRange(complaint, selectedTimeRange)
      );
    });
  }, [complaints, selectedCategory, selectedTimeRange]);

  const viewportRecommendations = useMemo(() => {
    return recommendations.filter((recommendation) =>
      pointIsInsideViewport(
        recommendation.latitude,
        recommendation.longitude,
        viewport,
      ),
    );
  }, [recommendations, viewport]);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    const map = L.map(mapElement.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([37.7749, -122.4194], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    complaintLayerRef.current = L.layerGroup().addTo(map);
    recommendationLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const updateViewport = () => {
      const bounds = map.getBounds();

      setViewport({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    };

    updateViewport();
    map.on("moveend", updateViewport);

    return () => {
      map.off("moveend", updateViewport);
      map.remove();
      mapRef.current = null;
      complaintLayerRef.current = null;
      recommendationLayerRef.current = null;
      recommendationMarkersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "incomingSignals"),
      (snapshot) => {
        const validComplaints: Complaint[] = snapshot.docs
          .map((document) => {
            const data = document.data();
            const category = String(data.category || "other");

            return {
              id: document.id,
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
              category: (
                category in categoryLabels ? category : "other"
              ) as Exclude<Category, "all">,
              severity: String(data.severity || "low").toLowerCase(),
              summary: String(data.summary || ""),
              locationPrecision: String(data.locationPrecision || ""),
              submittedAt: data.submittedAt,
            };
          })
          .filter(
            (complaint) =>
              Number.isFinite(complaint.latitude) &&
              Number.isFinite(complaint.longitude) &&
              complaint.latitude >= -90 &&
              complaint.latitude <= 90 &&
              complaint.longitude >= -180 &&
              complaint.longitude <= 180,
          );

        setComplaints(validComplaints);
      },
      (error) => {
        console.error("NeedMap Firestore read failed:", error);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const complaintLayer = complaintLayerRef.current;

    if (!complaintLayer) return;

    complaintLayer.clearLayers();

    visibleComplaints.forEach((complaint) => {
      const marker = L.circleMarker(
        [complaint.latitude, complaint.longitude],
        {
          radius: 10,
          color: "#ffffff",
          weight: 2,
          fillColor: complaintColors[complaint.severity] || "#8b5cf6",
          fillOpacity: 0.95,
        },
      );

      const category = categoryLabels[complaint.category];
      const description = complaint.summary
        ? escapeHtml(complaint.summary)
        : "No description provided.";

      const location =
        complaint.locationPrecision === "approximate_grid_500m"
          ? "Approximate 500 m grid area"
          : `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`;

      marker.bindTooltip(
        `
          <div style="min-width: 220px; max-width: 280px; font-family: system-ui, sans-serif; line-height: 1.4;">
            <div style="font-weight: 700; margin-bottom: 6px;">${escapeHtml(category)}</div>
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 600;">Urgency:</span>
              ${escapeHtml(formatSeverity(complaint.severity))}
            </div>
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 600;">Report:</span>
              ${description}
            </div>
            <div style="color: #64748b; font-size: 12px;">
              ${escapeHtml(location)} · ${escapeHtml(formatTime(complaint.submittedAt))}
            </div>
          </div>
        `,
        {
          direction: "top",
          offset: [0, -10],
          opacity: 1,
          sticky: true,
        },
      );

      marker.addTo(complaintLayer);
    });
  }, [visibleComplaints]);

  function renderViewportRecommendations(
    recommendationsToRender: Recommendation[],
  ) {
    const recommendationLayer = recommendationLayerRef.current;

    if (!recommendationLayer) return;

    recommendationLayer.clearLayers();
    recommendationMarkersRef.current.clear();

    recommendationsToRender.forEach((recommendation) => {
      const radiusMeters = Math.max(
        500,
        Math.min(5000, recommendation.connectionDistanceKm * 1000),
      );

      L.circle([recommendation.latitude, recommendation.longitude], {
        radius: radiusMeters,
        color: "#22c55e",
        weight: 2,
        fillColor: "#22c55e",
        fillOpacity: 0.13,
        dashArray: "6 8",
      }).addTo(recommendationLayer);

      const marker = L.marker(
        [recommendation.latitude, recommendation.longitude],
        { icon: recommendationIcon() },
      );

      const label = categoryLabels[recommendation.category];

      marker.bindTooltip(
        `
          <div style="min-width: 235px; max-width: 290px; font-family: system-ui, sans-serif; line-height: 1.45;">
            <div style="font-weight: 800; color: #15803d; margin-bottom: 6px;">
              NeedMap recommendation
            </div>
            <div style="font-weight: 700; margin-bottom: 6px;">
              ${escapeHtml(recommendation.service)}
            </div>
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 600;">Need type:</span>
              ${escapeHtml(label)}
            </div>
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 600;">Evidence:</span>
              ${recommendation.reportCount} connected reports
            </div>
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 600;">Priority score:</span>
              ${recommendation.priorityScore}
              (${recommendation.complaints
                .map((complaint) => formatSeverity(complaint.severity))
                .join(", ")})
            </div>
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 600;">Connection scale:</span>
              ${recommendation.connectionDistanceKm.toFixed(1)} km
            </div>
            <div style="font-size: 12px; color: #64748b;">
              Candidate area only — requires road, land, and local field validation before any placement decision.
            </div>
          </div>
        `,
        {
          direction: "top",
          offset: [0, -20],
          opacity: 1,
          sticky: true,
        },
      );

      marker.addTo(recommendationLayer);
      recommendationMarkersRef.current.set(recommendation.id, marker);
    });
  }

  useEffect(() => {
    renderViewportRecommendations(viewportRecommendations);
  }, [viewportRecommendations]);

  function analyzeNeeds() {
    const nextRecommendations = buildRecommendations(visibleComplaints);

    setRecommendations(nextRecommendations);

    const map = mapRef.current;

    if (map && nextRecommendations.length > 0) {
      map.fitBounds(
        L.latLngBounds(
          nextRecommendations.map((recommendation) => [
            recommendation.latitude,
            recommendation.longitude,
          ]),
        ),
        {
          padding: [90, 90],
          maxZoom: 3,
        },
      );
    }
  }

  function clearAnalysis() {
    recommendationLayerRef.current?.clearLayers();
    recommendationMarkersRef.current.clear();
    setRecommendations([]);
  }

  function focusRecommendation(recommendation: Recommendation) {
    const map = mapRef.current;

    if (!map) return;

    map.flyTo([recommendation.latitude, recommendation.longitude], 13, {
      duration: 0.7,
    });

    window.setTimeout(() => {
      recommendationMarkersRef.current
        .get(recommendation.id)
        ?.openTooltip();
    }, 750);
  }

  function updateCategory(category: Category) {
    setSelectedCategory(category);
    clearAnalysis();
  }

  function updateTimeRange(timeRange: TimeRange) {
    setSelectedTimeRange(timeRange);
    clearAnalysis();
  }

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapElement} className="h-full w-full" />

      <div className="absolute left-4 top-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Category
        </p>

        <div className="flex max-w-[520px] flex-wrap gap-1.5">
          {(Object.keys(categoryFilterLabels) as Category[]).map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() => updateCategory(category)}
                className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {categoryFilterLabels[category]}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="absolute right-4 top-4 z-[1000] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
        <div className="rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur">
          <div className="flex flex-wrap justify-end gap-1.5">
            {(
              [
                ["24h", "24h"],
                ["7d", "7d"],
                ["30d", "30d"],
                ["all", "All time"],
              ] as const
            ).map(([timeRange, label]) => (
              <button
                key={timeRange}
                type="button"
                onClick={() => updateTimeRange(timeRange)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  selectedTimeRange === timeRange
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {recommendations.length > 0 && (
            <button
              type="button"
              onClick={clearAnalysis}
              className="rounded-lg bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
            >
              Clear analysis
            </button>
          )}

          <button
            type="button"
            onClick={analyzeNeeds}
            disabled={visibleComplaints.length < MIN_REPORTS_PER_CLUSTER}
            className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            Analyze {visibleComplaints.length} report
            {visibleComplaints.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <aside className="absolute bottom-4 left-4 z-[1000] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl bg-white/95 shadow-xl backdrop-blur">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">
              NeedMap recommendations
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Showing only candidate areas in the current map view
            </p>
          </div>

          <div className="max-h-[280px] overflow-y-auto">
            {viewportRecommendations.length === 0 ? (
              <p className="px-4 py-5 text-sm text-slate-600">
                No candidate recommendations are in this map view. Pan or zoom
                to an area containing reported need.
              </p>
            ) : (
              viewportRecommendations.map((recommendation, index) => (
                <button
                  key={recommendation.id}
                  type="button"
                  onClick={() => focusRecommendation(recommendation)}
                  className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-emerald-50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {recommendation.service}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {recommendation.reportCount} connected reports · score{" "}
                      {recommendation.priorityScore} ·{" "}
                      {recommendation.connectionDistanceKm.toFixed(1)} km scale
                    </span>
                    <span className="mt-1 block text-xs font-medium text-emerald-700">
                      Needs field validation
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
      )}

      <div className="pointer-events-none absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-md">
        <span className="mr-3">
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-500 align-middle" />
          High
        </span>
        <span className="mr-3">
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500 align-middle" />
          Medium
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-500 align-middle" />
          Low
        </span>
      </div>
    </div>
  );
}

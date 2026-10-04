import { useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { auth, db } from "./services/firebase";

type Category =
  | "healthcare"
  | "water"
  | "transportation"
  | "emergency_response"
  | "food"
  | "broadband"
  | "other";

type Severity = "low" | "medium" | "high";

type SeedSignal = {
  category: Category;
  severity: Severity;
  latitude: number;
  longitude: number;
  summary: string;
};

type RegionCluster = {
  region: string;
  category: Category;
  latitude: number;
  longitude: number;
  count: number;
  spacing: number;
};

const severityCycle: Severity[] = ["high", "medium", "low"];

function createSignal(
  category: Category,
  severity: Severity,
  latitude: number,
  longitude: number,
  summary: string,
): SeedSignal {
  return {
    category,
    severity,
    latitude,
    longitude,
    summary,
  };
}

function createCluster(
  region: string,
  category: Category,
  centerLatitude: number,
  centerLongitude: number,
  count: number,
  spacing: number,
): SeedSignal[] {
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / 4);
    const column = index % 4;

    const latitude = centerLatitude + (row - 1) * spacing;
    const longitude = centerLongitude + (column - 1.5) * spacing;

    return createSignal(
      category,
      severityCycle[index % severityCycle.length],
      latitude,
      longitude,
      `SYNTHETIC TEST DATA: ${region} ${category.replaceAll("_", " ")} signal ${index + 1}.`,
    );
  });
}

function buildTestSignals(): SeedSignal[] {
  const signals: SeedSignal[] = [];

  const clusters: RegionCluster[] = [
    {
      region: "San Francisco, United States",
      category: "water",
      latitude: 37.7749,
      longitude: -122.4194,
      count: 12,
      spacing: 0.008,
    },
    {
      region: "Mexico City, Mexico",
      category: "transportation",
      latitude: 19.4326,
      longitude: -99.1332,
      count: 10,
      spacing: 0.01,
    },
    {
      region: "São Paulo, Brazil",
      category: "food",
      latitude: -23.5505,
      longitude: -46.6333,
      count: 10,
      spacing: 0.01,
    },
    {
      region: "London, United Kingdom",
      category: "healthcare",
      latitude: 51.5072,
      longitude: -0.1276,
      count: 10,
      spacing: 0.008,
    },
    {
      region: "Nairobi, Kenya",
      category: "water",
      latitude: -1.2921,
      longitude: 36.8219,
      count: 12,
      spacing: 0.012,
    },
    {
      region: "Lagos, Nigeria",
      category: "emergency_response",
      latitude: 6.5244,
      longitude: 3.3792,
      count: 10,
      spacing: 0.01,
    },
    {
      region: "New Delhi, India",
      category: "broadband",
      latitude: 28.6139,
      longitude: 77.209,
      count: 10,
      spacing: 0.01,
    },
    {
      region: "Manila, Philippines",
      category: "healthcare",
      latitude: 14.5995,
      longitude: 120.9842,
      count: 10,
      spacing: 0.01,
    },
    {
      region: "Jakarta, Indonesia",
      category: "transportation",
      latitude: -6.2088,
      longitude: 106.8456,
      count: 10,
      spacing: 0.012,
    },
    {
      region: "Tokyo, Japan",
      category: "food",
      latitude: 35.6762,
      longitude: 139.6503,
      count: 8,
      spacing: 0.008,
    },
    {
      region: "Amman, Jordan",
      category: "water",
      latitude: 31.9539,
      longitude: 35.9106,
      count: 8,
      spacing: 0.012,
    },
    {
      region: "Sydney, Australia",
      category: "broadband",
      latitude: -33.8688,
      longitude: 151.2093,
      count: 8,
      spacing: 0.01,
    },
  ];

  clusters.forEach((cluster) => {
    signals.push(
      ...createCluster(
        cluster.region,
        cluster.category,
        cluster.latitude,
        cluster.longitude,
        cluster.count,
        cluster.spacing,
      ),
    );
  });

  // Urgency-weighting test around Cape Town:
  // Recommended pin should be pulled closer to the High-urgency anchor.
  signals.push(
    createSignal(
      "healthcare",
      "high",
      -33.9249,
      18.4241,
      "SYNTHETIC TEST DATA: Cape Town high-urgency healthcare access anchor.",
    ),
    createSignal(
      "healthcare",
      "low",
      -33.89,
      18.47,
      "SYNTHETIC TEST DATA: Cape Town low-urgency healthcare signal one.",
    ),
    createSignal(
      "healthcare",
      "low",
      -33.88,
      18.5,
      "SYNTHETIC TEST DATA: Cape Town low-urgency healthcare signal two.",
    ),
  );

  // Duplicate-coordinate test in Buenos Aires:
  // Shows why production will later need deduplication/rate limiting.
  for (let index = 0; index < 5; index += 1) {
    signals.push(
      createSignal(
        "water",
        "low",
        -34.6037,
        -58.3816,
        `SYNTHETIC TEST DATA: Buenos Aires duplicate-coordinate water report ${index + 1}.`,
      ),
    );
  }

  // Single outliers: should not create a recommendation on their own.
  const outliers: Array<{
    region: string;
    category: Category;
    latitude: number;
    longitude: number;
  }> = [
    {
      region: "Reykjavík, Iceland",
      category: "other",
      latitude: 64.1466,
      longitude: -21.9426,
    },
    {
      region: "Ulaanbaatar, Mongolia",
      category: "food",
      latitude: 47.8864,
      longitude: 106.9057,
    },
    {
      region: "Perth, Australia",
      category: "emergency_response",
      latitude: -31.9505,
      longitude: 115.8605,
    },
    {
      region: "Lima, Peru",
      category: "broadband",
      latitude: -12.0464,
      longitude: -77.0428,
    },
    {
      region: "Helsinki, Finland",
      category: "transportation",
      latitude: 60.1699,
      longitude: 24.9384,
    },
  ];

  outliers.forEach((outlier, index) => {
    signals.push(
      createSignal(
        outlier.category,
        "high",
        outlier.latitude,
        outlier.longitude,
        `SYNTHETIC TEST DATA: Isolated ${outlier.region} outlier ${index + 1}; should not qualify alone.`,
      ),
    );
  });

  return signals.slice(0, 120);
}

const signals = buildTestSignals();

export default function SeedSignals() {
  const [status, setStatus] = useState(
    `Preparing ${signals.length} synthetic global test signals...`,
  );
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    async function ensureAnonymousAuth() {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }

        setIsAuthReady(true);
        setStatus(
          `Ready to create ${signals.length} synthetic global test signals.`,
        );
      } catch (error) {
        console.error("Anonymous Firebase sign-in failed:", error);
        setStatus(
          "Anonymous Firebase sign-in failed. Enable Authentication → Sign-in method → Anonymous in Firebase Console.",
        );
      }
    }

    void ensureAnonymousAuth();
  }, []);

  async function seedSignals() {
    const user = auth.currentUser;

    if (!user) {
      setStatus(
        "Firebase anonymous authentication is not ready yet. Refresh once and try again.",
      );
      return;
    }

    setIsSeeding(true);
    setStatus(`Creating 0 of ${signals.length} synthetic global signals...`);

    try {
      for (let index = 0; index < signals.length; index += 1) {
        const signal = signals[index];

        await addDoc(collection(db, "incomingSignals"), {
          ...signal,
          locationGridId: `synthetic-global-test-${index + 1}`,
          locationPrecision: "manual_demo_coordinate",
          sourceType: "community_survey",
          isSynthetic: true,
          submittedAt: Timestamp.now(),
          submittedBy: user.uid,
        });

        setStatus(
          `Creating ${index + 1} of ${signals.length} synthetic global signals...`,
        );
      }

      setStatus(
        `Done — created ${signals.length} synthetic global signals in incomingSignals.`,
      );
    } catch (error) {
      console.error("Synthetic seeding failed:", error);
      setStatus(
        "Seeding failed. Confirm Anonymous sign-in is enabled and Firestore requires submittedBy to equal request.auth.uid.",
      );
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-400">
          NeedMap development tool
        </p>

        <h1 className="text-2xl font-bold">
          Seed global synthetic test signals
        </h1>

        <p className="mt-3 text-slate-300">
          This creates {signals.length} synthetic signals in multiple world
          regions. It tests local clustering, global separation, category
          separation, urgency weighting, duplicate coordinates, and isolated
          outliers.
        </p>

        <button
          type="button"
          onClick={seedSignals}
          disabled={!isAuthReady || isSeeding}
          className="mt-6 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSeeding
            ? "Creating synthetic global signals..."
            : !isAuthReady
              ? "Preparing Firebase authentication..."
              : `Create ${signals.length} global synthetic signals`}
        </button>

        <p className="mt-4 text-sm text-slate-300">{status}</p>
      </section>
    </main>
  );
}
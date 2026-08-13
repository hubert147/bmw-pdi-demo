import type { StageKey, Vehicle } from "./types";
import { STAGES, daysInStage, isOverdue } from "./stages";

const DAY = 86_400_000;

/** fixed display order for the days-in-stage chart */
const STAGE_ORDER: StageKey[] = [
  "TO_GO_TO_PDI",
  "ARRIVED_AT_PDI",
  "JOB_CARD_RAISED",
  "WORKSHOP_STARTED",
  "AUTHORITY_REQUESTED",
  "AUTHORITY_RECEIVED",
  "WORKSHOP_COMPLETE",
  "AT_TLC",
  "AT_BODYSHOP",
  "ON_VALET_SHEET",
  "VALETED",
];

export interface StageStat {
  key: StageKey;
  label: string;
  avgDays: number;
  samples: number;
  sla: number;
  overTarget: boolean;
}

export interface OverdueRow {
  vehicle: Vehicle;
  days: number;
  sla: number;
}

export interface Insights {
  inPrep: number;
  ready: number;
  overdue: OverdueRow[];
  /** average time-to-line in days across cars that reached READY; null if none */
  avgT2L: number | null;
  stageStats: StageStat[];
  bottleneck: StageStat | null;
}

/** timeline label -> stage whose entry it marks */
const LABEL_TO_STAGE: Record<string, StageKey> = Object.fromEntries(
  (Object.keys(STAGES) as StageKey[]).map((k) => [STAGES[k].timelineLabel, k]),
) as Record<string, StageKey>;

export function computeInsights(vehicles: Vehicle[], now = Date.now()): Insights {
  const active = vehicles.filter((v) => v.stage !== "READY");
  const readyCars = vehicles.filter((v) => v.stage === "READY");

  const overdue: OverdueRow[] = active
    .map((v) => ({ vehicle: v, days: daysInStage(v.stageEnteredAt, now), sla: STAGES[v.stage].sla }))
    .filter((r) => isOverdue(r.days, r.sla))
    .sort((a, b) => b.days - b.sla - (a.days - a.sla));

  // avg T2L: added-to-system -> last timeline entry, for cars that reached READY
  const t2ls = readyCars
    .filter((v) => v.timeline.length >= 2)
    .map((v) => (v.timeline[v.timeline.length - 1].at - v.timeline[0].at) / DAY);
  const avgT2L = t2ls.length ? t2ls.reduce((a, b) => a + b, 0) / t2ls.length : null;

  // days spent per stage: duration between consecutive timeline entries is
  // attributed to the stage entered at the earlier entry; the current stage
  // also accrues its ongoing time
  const acc = new Map<StageKey, { total: number; n: number }>();
  const add = (k: StageKey, ms: number) => {
    const cur = acc.get(k) ?? { total: 0, n: 0 };
    cur.total += ms;
    cur.n += 1;
    acc.set(k, cur);
  };
  for (const v of vehicles) {
    for (let i = 0; i < v.timeline.length - 1; i++) {
      const stage = LABEL_TO_STAGE[v.timeline[i].label];
      if (stage) add(stage, v.timeline[i + 1].at - v.timeline[i].at);
    }
    if (v.stage !== "READY") add(v.stage, now - v.stageEnteredAt);
  }

  const stageStats: StageStat[] = STAGE_ORDER.filter((k) => acc.has(k)).map((k) => {
    const { total, n } = acc.get(k)!;
    const avgDays = total / n / DAY;
    return {
      key: k,
      label: STAGES[k].label,
      avgDays,
      samples: n,
      sla: STAGES[k].sla,
      // small tolerance so float noise (e.g. 1.04 vs target 1) doesn't flag a stage
      overTarget: avgDays > STAGES[k].sla + 0.1,
    };
  });

  const bottleneck = stageStats.length
    ? stageStats.reduce((a, b) => (b.avgDays > a.avgDays ? b : a))
    : null;

  return { inPrep: active.length, ready: readyCars.length, overdue, avgT2L, stageStats, bottleneck };
}

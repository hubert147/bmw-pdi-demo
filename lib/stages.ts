import type { StageKey, TabKey } from "./types";

interface StageMeta {
  label: string;
  /** chip colour classes */
  chip: string;
  tab: TabKey;
  /** label of the one-click advance button; undefined = opens action card or none */
  nextLabel?: string;
  nextStage?: StageKey;
  /** timeline entry written when the stage is entered */
  timelineLabel: string;
}

export const STAGES: Record<StageKey, StageMeta> = {
  TO_GO_TO_PDI: {
    label: "To go to PDI",
    chip: "bg-slate-400 text-white",
    tab: "PDI",
    nextLabel: "Arrived at PDI",
    nextStage: "ARRIVED_AT_PDI",
    timelineLabel: "Added to system",
  },
  ARRIVED_AT_PDI: {
    label: "Arrived at PDI",
    chip: "bg-red-900 text-white",
    tab: "PDI",
    nextLabel: "Job Card Raised",
    nextStage: "JOB_CARD_RAISED",
    timelineLabel: "Arrived at PDI",
  },
  JOB_CARD_RAISED: {
    label: "Job Card Raised",
    chip: "bg-red-700 text-white",
    tab: "PDI",
    nextLabel: "Started",
    nextStage: "WORKSHOP_STARTED",
    timelineLabel: "Job Card Raised",
  },
  WORKSHOP_STARTED: {
    label: "Started",
    chip: "bg-orange-600 text-white",
    tab: "PDI",
    nextLabel: "Authority requested",
    nextStage: "AUTHORITY_REQUESTED",
    timelineLabel: "Workshop started",
  },
  AUTHORITY_REQUESTED: {
    label: "Authority requested",
    chip: "bg-amber-500 text-white",
    tab: "PDI",
    nextLabel: "Authority received",
    nextStage: "AUTHORITY_RECEIVED",
    timelineLabel: "Authority requested",
  },
  AUTHORITY_RECEIVED: {
    label: "Authority received",
    chip: "bg-orange-500 text-white",
    tab: "PDI",
    nextLabel: "Workshop Complete",
    nextStage: "WORKSHOP_COMPLETE",
    timelineLabel: "Authority received",
  },
  WORKSHOP_COMPLETE: {
    label: "Workshop Complete",
    chip: "bg-teal-600 text-white",
    tab: "PDI",
    // opens the action card instead of a linear advance
    timelineLabel: "Workshop completed",
  },
  AT_TLC: {
    label: "At TLC (wheels)",
    chip: "bg-fuchsia-700 text-white",
    tab: "TLC",
    nextLabel: "TLC Completed",
    timelineLabel: "Sent to TLC",
  },
  AT_BODYSHOP: {
    label: "At Bodyshop (EWARC)",
    chip: "bg-indigo-700 text-white",
    tab: "BODYSHOP",
    nextLabel: "EWARC Completed",
    timelineLabel: "Sent to EWARC",
  },
  ON_VALET_SHEET: {
    label: "On valet sheet",
    chip: "bg-violet-700 text-white",
    tab: "VALET",
    nextLabel: "Valeted",
    nextStage: "VALETED",
    timelineLabel: "Added to valet sheet",
  },
  VALETED: {
    label: "Valeted",
    chip: "bg-emerald-600 text-white",
    tab: "VALET",
    nextLabel: "Photos done",
    nextStage: "READY",
    timelineLabel: "Valeted",
  },
  READY: {
    label: "Ready for sale",
    chip: "bg-green-600 text-white",
    tab: "VALET",
    timelineLabel: "Photographed",
  },
};

export const TABS: { key: TabKey; label: string }[] = [
  { key: "PDI", label: "PDI" },
  { key: "TLC", label: "TLC" },
  { key: "BODYSHOP", label: "Bodyshop" },
  { key: "VALET", label: "Valet/Photos" },
];

export const WHEEL_PRICES: Record<string, number[]> = {
  "Diamond Cut": [87.5, 175.0, 262.5, 350.0],
  Normal: [45.0, 90.0, 135.0, 180.0],
};

export function daysInStage(stageEnteredAt: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - stageEnteredAt) / 86_400_000));
}

export function dayBadgeClass(days: number): string {
  if (days <= 1) return "bg-green-700 text-white";
  if (days <= 3) return "bg-amber-500 text-white";
  return "bg-red-600 text-white";
}

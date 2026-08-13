import type { Vehicle } from "./types";
import { STAGES, daysInStage } from "./stages";
import { fmtDateTime } from "./format";

/** timeline date columns in the same order as the dealership's Excel control sheet */
const DATE_COLUMNS = [
  "Added to system",
  "Arrived at PDI",
  "Job Card Raised",
  "Workshop started",
  "Authority requested",
  "Authority received",
  "Workshop completed",
  "Sent to TLC",
  "TLC completed",
  "Sent to EWARC",
  "EWARC completed",
  "Added to valet sheet",
  "Valeted",
  "Photographed",
];

function esc(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildControlSheetCsv(vehicles: Vehicle[]): string {
  const header = [
    "Stock",
    "Make",
    "Model",
    "Registration",
    "Chassis",
    "Bodywork Notes",
    "Current Stage",
    "Days in stage",
    ...DATE_COLUMNS,
  ];
  const rows = vehicles.map((v) => {
    const dates = DATE_COLUMNS.map((label) => {
      const entry = v.timeline.find((e) => e.label === label);
      return entry ? fmtDateTime(entry.at) : "";
    });
    return [
      v.stock,
      v.make,
      v.model,
      v.reg,
      v.chassis,
      v.bodyworkNotes,
      STAGES[v.stage].label,
      v.stage === "READY" ? "" : String(daysInStage(v.stageEnteredAt)),
      ...dates,
    ].map(esc);
  });
  return [header.map(esc), ...rows].map((r) => r.join(",")).join("\r\n");
}

/** trigger a browser download of the control sheet (UTF-8 BOM so Excel opens it cleanly) */
export function downloadControlSheet(vehicles: Vehicle[]): void {
  const csv = "﻿" + buildControlSheetCsv(vehicles);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prepflow-control-sheet-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

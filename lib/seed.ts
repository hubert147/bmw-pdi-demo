import type { StageKey, Vehicle } from "./types";
import { STAGES } from "./stages";

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** ordered PDI path used to synthesise a plausible timeline for seeded cars */
const PDI_PATH: StageKey[] = [
  "TO_GO_TO_PDI",
  "ARRIVED_AT_PDI",
  "JOB_CARD_RAISED",
  "WORKSHOP_STARTED",
  "AUTHORITY_REQUESTED",
  "AUTHORITY_RECEIVED",
  "WORKSHOP_COMPLETE",
];

interface SeedSpec {
  model: string;
  reg: string;
  chassis: string;
  stage: StageKey;
  daysInStage?: number;
  bodywork?: string;
  valeting?: string;
  wheels?: { type: "Diamond Cut" | "Normal"; positions: Vehicle["wheelPositions"]; po?: string };
  tlcDone?: boolean;
  ewarcDone?: boolean;
  aucLine?: boolean;
}

function build(spec: SeedSpec, idx: number, now: number): Vehicle {
  const stage = spec.stage;
  const enteredAt = now - (spec.daysInStage ?? 0) * DAY - 2 * HOUR;

  // synthesise timeline: every PDI step before the current stage, one per ~half day
  const pdiIdx = PDI_PATH.indexOf(stage);
  const stepsDone = pdiIdx >= 0 ? pdiIdx + 1 : PDI_PATH.length;
  const timeline = PDI_PATH.slice(0, stepsDone).map((s, i) => ({
    label: STAGES[s].timelineLabel,
    at: enteredAt - (stepsDone - 1 - i) * (DAY / 2),
  }));
  if (pdiIdx < 0) {
    // car is past the PDI hub — add its post-workshop entries
    if (stage === "AT_TLC") timeline.push({ label: "Sent to TLC", at: enteredAt });
    if (stage === "AT_BODYSHOP") timeline.push({ label: "Sent to EWARC", at: enteredAt });
    if (stage === "ON_VALET_SHEET") timeline.push({ label: "Added to valet sheet", at: enteredAt });
    if (stage === "VALETED") timeline.push({ label: "Valeted", at: enteredAt });
    if (stage === "READY") {
      timeline.push({ label: "Valeted", at: enteredAt - DAY });
      timeline.push({ label: "Photographed", at: enteredAt });
    }
  }

  return {
    id: `seed-${idx}`,
    stock: "STOCK",
    make: spec.model.startsWith("Cooper") || spec.model === "Countryman" || spec.model === "Hatch" ? "MINI" : "BMW",
    model: spec.model,
    reg: spec.reg,
    chassis: spec.chassis,
    bodyworkNotes: spec.bodywork ?? "OK",
    valetingNotes: spec.valeting ?? "",
    wheelType: spec.wheels?.type,
    wheelPositions: spec.wheels?.positions ?? [],
    purchaseOrder: spec.wheels?.po,
    aucLine: spec.aucLine ?? true,
    mot: false,
    aucCompleted: false,
    tlcDone: spec.tlcDone ?? false,
    ewarcDone: spec.ewarcDone ?? false,
    stage,
    stageEnteredAt: enteredAt,
    timeline,
    emails: [],
    comments: [],
  };
}

export function seedVehicles(now = Date.now()): Vehicle[] {
  const specs: SeedSpec[] = [
    { model: "Cooper S", reg: "X2 AST", chassis: "2S45752", stage: "TO_GO_TO_PDI" },
    { model: "Cooper", reg: "LTP 595", chassis: "2X10285", stage: "ARRIVED_AT_PDI", bodywork: "Stone chips on bonnet" },
    { model: "Countryman", reg: "SN73 CHP", chassis: "3R95666", stage: "JOB_CARD_RAISED", bodywork: "2 front tyres and service" },
    { model: "320", reg: "AB51 ABC", chassis: "AB12345", stage: "WORKSHOP_STARTED", bodywork: "NSF bumper scuffed", wheels: { type: "Diamond Cut", positions: ["NSF", "OSF"] } },
    { model: "118i", reg: "SL73 HNA", chassis: "5X78332", stage: "AUTHORITY_REQUESTED", bodywork: "Front bumper needs painted" },
    { model: "X1", reg: "OY21 ZSU", chassis: "5T59678", stage: "AUTHORITY_RECEIVED", daysInStage: 1, bodywork: "Rear bumper smart repair, polish bonnet" },
    { model: "M240i", reg: "SM68 TVJ", chassis: "7K41140", stage: "WORKSHOP_COMPLETE", bodywork: "Smart front bumper NS" },
    { model: "iX", reg: "SN26 DJX", chassis: "CX65453", stage: "AT_TLC", daysInStage: 1, bodywork: "OK", wheels: { type: "Diamond Cut", positions: ["NSF", "OSF"], po: "12345" } },
    { model: "M3", reg: "ML73 WMX", chassis: "FR86510", stage: "AT_BODYSHOP", daysInStage: 2, bodywork: "Dent driver's door and OSR 1/4" },
    { model: "X3", reg: "YA25 DMZ", chassis: "N338479", stage: "ON_VALET_SHEET", valeting: "Full valet and polish", tlcDone: true },
    { model: "Hatch", reg: "YE20 DND", chassis: "2N25003", stage: "VALETED", daysInStage: 1 },
    { model: "Cooper", reg: "SR19 SYW", chassis: "2L09256", stage: "READY", daysInStage: 3, ewarcDone: true },
  ];
  return specs.map((s, i) => build(s, i, now));
}

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

/**
 * typical days spent in each PDI step — authority wait is the classic bottleneck,
 * so the Insights chart has a real story to tell out of the box
 */
const STEP_DAYS: Partial<Record<StageKey, number>> = {
  TO_GO_TO_PDI: 0.8,
  ARRIVED_AT_PDI: 0.3,
  JOB_CARD_RAISED: 0.4,
  WORKSHOP_STARTED: 1.1,
  AUTHORITY_REQUESTED: 1.9,
  AUTHORITY_RECEIVED: 0.6,
  WORKSHOP_COMPLETE: 0.5,
};

function build(spec: SeedSpec, idx: number, now: number): Vehicle {
  const stage = spec.stage;
  const enteredAt = now - (spec.daysInStage ?? 0) * DAY - 2 * HOUR;

  // synthesise timeline: every PDI step before the current stage, with per-step
  // durations + deterministic jitter so averages differ per stage
  const pdiIdx = PDI_PATH.indexOf(stage);
  const stepsDone = pdiIdx >= 0 ? pdiIdx + 1 : PDI_PATH.length;
  const doneSteps = PDI_PATH.slice(0, stepsDone);
  const durations = doneSteps.map(
    (s, i) => ((STEP_DAYS[s] ?? 0.5) + ((idx * 7 + i * 3) % 5) * 0.12) * DAY,
  );
  // READY cars have post-workshop history (valet -> photos), so their PDI part
  // must end before it; everything else enters its current stage straight after
  // the last PDI step
  const pdiAnchor = stage === "READY" ? enteredAt - 1.4 * DAY : enteredAt;

  // walk backwards from the anchor: entry(i-1) = entry(i) - time spent in step i-1
  const timeline: Vehicle["timeline"] = [];
  let cursor = pdiAnchor;
  for (let i = doneSteps.length - 1; i >= 0; i--) {
    timeline.unshift({ label: STAGES[doneSteps[i]].timelineLabel, at: cursor });
    if (i > 0) cursor -= durations[i - 1];
  }
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
    make: "Mercedes-Benz",
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
    { model: "A 200", reg: "KM73 VXA", chassis: "2S45752", stage: "TO_GO_TO_PDI" },
    { model: "GLA 220", reg: "LB24 TRE", chassis: "2X10285", stage: "ARRIVED_AT_PDI", bodywork: "Stone chips on bonnet" },
    { model: "GLB 200", reg: "WF73 CHP", chassis: "3R95666", stage: "JOB_CARD_RAISED", bodywork: "2 front tyres and service" },
    { model: "C 220 d", reg: "AB51 ABC", chassis: "AB12345", stage: "WORKSHOP_STARTED", bodywork: "NSF bumper scuffed", wheels: { type: "Diamond Cut", positions: ["NSF", "OSF"] } },
    { model: "A 180", reg: "EK73 HNA", chassis: "5X78332", stage: "AUTHORITY_REQUESTED", daysInStage: 2, bodywork: "Front bumper needs painted" },
    { model: "GLC 300", reg: "OV21 ZSU", chassis: "5T59678", stage: "AUTHORITY_RECEIVED", daysInStage: 1, bodywork: "Rear bumper smart repair, polish bonnet" },
    { model: "AMG A 35", reg: "RA68 TVJ", chassis: "7K41140", stage: "WORKSHOP_COMPLETE", bodywork: "Smart front bumper NS" },
    { model: "EQB 300", reg: "EV26 DJX", chassis: "CX65453", stage: "AT_TLC", daysInStage: 1, bodywork: "OK", wheels: { type: "Diamond Cut", positions: ["NSF", "OSF"], po: "12345" } },
    { model: "AMG C 63", reg: "MC73 WMX", chassis: "FR86510", stage: "AT_BODYSHOP", daysInStage: 6, bodywork: "Dent driver's door and OSR 1/4" },
    { model: "E 300", reg: "YE25 DMZ", chassis: "N338479", stage: "ON_VALET_SHEET", daysInStage: 2, valeting: "Full valet and polish", tlcDone: true },
    { model: "B 180", reg: "YE20 DND", chassis: "2N25003", stage: "VALETED", daysInStage: 1 },
    { model: "CLA 250", reg: "SR19 SYW", chassis: "2L09256", stage: "READY", daysInStage: 3, ewarcDone: true },
  ];
  return specs.map((s, i) => build(s, i, now));
}

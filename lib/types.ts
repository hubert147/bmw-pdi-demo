export type StockStatus = "STOCK" | "SOLD" | "TRADE";
export type WheelType = "Diamond Cut" | "Normal";
export type WheelPos = "NSF" | "OSF" | "NSR" | "OSR";

export type StageKey =
  | "TO_GO_TO_PDI"
  | "ARRIVED_AT_PDI"
  | "JOB_CARD_RAISED"
  | "WORKSHOP_STARTED"
  | "AUTHORITY_REQUESTED"
  | "AUTHORITY_RECEIVED"
  | "WORKSHOP_COMPLETE"
  | "AT_TLC"
  | "AT_BODYSHOP"
  | "ON_VALET_SHEET"
  | "VALETED"
  | "READY";

export type TabKey = "PDI" | "TLC" | "BODYSHOP" | "VALET";

export interface TimelineEntry {
  label: string;
  at: number;
}

export interface EmailRecord {
  to: string;
  cc?: string;
  subject: string;
  rows: [string, string][];
  notes?: string;
  at: number;
}

export interface CommentRecord {
  text: string;
  at: number;
}

export interface Vehicle {
  id: string;
  stock: StockStatus;
  make: string;
  model: string;
  reg: string;
  chassis: string;
  bodyworkNotes: string;
  valetingNotes: string;
  wheelType?: WheelType;
  wheelPositions: WheelPos[];
  purchaseOrder?: string;
  aucLine: boolean;
  mot: boolean;
  aucCompleted: boolean;
  tlcDone: boolean;
  ewarcDone: boolean;
  stage: StageKey;
  stageEnteredAt: number;
  timeline: TimelineEntry[];
  emails: EmailRecord[];
  comments: CommentRecord[];
}

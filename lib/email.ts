import type { EmailRecord, Vehicle } from "./types";

export function bodyshopEmail(v: Vehicle, at = Date.now()): EmailRecord {
  return {
    to: "ARC - Reception; ARC - Estimators Shared",
    cc: "you@dealership.demo",
    subject: `Car to go to bodyshop - ${v.model} - ${v.reg} - ${v.chassis}`,
    rows: [
      ["Stock/Sold", v.stock],
      ["Model", v.model],
      ["Reg", v.reg],
      ["Chassis", v.chassis],
      ["Bodywork", v.bodyworkNotes || "-"],
    ],
    at,
  };
}

export function tlcEmail(v: Vehicle, po: string, notes: string, at = Date.now()): EmailRecord {
  return {
    to: "alloy@wheelvendor.demo",
    cc: "you@dealership.demo",
    subject: `${v.stock} car ready for refurbishment - ${v.reg}`,
    rows: [
      ["Stock/Sold", v.stock],
      ["Model", v.model],
      ["Reg", v.reg],
      ["Chassis", v.chassis],
      ["Wheels to be refurbished", v.wheelPositions.join(", ") || "-"],
      ["Wheel type", v.wheelType ?? "-"],
      ["Purchase order", po],
    ],
    notes: notes || undefined,
    at,
  };
}

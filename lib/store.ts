"use client";

import { useCallback, useEffect, useState } from "react";
import type { EmailRecord, StageKey, Vehicle, WheelPos, WheelType } from "./types";
import { STAGES } from "./stages";
import { seedVehicles } from "./seed";
import { bodyshopEmail, tlcEmail } from "./email";

const KEY = "prepflow-demo-v2";

function load(): Vehicle[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Vehicle[];
  } catch {
    /* corrupted storage — fall through to seed */
  }
  return seedVehicles();
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);

  useEffect(() => {
    setVehicles(load());
  }, []);

  const persist = useCallback((next: Vehicle[]) => {
    setVehicles(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full/blocked — demo keeps state in memory */
    }
  }, []);

  const patch = useCallback(
    (id: string, fn: (v: Vehicle) => Vehicle) => {
      setVehicles((prev) => {
        if (!prev) return prev;
        const next = prev.map((v) => (v.id === id ? fn(v) : v));
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const enterStage = (v: Vehicle, stage: StageKey, at = Date.now()): Vehicle => ({
    ...v,
    stage,
    stageEnteredAt: at,
    timeline: [...v.timeline, { label: STAGES[stage].timelineLabel, at }],
  });

  /** one-click advance for linear stages */
  const advance = useCallback(
    (id: string) => {
      patch(id, (v) => {
        const meta = STAGES[v.stage];
        if (v.stage === "AT_TLC") {
          const at = Date.now();
          return {
            ...enterStage({ ...v, tlcDone: true }, "WORKSHOP_COMPLETE", at),
            timeline: [...v.timeline, { label: "TLC completed", at }],
            stage: "WORKSHOP_COMPLETE",
            stageEnteredAt: at,
          };
        }
        if (v.stage === "AT_BODYSHOP") {
          const at = Date.now();
          return {
            ...v,
            ewarcDone: true,
            stage: "WORKSHOP_COMPLETE",
            stageEnteredAt: at,
            timeline: [...v.timeline, { label: "EWARC completed", at }],
          };
        }
        if (v.stage === "VALETED") {
          const at = Date.now();
          return {
            ...v,
            stage: "READY",
            stageEnteredAt: at,
            timeline: [...v.timeline, { label: "Photographed", at }],
          };
        }
        if (meta.nextStage) return enterStage(v, meta.nextStage);
        return v;
      });
    },
    [patch],
  );

  const sendToTLC = useCallback(
    (id: string, type: WheelType, positions: WheelPos[], po: string, notes: string) => {
      patch(id, (v) => {
        const at = Date.now();
        const withWheels = { ...v, wheelType: type, wheelPositions: positions, purchaseOrder: po };
        const email = tlcEmail(withWheels, po, notes, at);
        return {
          ...withWheels,
          stage: "AT_TLC",
          stageEnteredAt: at,
          timeline: [...v.timeline, { label: "Sent to TLC", at }],
          emails: [...v.emails, email],
        };
      });
    },
    [patch],
  );

  const sendToBodyshop = useCallback(
    (id: string) => {
      patch(id, (v) => {
        const at = Date.now();
        const email = bodyshopEmail(v, at);
        return {
          ...v,
          stage: "AT_BODYSHOP",
          stageEnteredAt: at,
          timeline: [...v.timeline, { label: "Sent to EWARC", at }],
          emails: [...v.emails, email],
        };
      });
    },
    [patch],
  );

  const addToValetSheet = useCallback(
    (id: string) => {
      patch(id, (v) => {
        const at = Date.now();
        return {
          ...v,
          stage: "ON_VALET_SHEET",
          stageEnteredAt: at,
          timeline: [...v.timeline, { label: "Added to valet sheet", at }],
        };
      });
    },
    [patch],
  );

  const markAucCompleted = useCallback(
    (id: string) => {
      patch(id, (v) => ({
        ...v,
        aucCompleted: true,
        timeline: [...v.timeline, { label: "AUC completed", at: Date.now() }],
      }));
    },
    [patch],
  );

  const addVehicle = useCallback(
    (v: Omit<Vehicle, "id" | "stage" | "stageEnteredAt" | "timeline" | "emails" | "comments" | "aucCompleted" | "tlcDone" | "ewarcDone">) => {
      setVehicles((prev) => {
        const at = Date.now();
        const vehicle: Vehicle = {
          ...v,
          id: `v-${at}-${Math.random().toString(36).slice(2, 7)}`,
          aucCompleted: false,
          tlcDone: false,
          ewarcDone: false,
          stage: "TO_GO_TO_PDI",
          stageEnteredAt: at,
          timeline: [{ label: "Added to system", at }],
          emails: [],
          comments: [],
        };
        const next = [vehicle, ...(prev ?? [])];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const updateVehicle = useCallback(
    (id: string, fields: Partial<Vehicle>) => {
      patch(id, (v) => ({ ...v, ...fields }));
    },
    [patch],
  );

  const deleteVehicle = useCallback(
    (id: string) => {
      setVehicles((prev) => {
        const next = (prev ?? []).filter((v) => v.id !== id);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const addComment = useCallback(
    (id: string, text: string) => {
      patch(id, (v) => ({ ...v, comments: [...v.comments, { text, at: Date.now() }] }));
    },
    [patch],
  );

  const resetDemo = useCallback(() => {
    const fresh = seedVehicles();
    persist(fresh);
  }, [persist]);

  return {
    vehicles,
    advance,
    sendToTLC,
    sendToBodyshop,
    addToValetSheet,
    markAucCompleted,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addComment,
    resetDemo,
  };
}

export type Store = ReturnType<typeof useVehicles>;
export type { EmailRecord };

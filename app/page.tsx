"use client";

import { useEffect, useMemo, useState } from "react";
import type { TabKey, Vehicle, WheelPos, WheelType } from "@/lib/types";
import { STAGES, TABS, daysInStage } from "@/lib/stages";
import { useVehicles } from "@/lib/store";
import InsightsView from "@/components/InsightsView";
import VehicleRow from "@/components/VehicleRow";
import ActionCard from "@/components/ActionCard";
import WheelModal from "@/components/WheelModal";
import TimelineModal from "@/components/TimelineModal";
import EmailModal from "@/components/EmailModal";
import CommentsModal from "@/components/CommentsModal";
import VehicleFormModal, { type VehicleFormValues } from "@/components/VehicleFormModal";
import { IconBell, IconChart, IconPlus, IconRefresh, IconSync } from "@/components/icons";
import {
  disableNotifications,
  enableNotifications,
  notificationsEnabled,
  notificationsSupported,
  notify,
} from "@/lib/notify";

type ModalState =
  | { kind: "action" | "wheels" | "timeline" | "emails" | "edit" | "comments"; id: string }
  | { kind: "add" }
  | null;

export default function Home() {
  const store = useVehicles();
  const [tab, setTab] = useState<TabKey | "INSIGHTS">("PDI");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [notifOn, setNotifOn] = useState(false);
  // avoids SSR/client hydration mismatch for browser-API-dependent UI (bell button)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotifOn(notificationsEnabled());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const vehicles = store.vehicles ?? [];

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { PDI: 0, TLC: 0, BODYSHOP: 0, VALET: 0 };
    for (const v of vehicles) c[STAGES[v.stage].tab] += 1;
    return c;
  }, [vehicles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (tab === "INSIGHTS" || STAGES[v.stage].tab !== tab) return false;
      if (!q) return true;
      return [v.model, v.reg, v.chassis, v.bodyworkNotes, v.make]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [vehicles, tab, query]);

  const overdueCount = useMemo(
    () =>
      vehicles.filter(
        (v) => v.stage !== "READY" && daysInStage(v.stageEnteredAt) > STAGES[v.stage].sla,
      ).length,
    [vehicles],
  );

  // notify once per vehicle when it crosses its stage SLA
  useEffect(() => {
    if (!notifOn || vehicles.length === 0) return;
    const overdueNow = vehicles.filter(
      (v) => v.stage !== "READY" && daysInStage(v.stageEnteredAt) > STAGES[v.stage].sla,
    );
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem("prepflow-notified-overdue") ?? "[]");
    } catch {
      /* ignore */
    }
    const fresh = overdueNow.filter((v) => !seen.includes(`${v.id}:${v.stage}`));
    for (const v of fresh) {
      const days = daysInStage(v.stageEnteredAt);
      void notify(
        `⚠ ${v.reg} is overdue`,
        `${v.model} — ${days} days in "${STAGES[v.stage].label}" (target ${STAGES[v.stage].sla})`,
      );
    }
    if (fresh.length) {
      const next = [...seen, ...fresh.map((v) => `${v.id}:${v.stage}`)].slice(-100);
      try {
        localStorage.setItem("prepflow-notified-overdue", JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, [notifOn, vehicles]);

  const current = modal && "id" in modal ? vehicles.find((v) => v.id === modal.id) : undefined;

  const submitWheels = (type: WheelType, positions: WheelPos[], po: string, notes: string) => {
    if (!current) return;
    store.sendToTLC(current.id, type, positions, po, notes);
    showToast("PO submitted — e-mail to wheel vendor generated");
    void notify(`${current.reg} sent to TLC`, `PO ${po} · ${positions.join(", ")} · e-mail to the wheel vendor generated.`);
    setModal({ kind: "emails", id: current.id });
    setTab("TLC");
  };

  const saveForm = (values: VehicleFormValues) => {
    if (modal?.kind === "add") {
      store.addVehicle({
        ...values,
        wheelPositions: [],
      });
      showToast(`${values.reg} added — waiting to go to PDI`);
      setTab("PDI");
      setModal(null);
    } else if (modal?.kind === "edit" && current) {
      store.updateVehicle(current.id, values);
      showToast("Vehicle saved");
      setModal(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      {/* header */}
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="PrepFlow" className="h-12 w-12 rounded-2xl shadow-lg shadow-cyan-500/20" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-silver">PrepFlow</span>{" "}
              <span className="ml-1 rounded-md border border-amber-300/30 bg-amber-300/15 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-amber-200">
                Demo
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Vehicle preparation control — PDI → wheels → bodyshop → valet → photos
            </p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            className="field-input w-48"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="icon-btn h-10 w-10 border border-white/10 bg-white/5"
            title="Refresh"
            onClick={() => showToast("Refreshed")}
          >
            <IconRefresh />
          </button>
          {mounted && notificationsSupported() && (
            <button
              className={`icon-btn h-10 w-10 border ${notifOn ? "border-cyan-300/50 bg-cyan-400/15 !text-cyan-300" : "border-white/10 bg-white/5"}`}
              title={notifOn ? "Notifications on — click to mute" : "Enable notifications (overdue alerts)"}
              onClick={async () => {
                if (notifOn) {
                  disableNotifications();
                  setNotifOn(false);
                  showToast("Notifications muted");
                } else {
                  const ok = await enableNotifications();
                  setNotifOn(ok);
                  if (ok) {
                    showToast("Notifications on — you'll hear about overdue cars");
                    void notify("PrepFlow notifications enabled", "You'll be alerted when a car goes over its stage target.");
                  } else {
                    showToast("Notifications blocked by the browser");
                  }
                }
              }}
            >
              <IconBell off={!notifOn} />
            </button>
          )}
          <button className="btn-ghost" onClick={() => showToast("Movement requests are not part of this demo")}>
            Movement request
          </button>
          <button
            className="btn-ghost"
            title="Pull newly arrived cars from the DMS feed (simulated Pinewood export)"
            onClick={async () => {
              try {
                const feed = (await fetch("/dms-feed.json").then((r) => r.json())) as {
                  vehicles: { stock: string; make: string; model: string; reg: string; chassis: string; bodywork: string }[];
                };
                const existing = new Set(vehicles.map((v) => v.reg));
                const fresh = feed.vehicles.filter((f) => !existing.has(f.reg));
                for (const f of fresh) {
                  store.addVehicle({
                    stock: (f.stock === "SOLD" ? "SOLD" : "STOCK") as Vehicle["stock"],
                    make: f.make,
                    model: f.model,
                    reg: f.reg,
                    chassis: f.chassis,
                    bodyworkNotes: f.bodywork,
                    valetingNotes: "",
                    photos: [],
                    wheelPositions: [],
                    aucLine: true,
                    mot: false,
                  });
                }
                setTab("PDI");
                showToast(
                  fresh.length
                    ? `Imported ${fresh.length} vehicle${fresh.length === 1 ? "" : "s"} from DMS (${feed.vehicles.length - fresh.length} already in system)`
                    : "DMS feed checked — no new vehicles",
                );
              } catch {
                showToast("Could not reach the DMS feed");
              }
            }}
          >
            <IconSync /> DMS import
          </button>
          <button className="btn-primary" onClick={() => setModal({ kind: "add" })}>
            <IconPlus /> Add Vehicle
          </button>
        </div>
      </header>

      {/* tabs */}
      <nav className="glass mb-5 flex flex-wrap gap-1 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
              tab === t.key
                ? "bg-gradient-to-br from-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            {t.label}
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                tab === t.key ? "bg-slate-950/85 text-cyan-300" : "bg-white/10 text-slate-300"
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
        <button
          onClick={() => setTab("INSIGHTS")}
          className={`relative ml-auto flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
            tab === "INSIGHTS"
              ? "bg-gradient-to-br from-slate-100 to-slate-300 text-slate-950 shadow-lg shadow-white/10"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
          }`}
        >
          <IconChart /> Insights
          {overdueCount > 0 && (
            <span className="alert-pulse flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
              {overdueCount}
            </span>
          )}
        </button>
      </nav>

      {/* list */}
      {store.vehicles === null ? (
        <p className="py-20 text-center text-sm text-slate-500">Loading…</p>
      ) : tab === "INSIGHTS" ? (
        <InsightsView vehicles={vehicles} />
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-16 text-center text-sm text-slate-500">
          No vehicles in this tab{query ? " matching your search" : ""}.
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((v, i) => (
            <VehicleRow
              key={v.id}
              v={v}
              index={i}
              onAdvance={() => {
                const next = STAGES[v.stage].nextStage;
                store.advance(v.id);
                showToast("Status updated");
                if (next === "WORKSHOP_COMPLETE" || v.stage === "AT_TLC" || v.stage === "AT_BODYSHOP") {
                  void notify(
                    `${v.reg} — workshop complete`,
                    v.stage === "AT_TLC" || v.stage === "AT_BODYSHOP"
                      ? `${v.model} is back from the vendor — choose its next step.`
                      : `${v.model} finished the workshop — choose its next step.`,
                  );
                }
              }}
              onOpenAction={() => setModal({ kind: "action", id: v.id })}
              onEdit={() => setModal({ kind: "edit", id: v.id })}
              onTimeline={() => setModal({ kind: "timeline", id: v.id })}
              onEmails={() => setModal({ kind: "emails", id: v.id })}
              onComments={() => setModal({ kind: "comments", id: v.id })}
            />
          ))}
        </div>
      )}

      {/* footer */}
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-500">
        <span>
          Demo build — all data lives in your browser (localStorage). Installable as an app (PWA).
        </span>
        <button
          className="cursor-pointer underline transition-colors hover:text-slate-300"
          onClick={() => {
            store.resetDemo();
            showToast("Demo data reset");
          }}
        >
          Reset demo data
        </button>
      </footer>

      {/* modals */}
      {modal?.kind === "add" && (
        <VehicleFormModal mode="add" onClose={() => setModal(null)} onSave={saveForm} />
      )}
      {modal?.kind === "edit" && current && (
        <VehicleFormModal
          mode="edit"
          vehicle={current}
          onClose={() => setModal(null)}
          onSave={saveForm}
          onDelete={() => {
            if (window.confirm(`Delete ${current.reg}? This cannot be undone.`)) {
              store.deleteVehicle(current.id);
              setModal(null);
              showToast("Vehicle deleted");
            }
          }}
          onMoveToTrade={() => {
            store.updateVehicle(current.id, { stock: "TRADE" });
            setModal(null);
            showToast(`${current.reg} moved to trade`);
          }}
        />
      )}
      {modal?.kind === "action" && current && (
        <ActionCard
          v={current}
          onClose={() => setModal(null)}
          onSendToTLC={() => setModal({ kind: "wheels", id: current.id })}
          onSendToBodyshop={() => {
            store.sendToBodyshop(current.id);
            showToast("E-mail to bodyshop estimators generated");
            void notify(`${current.reg} sent to bodyshop`, "E-mail to the EWARC estimators generated.");
            setModal({ kind: "emails", id: current.id });
            setTab("BODYSHOP");
          }}
          onAddToValet={() => {
            store.addToValetSheet(current.id);
            showToast(`${current.reg} added to valet sheet`);
            setModal(null);
            setTab("VALET");
          }}
          onAucCompleted={() => {
            store.markAucCompleted(current.id);
            showToast("AUC completed");
          }}
        />
      )}
      {modal?.kind === "wheels" && current && (
        <WheelModal v={current} onClose={() => setModal(null)} onSubmit={submitWheels} />
      )}
      {modal?.kind === "timeline" && current && (
        <TimelineModal v={current} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "emails" && current && (
        <EmailModal v={current} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "comments" && current && (
        <CommentsModal
          v={current}
          onClose={() => setModal(null)}
          onAdd={(text) => store.addComment(current.id, text)}
        />
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-cyan-300/40 bg-slate-900/95 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/10 backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
}

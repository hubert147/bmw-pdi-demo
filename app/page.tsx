"use client";

import { useMemo, useState } from "react";
import type { TabKey, WheelPos, WheelType } from "@/lib/types";
import { STAGES, TABS } from "@/lib/stages";
import { useVehicles } from "@/lib/store";
import VehicleRow from "@/components/VehicleRow";
import ActionCard from "@/components/ActionCard";
import WheelModal from "@/components/WheelModal";
import TimelineModal from "@/components/TimelineModal";
import EmailModal from "@/components/EmailModal";
import CommentsModal from "@/components/CommentsModal";
import VehicleFormModal, { type VehicleFormValues } from "@/components/VehicleFormModal";
import { IconRefresh } from "@/components/icons";

type ModalState =
  | { kind: "action" | "wheels" | "timeline" | "emails" | "edit" | "comments"; id: string }
  | { kind: "add" }
  | null;

export default function Home() {
  const store = useVehicles();
  const [tab, setTab] = useState<TabKey>("PDI");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);

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
      if (STAGES[v.stage].tab !== tab) return false;
      if (!q) return true;
      return [v.model, v.reg, v.chassis, v.bodyworkNotes, v.make]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [vehicles, tab, query]);

  const current = modal && "id" in modal ? vehicles.find((v) => v.id === modal.id) : undefined;

  const submitWheels = (type: WheelType, positions: WheelPos[], po: string, notes: string) => {
    if (!current) return;
    store.sendToTLC(current.id, type, positions, po, notes);
    showToast("PO submitted — e-mail to wheel vendor generated");
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
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="PrepFlow" className="h-11 w-11 rounded-xl shadow" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              PrepFlow{" "}
              <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900 align-middle">
                Demo
              </span>
            </h1>
            <p className="text-xs text-slate-500">Vehicle preparation control — PDI → wheels → bodyshop → valet → photos</p>
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
            className="icon-btn h-10 w-10 border border-slate-200 bg-white"
            title="Refresh"
            onClick={() => showToast("Refreshed")}
          >
            <IconRefresh />
          </button>
          <button className="btn-ghost" onClick={() => showToast("Movement requests are not part of this demo")}>
            Movement request
          </button>
          <button className="btn-primary" onClick={() => setModal({ kind: "add" })}>
            + Add Vehicle
          </button>
        </div>
      </header>

      {/* tabs */}
      <nav className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white/80 p-1.5 shadow-sm backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.key ? "bg-blue-700 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                tab === t.key ? "bg-white text-blue-700" : "bg-blue-600 text-white"
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </nav>

      {/* list */}
      {store.vehicles === null ? (
        <p className="py-20 text-center text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center text-sm text-slate-500">
          No vehicles in this tab{query ? " matching your search" : ""}.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <VehicleRow
              key={v.id}
              v={v}
              onAdvance={() => {
                store.advance(v.id);
                showToast("Status updated");
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
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-400">
        <span>
          Demo build — all data lives in your browser (localStorage). Installable as an app (PWA).
        </span>
        <button
          className="underline hover:text-slate-600"
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
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

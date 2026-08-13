"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import Modal from "./Modal";

export default function ActionCard({
  v,
  onClose,
  onSendToTLC,
  onSendToBodyshop,
  onAddToValet,
  onAucCompleted,
}: {
  v: Vehicle;
  onClose: () => void;
  onSendToTLC: () => void;
  onSendToBodyshop: () => void;
  onAddToValet: () => void;
  onAucCompleted: () => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <Modal onClose={onClose} wide>
      <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-emerald-100 to-teal-300 p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Workshop complete — what happens next with {v.reg}?
        </h2>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <table className="kv-table bg-white/70">
            <thead>
              <tr>
                <th className="w-1/2">Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Stock/Sold</td><td>{v.stock}</td></tr>
              <tr><td>Model</td><td>{v.model}</td></tr>
              <tr><td>Reg</td><td>{v.reg}</td></tr>
              <tr><td>Chassis</td><td>{v.chassis}</td></tr>
              <tr>
                <td>Alloys to be refurbished</td>
                <td>{v.wheelPositions.length ? v.wheelPositions.join(" ") : "—"}</td>
              </tr>
              <tr><td>Bodywork Note</td><td>{v.bodyworkNotes || "—"}</td></tr>
            </tbody>
          </table>
          <div className="rounded-lg border border-slate-300 bg-white/70 p-3">
            <p className="text-sm font-semibold">Attachments</p>
            {v.photos.length === 0 ? (
              <p className="mt-4 text-center text-sm text-slate-500">No attachments</p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {v.photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={p.dataUrl}
                    alt={`Damage photo ${i + 1}`}
                    className="h-16 w-full cursor-zoom-in rounded-md border border-slate-300 object-cover shadow-sm hover:brightness-105"
                    onClick={() => setLightbox(p.dataUrl)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" disabled={v.tlcDone} onClick={onSendToTLC}>
            {v.tlcDone ? "TLC done ✓" : "Send to TLC"}
          </button>
          <button className="btn-primary" disabled={v.ewarcDone} onClick={onSendToBodyshop}>
            {v.ewarcDone ? "Bodyshop done ✓" : "Send to Bodyshop"}
          </button>
          <button className="btn-primary" onClick={onAddToValet}>
            Add to valet sheet
          </button>
          <button className="btn-primary" disabled={v.aucCompleted} onClick={onAucCompleted}>
            {v.aucCompleted ? "AUC Completed ✓" : "AUC Completed"}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-600">
          Sending to TLC or Bodyshop generates the vendor e-mail automatically — the car returns to
          this screen when the vendor finishes, then goes on the valet sheet.
        </p>
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex cursor-zoom-out items-center justify-center bg-slate-900/80 p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Damage photo" className="max-h-full max-w-full rounded-xl shadow-2xl" />
        </div>
      )}
    </Modal>
  );
}

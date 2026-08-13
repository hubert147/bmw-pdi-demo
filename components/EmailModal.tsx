"use client";

import type { Vehicle } from "@/lib/types";
import { fmtDateTime } from "@/lib/format";
import Modal from "./Modal";

export default function EmailModal({ v, onClose }: { v: Vehicle; onClose: () => void }) {
  const emails = [...v.emails].reverse();
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <h2 className="mb-1 text-lg font-bold text-slate-100">
          Auto-generated e-mails — <span className="text-cyan-300">{v.reg}</span>
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          In production these are sent automatically to the vendor when a stage changes. The demo
          shows exactly what would go out.
        </p>
        {emails.length === 0 && (
          <p className="rounded-xl bg-white/5 p-4 text-sm text-slate-400">
            No e-mails generated yet — send the car to TLC or Bodyshop first.
          </p>
        )}
        <div className="space-y-4">
          {emails.map((e, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/12 shadow-sm">
              <div className="border-b border-white/10 bg-gradient-to-r from-cyan-950/80 to-slate-900/80 px-4 py-3 text-slate-100">
                <p className="text-sm font-bold">{e.subject}</p>
                <p className="mt-1 text-xs text-slate-400">
                  To: {e.to}
                  {e.cc ? ` · Cc: ${e.cc}` : ""} · {fmtDateTime(e.at)}
                </p>
              </div>
              <div className="bg-white/[0.03] p-4">
                <table className="kv-table">
                  <thead>
                    <tr>
                      <th className="w-1/2">Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.rows.map(([k, val], j) => (
                      <tr key={j}>
                        <td>{k}</td>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {e.notes && (
                  <p className="mt-3 text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">Notes:</span> {e.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

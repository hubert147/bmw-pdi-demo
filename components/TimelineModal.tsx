"use client";

import type { Vehicle } from "@/lib/types";
import { STAGES } from "@/lib/stages";
import { fmtDateTime } from "@/lib/format";
import Modal from "./Modal";

export default function TimelineModal({ v, onClose }: { v: Vehicle; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Vehicle history</h2>
        <table className="kv-table">
          <thead>
            <tr>
              <th className="w-1/2">Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Title</td><td>{v.chassis}</td></tr>
            <tr><td>Registration</td><td>{v.reg}</td></tr>
            <tr><td>Model</td><td>{v.model}</td></tr>
            <tr className="bg-yellow-100">
              <td className="font-semibold">Current Stage</td>
              <td className="font-semibold">{STAGES[v.stage].label}</td>
            </tr>
            {v.timeline.map((t, i) => (
              <tr key={i}>
                <td>{t.label}</td>
                <td>{fmtDateTime(t.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex justify-center">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

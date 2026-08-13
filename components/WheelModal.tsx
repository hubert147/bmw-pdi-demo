"use client";

import { useState } from "react";
import type { Vehicle, WheelPos, WheelType } from "@/lib/types";
import { WHEEL_PRICES } from "@/lib/stages";
import { fmtMoney } from "@/lib/format";
import Modal from "./Modal";

const POSITIONS: WheelPos[] = ["NSF", "OSF", "NSR", "OSR"];

export default function WheelModal({
  v,
  onClose,
  onSubmit,
}: {
  v: Vehicle;
  onClose: () => void;
  onSubmit: (type: WheelType, positions: WheelPos[], po: string, notes: string) => void;
}) {
  const [type, setType] = useState<WheelType>(v.wheelType ?? "Diamond Cut");
  const [positions, setPositions] = useState<WheelPos[]>(v.wheelPositions);
  const [po, setPo] = useState(v.purchaseOrder ?? "");
  const [notes, setNotes] = useState("");

  const count = positions.length;
  const price = count > 0 ? WHEEL_PRICES[type][count - 1] : 0;

  const toggle = (p: WheelPos) =>
    setPositions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        <h2 className="mb-1 text-lg font-bold text-slate-100">
          Wheel refurbishment — <span className="text-cyan-300">{v.reg}</span>
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          Pick the wheels, raise the purchase order, and the e-mail to the wheel vendor is generated
          automatically.
        </p>

        <table className="kv-table mb-4">
          <thead>
            <tr>
              <th></th>
              <th>1 Wheel</th>
              <th>2 Wheels</th>
              <th>3 Wheels</th>
              <th>4 Wheels</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(WHEEL_PRICES) as WheelType[]).map((t) => (
              <tr key={t}>
                <td
                  className={`cursor-pointer font-semibold ${type === t ? "!bg-cyan-400/15" : ""}`}
                  onClick={() => setType(t)}
                >
                  <label className="flex cursor-pointer items-center gap-2 accent-cyan-400">
                    <input type="radio" checked={type === t} onChange={() => setType(t)} />
                    {t}
                  </label>
                </td>
                {WHEEL_PRICES[t].map((p, i) => (
                  <td
                    key={i}
                    className={
                      type === t && count === i + 1
                        ? "!bg-amber-300/20 font-bold !text-amber-200"
                        : "!text-slate-400"
                    }
                  >
                    {fmtMoney(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-4">
          <span className="field-label">Wheels to be refurbished</span>
          <div className="flex gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p}
                className={`btn ${
                  positions.includes(p)
                    ? "bg-gradient-to-br from-cyan-300 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
                onClick={() => toggle(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="po">
              Purchase order number *
            </label>
            <input
              id="po"
              className="field-input"
              value={po}
              onChange={(e) => setPo(e.target.value)}
              placeholder="e.g. 12345"
            />
          </div>
          <div className="flex items-end justify-end">
            <p className="text-sm text-slate-400">
              Total:{" "}
              <span className="text-xl font-bold text-white">{fmtMoney(price)}</span>
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="field-label" htmlFor="tlc-notes">
            Notes to TLC
          </label>
          <textarea
            id="tlc-notes"
            className="field-input min-h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <button
            className="btn-primary px-6 py-2.5"
            disabled={!po.trim() || count === 0}
            onClick={() => onSubmit(type, positions, po.trim(), notes.trim())}
          >
            Submit PO and Send Email to TLC
          </button>
        </div>
      </div>
    </Modal>
  );
}

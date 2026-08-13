"use client";

import { useState } from "react";
import type { StockStatus, Vehicle, WheelType } from "@/lib/types";
import Modal from "./Modal";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="field-label mb-0">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
      <span className="text-sm text-slate-600">{checked ? "On" : "Off"}</span>
    </label>
  );
}

export interface VehicleFormValues {
  stock: StockStatus;
  make: string;
  model: string;
  reg: string;
  chassis: string;
  bodyworkNotes: string;
  valetingNotes: string;
  wheelType?: WheelType;
  aucLine: boolean;
  mot: boolean;
}

export default function VehicleFormModal({
  mode,
  vehicle,
  onClose,
  onSave,
  onDelete,
  onMoveToTrade,
}: {
  mode: "add" | "edit";
  vehicle?: Vehicle;
  onClose: () => void;
  onSave: (values: VehicleFormValues) => void;
  onDelete?: () => void;
  onMoveToTrade?: () => void;
}) {
  const [stock, setStock] = useState<StockStatus>(vehicle?.stock ?? "STOCK");
  const [make, setMake] = useState(vehicle?.make ?? "Mercedes-Benz");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [reg, setReg] = useState(vehicle?.reg ?? "");
  const [chassis, setChassis] = useState(vehicle?.chassis ?? "");
  const [bodywork, setBodywork] = useState(vehicle?.bodyworkNotes ?? "");
  const [valeting, setValeting] = useState(vehicle?.valetingNotes ?? "");
  const [wheelType, setWheelType] = useState<WheelType | "">(vehicle?.wheelType ?? "");
  const [aucLine, setAucLine] = useState(vehicle?.aucLine ?? true);
  const [mot, setMot] = useState(vehicle?.mot ?? false);
  const [emailDrivers, setEmailDrivers] = useState(false);

  const valid = model.trim() && reg.trim() && chassis.trim();

  const save = () =>
    onSave({
      stock,
      make: make.trim(),
      model: model.trim(),
      reg: reg.trim().toUpperCase(),
      chassis: chassis.trim().toUpperCase().slice(-7),
      bodyworkNotes: bodywork.trim(),
      valetingNotes: valeting.trim(),
      wheelType: wheelType || undefined,
      aucLine,
      mot,
    });

  return (
    <Modal onClose={onClose} wide>
      <div className="rounded-2xl bg-gradient-to-br from-teal-200 via-emerald-100 to-yellow-100 p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          {mode === "add" ? "Add Vehicle" : `Edit vehicle — ${vehicle?.reg}`}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="f-stock">Stock *</label>
            <select
              id="f-stock"
              className="field-input"
              value={stock}
              onChange={(e) => setStock(e.target.value as StockStatus)}
            >
              <option>STOCK</option>
              <option>SOLD</option>
              <option>TRADE</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="f-make">Make *</label>
            <select id="f-make" className="field-input" value={make} onChange={(e) => setMake(e.target.value)}>
              <option>Mercedes-Benz</option>
              <option>smart</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="f-model">Model *</label>
            <input id="f-model" className="field-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. 320" />
          </div>
          <div>
            <label className="field-label" htmlFor="f-reg">Registration *</label>
            <input id="f-reg" className="field-input font-mono" value={reg} onChange={(e) => setReg(e.target.value)} placeholder="AB51 ABC" />
          </div>
          <div>
            <label className="field-label" htmlFor="f-chassis">Chassis — last 7 only *</label>
            <input id="f-chassis" className="field-input font-mono" value={chassis} onChange={(e) => setChassis(e.target.value)} maxLength={7} placeholder="AB12345" />
          </div>
          <div>
            <label className="field-label" htmlFor="f-wheels">Wheels</label>
            <select
              id="f-wheels"
              className="field-input"
              value={wheelType}
              onChange={(e) => setWheelType(e.target.value as WheelType | "")}
            >
              <option value="">— none —</option>
              <option>Diamond Cut</option>
              <option>Normal</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="f-body">Bodywork Notes *</label>
            <textarea id="f-body" className="field-input min-h-16" value={bodywork} onChange={(e) => setBodywork(e.target.value)} placeholder="OK / describe damage" />
          </div>
          <div>
            <label className="field-label" htmlFor="f-valet">Valeting notes</label>
            <textarea id="f-valet" className="field-input min-h-16" value={valeting} onChange={(e) => setValeting(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-8">
          <Toggle checked={aucLine} onChange={setAucLine} label="AUC Line" />
          <Toggle checked={mot} onChange={setMot} label="MOT" />
          {mode === "add" && (
            <Toggle checked={emailDrivers} onChange={setEmailDrivers} label="Email the drivers?" />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {mode === "edit" ? (
            <button className="btn-danger" onClick={onDelete}>
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button className="btn-primary px-6" disabled={!valid} onClick={save}>
              {mode === "add" ? "Add Vehicle" : "💾 Save"}
            </button>
            {mode === "edit" && (
              <button className="btn-danger" onClick={onMoveToTrade}>
                MOVE TO TRADE
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

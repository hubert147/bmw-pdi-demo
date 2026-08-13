"use client";

import type { Vehicle } from "@/lib/types";
import { STAGES } from "@/lib/stages";
import { computeInsights } from "@/lib/insights";
import { downloadControlSheet } from "@/lib/csv";
import { IconDownload } from "./icons";

function Tile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "bad" | "good";
}) {
  const valueColor =
    tone === "bad" ? "text-red-400" : tone === "good" ? "text-emerald-400" : "text-white";
  return (
    <div className="glass px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold tabular-nums tracking-tight ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function InsightsView({ vehicles }: { vehicles: Vehicle[] }) {
  const ins = computeInsights(vehicles);
  const maxAvg = Math.max(...ins.stageStats.map((s) => s.avgDays), 0.001);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Live metrics from the current fleet — updated with every click.
        </p>
        <button
          className="btn-ghost"
          title="Download the full control sheet as CSV (opens in Excel)"
          onClick={() => downloadControlSheet(vehicles)}
        >
          <IconDownload /> Export control sheet (CSV)
        </button>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Cars in prep" value={String(ins.inPrep)} sub={`${ins.ready} ready for sale`} />
        <Tile
          label="Avg time to line"
          value={ins.avgT2L !== null ? `${ins.avgT2L.toFixed(1)} d` : "—"}
          sub="added → photographed"
        />
        <Tile
          label="Overdue now"
          value={String(ins.overdue.length)}
          sub="over stage target (SLA)"
          tone={ins.overdue.length > 0 ? "bad" : "good"}
        />
        <Tile
          label="Bottleneck stage"
          value={ins.bottleneck ? `${ins.bottleneck.avgDays.toFixed(1)} d` : "—"}
          sub={ins.bottleneck ? ins.bottleneck.label : ""}
          tone={ins.bottleneck?.overTarget ? "bad" : "default"}
        />
      </div>

      {/* days-in-stage bar chart */}
      <div className="glass p-5">
        <h3 className="text-sm font-bold text-slate-100">Average days in stage</h3>
        <p className="mb-4 text-xs text-slate-400">
          Where cars spend their time — the longest bar is your bottleneck. Red bars exceed the
          stage target.
        </p>
        <div className="space-y-2">
          {ins.stageStats.map((s) => (
            <div
              key={s.key}
              className="grid grid-cols-[10rem_1fr] items-center gap-2"
              title={`${s.label}: avg ${s.avgDays.toFixed(1)} days across ${s.samples} car${s.samples === 1 ? "" : "s"} · target ${s.sla} d`}
            >
              <span className="truncate text-right text-xs text-slate-400">{s.label}</span>
              <div className="flex items-center gap-2.5">
                <div className="h-3 flex-1 rounded-r-full bg-white/8">
                  <div
                    className={`h-3 rounded-r-full ${
                      s.overTarget
                        ? "bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                        : "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                    }`}
                    style={{ width: `${Math.max(2, (s.avgDays / maxAvg) * 100)}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-xs tabular-nums text-slate-300">
                  {s.avgDays.toFixed(1)} d
                  {s.overTarget && <span className="ml-1 font-bold text-red-400">⚠ &gt;{s.sla}d</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* vendor scorecard */}
      <div className="glass p-5">
        <h3 className="text-sm font-bold text-slate-100">Vendor scorecard</h3>
        <p className="mb-3 text-xs text-slate-400">
          Who actually delivers on time — hard numbers for the next price negotiation.
        </p>
        <div className="overflow-x-auto">
          <table className="kv-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Jobs done</th>
                <th>Avg turnaround</th>
                <th>Target</th>
                <th>On time</th>
                <th>In progress now</th>
              </tr>
            </thead>
            <tbody>
              {ins.vendorStats.map((s) => (
                <tr key={s.name}>
                  <td className="font-semibold">{s.name}</td>
                  <td className="tabular-nums">{s.completed}</td>
                  <td className="tabular-nums">{s.avgDays !== null ? `${s.avgDays.toFixed(1)} d` : "—"}</td>
                  <td className="tabular-nums">{s.target} d</td>
                  <td>
                    {s.onTimePct === null ? (
                      "—"
                    ) : (
                      <span
                        className={`chip ${
                          s.onTimePct >= 80
                            ? "bg-emerald-500/90 text-emerald-950"
                            : s.onTimePct >= 50
                              ? "bg-amber-400/90 text-amber-950"
                              : "bg-red-500 text-white"
                        }`}
                      >
                        {s.onTimePct >= 80 ? "✓" : "⚠"} {s.onTimePct}%
                      </span>
                    )}
                  </td>
                  <td className="tabular-nums">{s.inProgress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* overdue list */}
      <div className="glass p-5">
        <h3 className="text-sm font-bold text-slate-100">
          Overdue vehicles{" "}
          {ins.overdue.length > 0 && (
            <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {ins.overdue.length}
            </span>
          )}
        </h3>
        <p className="mb-3 text-xs text-slate-400">
          Sitting in a stage longer than its target — chase these first.
        </p>
        {ins.overdue.length === 0 ? (
          <p className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300">
            Nothing overdue — every car is inside its stage target.
          </p>
        ) : (
          <table className="kv-table">
            <thead>
              <tr>
                <th>Reg</th>
                <th>Model</th>
                <th>Stage</th>
                <th>Days in stage</th>
                <th>Target</th>
                <th>Over by</th>
              </tr>
            </thead>
            <tbody>
              {ins.overdue.map((r) => (
                <tr key={r.vehicle.id}>
                  <td className="font-mono">{r.vehicle.reg}</td>
                  <td>{r.vehicle.model}</td>
                  <td>{STAGES[r.vehicle.stage].label}</td>
                  <td className="tabular-nums">{r.days} d</td>
                  <td className="tabular-nums">{r.sla} d</td>
                  <td className="font-bold !text-red-400">+{r.days - r.sla} d</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        Metrics recomputed live from the demo data — the same numbers (time-to-line, days-in-stage,
        bottlenecks) that dedicated recon platforms lead with.
      </p>
    </div>
  );
}

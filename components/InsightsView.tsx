"use client";

import type { Vehicle } from "@/lib/types";
import { STAGES } from "@/lib/stages";
import { computeInsights } from "@/lib/insights";

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
    tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-600" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function InsightsView({ vehicles }: { vehicles: Vehicle[] }) {
  const ins = computeInsights(vehicles);
  const maxAvg = Math.max(...ins.stageStats.map((s) => s.avgDays), 0.001);

  return (
    <div className="space-y-6">
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
      <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">Average days in stage</h3>
        <p className="mb-3 text-xs text-slate-500">
          Where cars spend their time — the longest bar is your bottleneck. Red bars exceed the
          stage target.
        </p>
        <div className="space-y-1.5">
          {ins.stageStats.map((s) => (
            <div
              key={s.key}
              className="grid grid-cols-[10rem_1fr] items-center gap-2"
              title={`${s.label}: avg ${s.avgDays.toFixed(1)} days across ${s.samples} car${s.samples === 1 ? "" : "s"} · target ${s.sla} d`}
            >
              <span className="truncate text-right text-xs text-slate-600">{s.label}</span>
              <div className="flex items-center gap-2">
                <div className="h-3.5 flex-1 rounded-r bg-slate-100">
                  <div
                    className={`h-3.5 rounded-r ${s.overTarget ? "bg-red-600" : "bg-blue-600"}`}
                    style={{ width: `${Math.max(2, (s.avgDays / maxAvg) * 100)}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-xs tabular-nums text-slate-700">
                  {s.avgDays.toFixed(1)} d
                  {s.overTarget && <span className="ml-1 font-bold text-red-600">⚠ &gt;{s.sla}d</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* vendor scorecard */}
      <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">Vendor scorecard</h3>
        <p className="mb-3 text-xs text-slate-500">
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
                            ? "bg-emerald-600 text-white"
                            : s.onTimePct >= 50
                              ? "bg-amber-500 text-white"
                              : "bg-red-600 text-white"
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
      <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">
          Overdue vehicles{" "}
          {ins.overdue.length > 0 && (
            <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              {ins.overdue.length}
            </span>
          )}
        </h3>
        <p className="mb-3 text-xs text-slate-500">
          Sitting in a stage longer than its target — chase these first.
        </p>
        {ins.overdue.length === 0 ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            Nothing overdue — every car is inside its stage target. 🎉
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
                  <td className="font-bold text-red-600">+{r.days - r.sla} d</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        Metrics recomputed live from the demo data — the same numbers (time-to-line, days-in-stage,
        bottlenecks) that dedicated recon platforms lead with.
      </p>
    </div>
  );
}

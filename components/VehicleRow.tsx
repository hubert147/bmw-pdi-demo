"use client";

import type { Vehicle } from "@/lib/types";
import { ORDERED_STAGES, STAGES, dayBadgeClass, daysInStage } from "@/lib/stages";
import CarAvatar from "./CarAvatar";
import { IconArrow, IconComment, IconEdit, IconInfo, IconMail } from "./icons";

function PipelineBar({ v }: { v: Vehicle }) {
  const idx = ORDERED_STAGES.indexOf(v.stage);
  return (
    <div className="flex items-center gap-[3px]" title={`Stage ${idx + 1} of ${ORDERED_STAGES.length}: ${STAGES[v.stage].label}`}>
      {ORDERED_STAGES.map((s, i) => (
        <span
          key={s}
          className={`h-1 w-2.5 rounded-full transition-colors ${
            i < idx ? "bg-cyan-400/80" : i === idx ? "bg-cyan-300 animate-pulse" : "bg-white/12"
          }`}
        />
      ))}
    </div>
  );
}

export default function VehicleRow({
  v,
  index = 0,
  onAdvance,
  onOpenAction,
  onEdit,
  onTimeline,
  onEmails,
  onComments,
}: {
  v: Vehicle;
  index?: number;
  onAdvance: () => void;
  onOpenAction: () => void;
  onEdit: () => void;
  onTimeline: () => void;
  onEmails: () => void;
  onComments: () => void;
}) {
  const meta = STAGES[v.stage];
  const days = daysInStage(v.stageEnteredAt);
  const overdue = days > meta.sla;
  const showDays = v.stage !== "TO_GO_TO_PDI" && v.stage !== "READY";

  let action: React.ReactNode = null;
  if (v.stage === "READY") {
    action = <span className="chip bg-emerald-500/90 text-emerald-950">✓ Ready for sale</span>;
  } else if (v.stage === "WORKSHOP_COMPLETE") {
    action = (
      <button className="btn-primary !px-4 !py-1.5 !text-xs" onClick={onOpenAction}>
        Next steps…
      </button>
    );
  } else if (meta.nextLabel) {
    const targetChip = meta.nextStage ? STAGES[meta.nextStage].chip : "bg-teal-600 text-white";
    action = (
      <button className={`chip ${targetChip} cursor-pointer transition-all hover:brightness-110 hover:-translate-y-px`} onClick={onAdvance}>
        {meta.nextLabel}
      </button>
    );
  }

  return (
    <div
      className={`glass row-enter flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-3 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] md:flex-nowrap ${
        overdue ? "border-red-500/40" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <CarAvatar model={v.model} className="h-12 w-16" />

      <span className="w-28 shrink-0">
        <span className="block truncate text-sm font-bold tracking-tight" title={`${v.make} ${v.model}`}>
          {v.model}
        </span>
        <span className="mt-0.5 block font-mono text-[11px] tracking-wide text-cyan-200/80">{v.reg}</span>
      </span>

      <span className="w-24 shrink-0">
        <span className="block font-mono text-[11px] text-slate-400">{v.chassis}</span>
        <span className="mt-1 block">
          <PipelineBar v={v} />
        </span>
      </span>

      <span className="chip w-14 shrink-0 border border-amber-300/30 bg-amber-300/15 text-[10px] text-amber-200">
        {v.stock}
      </span>

      <span className="hidden max-w-[15rem] flex-1 truncate text-xs italic text-slate-400 lg:inline" title={v.bodyworkNotes}>
        {v.bodyworkNotes}
      </span>

      <span className="ml-auto flex items-center gap-2">
        {showDays && (
          <span
            className={`chip ${dayBadgeClass(days, meta.sla)} ${overdue ? "alert-pulse" : ""}`}
            title={overdue ? `Over stage target of ${meta.sla} day(s)` : `Target: ${meta.sla} day(s)`}
          >
            {days} day{overdue ? " ⚠" : ""}
          </span>
        )}
        <span className={`chip ${meta.chip}`}>{meta.label}</span>
        {action && (
          <>
            <IconArrow className="h-4 w-4 text-cyan-300/70" />
            {action}
          </>
        )}
      </span>

      <span className="flex items-center gap-0.5 border-l border-white/10 pl-2">
        <button className="icon-btn" title="Comments" onClick={onComments}>
          <IconComment />
          {v.comments.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400" />}
        </button>
        <button className="icon-btn" title="Edit vehicle" onClick={onEdit}>
          <IconEdit />
          {v.photos.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />}
        </button>
        <button className="icon-btn" title="Timeline / audit trail" onClick={onTimeline}>
          <IconInfo />
        </button>
        <button className="icon-btn" title="Sent emails" onClick={onEmails}>
          <IconMail />
          {v.emails.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-400" />}
        </button>
      </span>
    </div>
  );
}

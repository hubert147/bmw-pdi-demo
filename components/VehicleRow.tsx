"use client";

import type { Vehicle } from "@/lib/types";
import { STAGES, dayBadgeClass, daysInStage } from "@/lib/stages";
import { IconArrow, IconComment, IconEdit, IconInfo, IconMail } from "./icons";

export default function VehicleRow({
  v,
  onAdvance,
  onOpenAction,
  onEdit,
  onTimeline,
  onEmails,
  onComments,
}: {
  v: Vehicle;
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
    action = (
      <span className="chip bg-green-600 text-white">✓ Ready for sale</span>
    );
  } else if (v.stage === "WORKSHOP_COMPLETE") {
    action = (
      <button className="chip bg-blue-700 text-white hover:bg-blue-800 cursor-pointer" onClick={onOpenAction}>
        Next steps…
      </button>
    );
  } else if (meta.nextLabel) {
    const targetChip = meta.nextStage ? STAGES[meta.nextStage].chip : "bg-teal-600 text-white";
    action = (
      <button className={`chip ${targetChip} cursor-pointer hover:brightness-110`} onClick={onAdvance}>
        {meta.nextLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur transition-shadow hover:shadow-md md:flex-nowrap">
      <span className="chip w-16 shrink-0 bg-amber-200 text-amber-900">{v.stock}</span>
      <span className="w-24 shrink-0 truncate text-sm font-bold text-slate-800" title={`${v.make} ${v.model}`}>
        {v.model}
      </span>
      <span className="chip w-24 shrink-0 justify-center border border-amber-300 bg-amber-100 font-mono text-amber-900">
        {v.reg}
      </span>
      <span className="chip w-24 shrink-0 justify-center border border-amber-300 bg-amber-50 font-mono text-amber-900">
        {v.chassis}
      </span>

      <span className="hidden max-w-[16rem] flex-1 truncate text-xs italic text-slate-500 lg:inline" title={v.bodyworkNotes}>
        {v.bodyworkNotes}
      </span>

      <span className="ml-auto flex items-center gap-2">
        {showDays && (
          <span
            className={`chip ${dayBadgeClass(days, meta.sla)}`}
            title={overdue ? `Over stage target of ${meta.sla} day(s)` : `Target: ${meta.sla} day(s)`}
          >
            {days} day{overdue ? " ⚠" : ""}
          </span>
        )}
        <span className={`chip ${meta.chip}`}>{meta.label}</span>
        {action && (
          <>
            <IconArrow className="h-5 w-5 text-blue-700" />
            {action}
          </>
        )}
      </span>

      <span className="flex items-center gap-0.5 border-l border-slate-200 pl-2">
        <button className="icon-btn" title="Comments" onClick={onComments}>
          <IconComment />
          {v.comments.length > 0 && (
            <span className="absolute mt-[-14px] ml-[18px] h-2 w-2 rounded-full bg-blue-600" />
          )}
        </button>
        <button className="icon-btn" title="Edit vehicle" onClick={onEdit}>
          <IconEdit />
        </button>
        <button className="icon-btn" title="Timeline / audit trail" onClick={onTimeline}>
          <IconInfo />
        </button>
        <button className="icon-btn" title="Sent emails" onClick={onEmails}>
          <IconMail />
          {v.emails.length > 0 && (
            <span className="absolute mt-[-14px] ml-[18px] h-2 w-2 rounded-full bg-teal-600" />
          )}
        </button>
      </span>
    </div>
  );
}

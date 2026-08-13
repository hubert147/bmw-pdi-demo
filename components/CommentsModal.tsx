"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { fmtDateTime } from "@/lib/format";
import Modal from "./Modal";

export default function CommentsModal({
  v,
  onClose,
  onAdd,
}: {
  v: Vehicle;
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-100">
          Comments — <span className="text-cyan-300">{v.reg}</span>
        </h2>
        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
          {v.comments.length === 0 && (
            <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">No comments yet.</p>
          )}
          {[...v.comments].reverse().map((c, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/5 p-3">
              <p className="text-sm text-slate-200">{c.text}</p>
              <p className="mt-1 text-xs text-slate-500">{fmtDateTime(c.at)}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="field-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                onAdd(text.trim());
                setText("");
              }
            }}
          />
          <button
            className="btn-primary"
            disabled={!text.trim()}
            onClick={() => {
              onAdd(text.trim());
              setText("");
            }}
          >
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
}

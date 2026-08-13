"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

/** strip characters that never appear in a VIN (I, O, Q) and non-alphanumerics */
function sanitizeVin(raw: string): string {
  return raw.replace(/[^A-HJ-NPR-Z0-9]/gi, "").toUpperCase();
}

function demoVin(): string {
  const digits = () => String(Math.floor(Math.random() * 10));
  return `W1K2050421A${digits()}${digits()}${digits()}${digits()}${digits()}${digits()}`;
}

export default function VinScanModal({
  onClose,
  onDetected,
}: {
  onClose: () => void;
  /** receives the sanitised full scan text (VIN or any barcode/QR payload) */
  onDetected: (vin: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"starting" | "scanning" | "error">("starting");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let stopped = false;
    let controls: { stop: () => void } | null = null;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        if (!videoRef.current || stopped) return;
        controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result && !stopped) {
            const vin = sanitizeVin(result.getText());
            if (vin.length >= 6) {
              stopped = true;
              controls?.stop();
              onDetected(vin);
            }
          }
        });
        if (!stopped) setStatus("scanning");
      } catch (e) {
        if (!stopped) {
          setStatus("error");
          setErrorMsg(
            e instanceof Error && e.name === "NotAllowedError"
              ? "Camera access was blocked — allow the camera in your browser, or use the demo button below."
              : "Camera not available on this device — use the demo button below.",
          );
        }
      }
    })();

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [onDetected]);

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h2 className="mb-1 text-lg font-bold text-slate-100">Scan VIN</h2>
        <p className="mb-4 text-sm text-slate-400">
          Point the camera at the VIN barcode (door jamb / windscreen) or any QR code. The last 7
          characters fill the chassis field automatically.
        </p>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} className="h-64 w-full object-cover" muted playsInline />
          {status !== "error" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-4/5 rounded-lg border-2 border-emerald-400/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]" />
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 p-6">
              <p className="text-center text-sm text-slate-200">{errorMsg}</p>
            </div>
          )}
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          {status === "starting" && "Starting camera…"}
          {status === "scanning" && "Scanning… hold the code inside the frame"}
          {status === "error" && "Scanner unavailable"}
        </p>

        <div className="mt-4 flex justify-center gap-3">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={() => onDetected(demoVin())}>
            Simulate scan (demo VIN)
          </button>
        </div>
      </div>
    </Modal>
  );
}

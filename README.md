# PrepFlow — Vehicle Prep Control (Demo)

A demo PWA that recreates a dealership **vehicle preparation pipeline** — the workflow a car goes
through between arriving at the dealership and being ready for sale:

```
To go to PDI → Arrived at PDI → Job Card Raised → Workshop Started
→ Authority Requested → Authority Received → Workshop Complete
→ (Send to TLC — wheels / Send to Bodyshop — EWARC / AUC check)
→ Valet sheet → Valeted → Photographed → Ready for sale
```

Modelled on a real dealer-group workflow that currently runs on Power Apps + a shared Excel
control sheet + Outlook mail flows.

## What the demo shows

- **Tabbed dashboard** (PDI / TLC / Bodyshop / Valet-Photos) with live counters, search,
  days-in-stage badges and urgency colour coding
- **One-click stage advance** — the button on each row is always the next step
- **Action card** after workshop completion: send to wheel vendor, send to bodyshop,
  add to valet sheet, AUC completed
- **Wheel refurbishment modal** with the vendor price matrix, PO number and notes
- **Auto-generated vendor e-mails** (preview of exactly what would be sent)
- **Full audit timeline** per vehicle with timestamps
- **Add / edit vehicle** forms with AUC-line and MOT toggles, delete, move-to-trade
- **PWA** — installable, works offline, all demo data stored in `localStorage`

## Tech

Next.js 15 (static export) · React 19 · TypeScript · Tailwind CSS 4 · no backend needed for
the demo. Production path: Supabase (Postgres + realtime + auth) + Resend for vendor e-mails,
still deployable on Vercel free tier.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Static export (`next build` → `out/`) — deploys to Vercel, Netlify or any static host.

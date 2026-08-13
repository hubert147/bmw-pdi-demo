/** silver side-profile car silhouettes by body type — no brand marks, pure geometry */

type Body = "suv" | "sedan" | "hatch" | "van" | "sport";

export function bodyTypeFor(model: string): Body {
  const m = model.toUpperCase();
  if (/^(GL|EQ[BCES]|G |GLS|GLE|GLC|GLB|GLA)/.test(m) || m.startsWith("X") || m.startsWith("IX")) return "suv";
  if (/VITO|SPRINTER|CITAN|V \d/.test(m)) return "van";
  if (/AMG GT|SL|CLE|COUPE/.test(m) || /^AMG C 63/.test(m)) return "sport";
  if (/^(A |B |HATCH|COOPER)/.test(m)) return "hatch";
  return "sedan";
}

const PATHS: Record<Body, React.ReactNode> = {
  sedan: (
    <>
      <path d="M6 40 L10 32 Q11 30 14 29 L24 27 L32 20 Q33.5 18.5 36 18.5 L52 18.5 Q55 18.5 57 21 L63 27 L76 29.5 Q79 30 80 33 L81 39" />
      <path d="M3 40 L84 40" />
      <path d="M26.5 27 L34 20.5 Q35 19.8 36.6 19.8 L43 19.8 L43 27" />
      <path d="M46 27 L46 19.8 L51.6 19.8 Q53.6 19.8 55 21.4 L60 26.6" />
      <circle cx="24" cy="40" r="6" />
      <circle cx="24" cy="40" r="2.4" />
      <circle cx="66" cy="40" r="6" />
      <circle cx="66" cy="40" r="2.4" />
    </>
  ),
  suv: (
    <>
      <path d="M6 40 L9 30 Q10 27.5 13 27 L23 25.5 L29 17.5 Q30.2 16 32.5 16 L56 16 Q58.6 16 60.4 18 L66 24.5 L77 27 Q80 28 80.6 31 L81.5 39" />
      <path d="M3 40 L85 40" />
      <path d="M25.5 25.5 L30.6 18.4 Q31.4 17.4 33 17.4 L41 17.4 L41 25" />
      <path d="M44 25 L44 17.4 L55 17.4 Q56.8 17.4 58 18.8 L63 24.5" />
      <circle cx="23" cy="40" r="6.4" />
      <circle cx="23" cy="40" r="2.6" />
      <circle cx="66" cy="40" r="6.4" />
      <circle cx="66" cy="40" r="2.6" />
    </>
  ),
  hatch: (
    <>
      <path d="M7 40 L10.5 31.5 Q11.5 29.4 14.5 28.6 L24 27 L31 19.5 Q32.4 18 34.8 18 L52 18 Q56 18.4 58.5 22 L62 27.5 L74 29.6 Q77.5 30.6 78 34 L78.4 39" />
      <path d="M4 40 L82 40" />
      <path d="M26.6 26.8 L33 19.9 Q33.9 19.2 35.4 19.2 L42 19.2 L42 26.4" />
      <path d="M45 26.4 L45 19.2 L51.4 19.2 Q54.4 19.5 56.2 22.4 L59 26.8" />
      <circle cx="24" cy="40" r="5.8" />
      <circle cx="24" cy="40" r="2.3" />
      <circle cx="63" cy="40" r="5.8" />
      <circle cx="63" cy="40" r="2.3" />
    </>
  ),
  van: (
    <>
      <path d="M6 40 L7 20 Q7.3 16.5 11 16.5 L60 16.5 Q63 16.5 65 19 L74 28 L79.6 29.6 Q81.6 30.6 81.8 33 L82 39" />
      <path d="M3 40 L85 40" />
      <path d="M10.5 27 L10.5 19.4 L20 19.4 L20 27" />
      <path d="M24 27 L24 19.4 L34 19.4 L34 27" />
      <path d="M60 27 L60 19.4 Q62 19.5 63.4 21 L69 27" />
      <circle cx="21" cy="40" r="6.2" />
      <circle cx="21" cy="40" r="2.5" />
      <circle cx="67" cy="40" r="6.2" />
      <circle cx="67" cy="40" r="2.5" />
    </>
  ),
  sport: (
    <>
      <path d="M5 40 L9 34 Q10.5 31.6 14 31 L26 29 L36 22 Q38 20.6 41 20.6 L52 20.6 Q56 20.8 59 23.6 L64 28.4 L77 30.6 Q80.4 31.6 81 34.6 L81.6 39" />
      <path d="M2 40 L85 40" />
      <path d="M29 28.6 L37.6 22.6 Q38.8 21.9 40.6 21.9 L45.5 21.9 L45.5 28.2" />
      <path d="M48.5 28.2 L48.5 21.9 L52.4 21.9 Q55 22.1 57 24.1 L61 28" />
      <circle cx="24" cy="40" r="6" />
      <circle cx="24" cy="40" r="2.4" />
      <circle cx="66" cy="40" r="6" />
      <circle cx="66" cy="40" r="2.4" />
    </>
  ),
};

export default function CarAvatar({ model, className = "" }: { model: string; className?: string }) {
  const body = bodyTypeFor(model);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 88 52" fill="none" stroke="url(#car-silver)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[70%] w-[85%]">
        <defs>
          <linearGradient id="car-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2e8f0" />
            <stop offset="1" stopColor="#7d8da1" />
          </linearGradient>
        </defs>
        {PATHS[body]}
      </svg>
    </span>
  );
}

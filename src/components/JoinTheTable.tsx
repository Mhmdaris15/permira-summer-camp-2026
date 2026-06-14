// TODO(user-decision): see App.tsx — the form fields and submit destination
// are intentionally unimplemented. The CTA below either anchors to a future
// /register route or to an external Google Form, depending on what you choose.

export function JoinTheTable() {
  return (
    <section
      id="join"
      className="relative isolate overflow-hidden bg-clove-900 py-24 text-cream-50 md:py-32"
    >
      {/* Decorative — radial spice glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(224,123,60,0.25), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(217,154,59,0.15), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-saffron">
          The Invitation
        </span>
        <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-[1.05] tracking-tight md:text-7xl">
          A seat is being held <br />
          <span className="font-script text-saffron text-6xl md:text-8xl">just for you.</span>
        </h2>
        <p className="reveal mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-cream-100/75 md:text-lg">
          Reservations open in early 2026. Leave us a way to reach you and
          we'll write the moment doors open — with a recipe to read while you wait.
        </p>

        <div className="reveal mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
          <a
            href="#register"
            className="group inline-flex items-center gap-2 rounded-full bg-saffron px-8 py-4 text-sm font-medium text-clove-900 shadow-[0_15px_40px_-10px_rgba(217,154,59,0.5)] transition-all hover:bg-cream-50 hover:shadow-[0_18px_50px_-10px_rgba(253,248,241,0.6)]"
          >
            Reserve my seat
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="mailto:info@permiraspb.org"
            className="text-sm font-medium text-cream-100/70 underline-offset-4 transition-colors hover:text-cream-50 hover:underline"
          >
            or write to info@permiraspb.org
          </a>
        </div>

        <div className="reveal mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-cream-100/10 pt-10 text-left">
          <Detail label="Dates" value="July 17–19, 2026" />
          <Detail label="Location" value="Saint Petersburg" />
          <Detail label="For" value="Students · 18–35" />
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-cream-100/50">
        {label}
      </div>
      <div className="mt-2 font-display text-lg text-cream-50 md:text-xl">{value}</div>
    </div>
  );
}

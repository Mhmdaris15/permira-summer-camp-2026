/**
 * Stewardship — a short, quiet band expressing the camp's environmental
 * ethic through three lived commitments, not a lecture. Uses the nature
 * palette (pine / fern / river) to signal the eco partnership while staying
 * warm and student-facing. This is the section partners screenshot.
 */
import { motion } from "framer-motion";

type Commitment = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const COMMITMENTS: Commitment[] = [
  {
    title: "Local & seasonal",
    body: "Ingredients sourced close to home — Nusantara spices meet the produce and forests of the north.",
    icon: (
      <path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-4 3-5 5-9z" strokeLinejoin="round" />
    ),
  },
  {
    title: "Zero single-use",
    body: "Shared plates, refillable bottles, and a simple promise: every meal leaves nothing behind.",
    icon: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 11v6M14 11v6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Respect the wild",
    body: "We explore Saint Petersburg's parks and rivers as guests — leaving every place better than we found it.",
    icon: (
      <>
        <path d="M3 20c4-1 6-4 9-4s5 3 9 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 4c2.5 2 4 4.5 4 8 0 1.5-.5 3-1.5 4M12 4c-2.5 2-4 4.5-4 8 0 1.5.5 3 1.5 4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export function Stewardship() {
  return (
    <section id="stewardship" className="relative overflow-hidden bg-birch py-20 md:py-28">
      {/* Soft forest → river wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 0%, rgba(47,93,58,0.10), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(63,124,147,0.12), transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-pine">
            Lightly, by habit
          </span>
          <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-5xl">
            A camp that <span className="italic text-pine">lives lightly.</span>
          </h2>
          <p className="reveal mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-clove-700/80">
            This isn't a lecture on the environment — it's how we camp. The same
            care we give each other, we extend to the land that hosts us.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {COMMITMENTS.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl border border-pine/10 bg-cream-50/80 p-6 shadow-[0_18px_50px_-30px_rgba(47,93,58,0.5)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fern/15 text-pine transition-colors group-hover:bg-fern/25">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {c.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-xl text-clove-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-clove-700/80">{c.body}</p>
            </motion.article>
          ))}
        </div>

        <p className="reveal mt-10 text-center font-script text-2xl text-pine/80">
          Friendship you can taste · a planet worth keeping
        </p>
      </div>
    </section>
  );
}

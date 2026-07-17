import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Countdown to an ISO target time (e.g. the live-broadcast start). Ticks every
 * second and switches to a "Live now" state once the target passes. Styled for
 * the dark live-broadcast banner (cream text on clove-900).
 */

function remaining(targetMs: number) {
  const ms = targetMs - Date.now();
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    done: ms <= 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
  };
}

export function Countdown({ target }: { target: string }) {
  const { t } = useTranslation();
  const targetMs = new Date(target).getTime();
  const [time, setTime] = useState(() => remaining(targetMs));

  useEffect(() => {
    if (time.done) return;
    const id = setInterval(() => setTime(remaining(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs, time.done]);

  if (time.done) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-terracotta-500/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cream-50">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cream-50/70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cream-50" />
        </span>
        {t("ceremony.liveNow")}
      </div>
    );
  }

  const units = [
    { value: time.days, label: t("ceremony.unitDays") },
    { value: time.hours, label: t("ceremony.unitHours") },
    { value: time.mins, label: t("ceremony.unitMins") },
    { value: time.secs, label: t("ceremony.unitSecs") },
  ];

  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-cream-100/60">
        {t("ceremony.countdownLabel")}
      </div>
      <div className="mt-3 flex gap-2.5 sm:gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex min-w-[3.5rem] flex-col items-center rounded-xl border border-cream-100/10 bg-cream-100/[0.04] px-3 py-2.5"
          >
            <span className="font-display text-2xl font-light tabular-nums text-cream-50 md:text-3xl">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-cream-100/55">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

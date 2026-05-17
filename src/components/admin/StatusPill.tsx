import { cn } from "../../lib/cn";

export type ParticipantStatus = "pending" | "accepted" | "rejected" | "waitlist";

const styles: Record<ParticipantStatus, string> = {
  pending:  "bg-cream-200 text-clove-700",
  accepted: "bg-leaf/15 text-leaf",
  rejected: "bg-terracotta-500/15 text-terracotta-600",
  waitlist: "bg-saffron/15 text-clove-800",
};

export function StatusPill({
  status,
  className,
}: {
  status: ParticipantStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

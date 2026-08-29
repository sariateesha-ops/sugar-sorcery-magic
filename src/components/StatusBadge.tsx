export function StatusBadge({ status }: { status: string }) {
  const delivered = status.toLowerCase() === "delivered";
  return (
    <span
      className={
        delivered
          ? "inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-primary"
          : "inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground"
      }
    >
      {delivered ? "Delivered" : "Pending"}
    </span>
  );
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

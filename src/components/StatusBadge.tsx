import { VisaStatus, WatchlistStatus, AidNeed } from "@/data/mockData";

export function VisaBadge({ status }: { status: VisaStatus }) {
  const map: Record<VisaStatus, string> = {
    approved: "status-clear",
    pending: "status-warning",
    denied: "status-danger",
    expired: "bg-muted text-muted-foreground",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${map[status]}`}>{status}</span>;
}

export function WatchlistBadge({ status }: { status: WatchlistStatus }) {
  const map: Record<WatchlistStatus, string> = {
    clear: "status-clear",
    flagged: "status-danger",
    under_review: "status-warning",
  };
  const labels: Record<WatchlistStatus, string> = { clear: "Clear", flagged: "Flagged", under_review: "Review" };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${map[status]}`}>{labels[status]}</span>;
}

export function AidBadge({ need }: { need: AidNeed }) {
  const map: Record<AidNeed, string> = {
    medical: "status-danger",
    shelter: "status-info",
    food: "status-warning",
    none: "bg-muted text-muted-foreground",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${map[need]}`}>{need}</span>;
}

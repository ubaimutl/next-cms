import type {
  AdminMessageStatus,
  AdminOrderStatus,
  AdminProductAvailability,
  AdminUserRole,
} from "./types";

export const adminKickerClass =
  "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--admin-faint)]";

export const adminPanelMutedClass =
  "rounded-[0.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-text)] shadow-none";

export const adminPrimaryButtonClass =
  "inline-flex min-h-8 items-center justify-center rounded-[0.6rem] border border-[var(--color-base-content)] bg-[var(--color-base-content)] px-3 text-[0.78rem] font-semibold text-[var(--color-base-100)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-40";

export const adminSecondaryButtonClass =
  "inline-flex min-h-8 items-center justify-center rounded-[0.6rem] border border-[var(--admin-border)] bg-[var(--admin-surface-3)] px-3 text-[0.78rem] font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-surface)] disabled:cursor-not-allowed disabled:opacity-40";

export const adminDangerButtonClass =
  "inline-flex min-h-8 items-center justify-center rounded-[0.6rem] border border-[rgba(255,106,106,0.22)] bg-[rgba(255,106,106,0.06)] px-3 text-[0.78rem] font-medium text-[#ff9b9b] transition hover:border-[rgba(255,106,106,0.34)] hover:bg-[rgba(255,106,106,0.1)] disabled:cursor-not-allowed disabled:opacity-40";

export const adminInputClass =
  "w-full rounded-[0.7rem] border border-[var(--admin-border)] bg-[var(--admin-surface-3)] text-[var(--admin-text)] shadow-none transition placeholder:text-[var(--admin-faint)] focus:border-sky-400/30 focus:bg-[var(--admin-surface)] focus:outline-none min-h-12 px-[0.95rem]";

export const adminTextareaClass =
  "w-full rounded-[0.7rem] border border-[var(--admin-border)] bg-[var(--admin-surface-3)] p-[0.95rem] text-[var(--admin-text)] leading-[1.65] shadow-none transition placeholder:text-[var(--admin-faint)] focus:border-sky-400/30 focus:bg-[var(--admin-surface)] focus:outline-none min-h-28";

export const adminFileInputClass =
  "block w-full text-[0.82rem] text-[var(--admin-muted)] file:mr-3 file:rounded-[0.45rem] file:border file:border-[var(--admin-border)] file:bg-[var(--admin-surface-3)] file:px-[0.85rem] file:py-[0.6rem] file:text-[0.8rem] file:font-medium file:text-[var(--admin-text)] file:transition hover:file:bg-[var(--admin-surface)]";

export const adminNavMetaClass =
  "ml-auto inline-flex min-w-[1.3rem] items-center justify-center rounded-full bg-[var(--admin-surface-3)] px-[0.42rem] py-[0.08rem] text-[0.64rem] font-medium tracking-[0.01em] text-[var(--admin-faint)]";

export const adminTableHeadClass =
  "text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-white/38";

export const adminTableActionClass =
  "inline-flex min-h-[2rem] items-center justify-center rounded-[0.55rem] border border-[var(--admin-border)] bg-[var(--admin-surface-3)] px-3 text-[0.8rem] font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-surface)]";

export const adminTableActionDangerClass =
  "inline-flex min-h-[2rem] items-center justify-center rounded-[0.55rem] border border-[rgba(255,106,106,0.16)] bg-[rgba(255,106,106,0.04)] px-3 text-[0.8rem] font-medium text-[#ff9b9b] transition hover:border-[rgba(255,106,106,0.26)] hover:bg-[rgba(255,106,106,0.08)] disabled:opacity-45";

const adminPillBaseClass =
  "inline-flex items-center rounded-full border border-white/8 bg-white/[0.04] px-[0.7rem] py-[0.3rem] text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]";

export function adminPillClass(
  tone: "neutral" | "strong" | "success" | "warning" | "danger",
) {
  const toneClass =
    tone === "strong"
      ? "border-[rgba(255,26,117,0.26)] bg-[rgba(255,26,117,0.18)] text-[#ff6aa7]"
      : tone === "success"
        ? "border-[rgba(48,207,67,0.26)] bg-[rgba(48,207,67,0.16)] text-[#76e284]"
        : tone === "warning"
          ? "border-[rgba(255,202,95,0.22)] bg-[rgba(255,202,95,0.16)] text-[#ffd87f]"
          : tone === "danger"
            ? "border-[rgba(255,106,106,0.24)] bg-[rgba(255,106,106,0.16)] text-[#ff8f8f]"
            : "";

  return `${adminPillBaseClass} ${toneClass}`.trim();
}

function pillToneClass(
  tone: "neutral" | "strong" | "success" | "warning" | "danger",
) {
  if (tone === "strong") {
    return adminPillClass("strong");
  }

  if (tone === "success") {
    return adminPillClass("success");
  }

  if (tone === "warning") {
    return adminPillClass("warning");
  }

  if (tone === "danger") {
    return adminPillClass("danger");
  }

  return adminPillClass("neutral");
}

export function StatusPill({
  published,
  labels = ["Draft", "Published"],
}: {
  published: boolean;
  labels?: [string, string];
}) {
  return (
    <span className={pillToneClass(published ? "success" : "strong")}>
      {published ? labels[1] : labels[0]}
    </span>
  );
}

export function SidebarSectionButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[0.65rem] px-3 py-2.5 text-left text-sm transition ${
        active
          ? "admin-nav-link admin-nav-link-active"
          : "admin-nav-link"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className={adminNavMetaClass}>{count}</span>
    </button>
  );
}

export function SidebarGroupButton({
  label,
  open,
  onClick,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[0.65rem] px-3 py-2 text-left text-sm text-white/52 transition hover:bg-white/[0.04] hover:text-white"
    >
      <span className="font-medium">{label}</span>
      <span className={`text-base transition-transform ${open ? "rotate-45" : "rotate-0"}`}>
        +
      </span>
    </button>
  );
}

export function TopFilter({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-1 py-1 text-sm font-medium transition ${
        active
          ? "text-white"
          : "text-white/44 hover:text-white/72"
      }`}
    >
      {label}
    </button>
  );
}

export function MessageStatusPill({ status }: { status: AdminMessageStatus }) {
  const label =
    status === "NEW" ? "New" : status === "READ" ? "Read" : "Archived";

  return (
    <span
      className={pillToneClass(
        status === "NEW"
          ? "success"
          : status === "READ"
            ? "strong"
            : "neutral",
      )}
    >
      {label}
    </span>
  );
}

export function OrderStatusPill({ status }: { status: AdminOrderStatus }) {
  const label =
    status === "PENDING"
      ? "Pending"
      : status === "COMPLETED"
        ? "Completed"
        : status === "FAILED"
          ? "Failed"
          : "Canceled";

  return (
    <span
      className={pillToneClass(
        status === "COMPLETED"
          ? "success"
          : status === "PENDING"
            ? "warning"
            : status === "FAILED"
              ? "danger"
              : "neutral",
      )}
    >
      {label}
    </span>
  );
}

export function ProductAvailabilityPill({
  availability,
}: {
  availability: AdminProductAvailability;
}) {
  const label =
    availability === "COMING_SOON"
      ? "Not available yet"
      : availability === "SOLD_OUT"
        ? "Sold out"
        : "Available";

  return (
    <span
      className={pillToneClass(
        availability === "AVAILABLE"
          ? "success"
          : availability === "COMING_SOON"
            ? "warning"
            : "danger",
      )}
    >
      {label}
    </span>
  );
}

export function RolePill({ role }: { role: AdminUserRole }) {
  return (
    <span
      className={pillToneClass(
        role === "OWNER" ? "strong" : role === "ADMIN" ? "warning" : "neutral",
      )}
    >
      {role}
    </span>
  );
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatFileSize(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

import {
  adminKickerClass,
  adminPanelMutedClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../components/ui";

type Feedback =
  | { tone: "success"; text: string }
  | { tone: "error"; text: string }
  | null;

export default function PasswordChangeConfirmForm({
  token,
}: {
  token: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setFeedback({
        tone: "error",
        text: "Missing confirmation token.",
      });
      return;
    }

    setFeedback(null);

    try {
      const response = await fetch("/api/auth/password-change/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to confirm password change.");
      }

      startTransition(() => {
        setConfirmed(true);
        setFeedback({
          tone: "success",
          text:
            payload.message ??
            "Password changed. Sign in again with the new password.",
        });
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to confirm password change.",
      });
    }
  }

  return (
    <div className={`${adminPanelMutedClass} p-6 md:p-8`}>
      <div className="border-b border-base-content/8 pb-6">
        <p className={adminKickerClass}>Account security</p>
        <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.2rem)] leading-[0.94] font-semibold tracking-[-0.045em]">
          Confirm password change
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <p className="text-sm leading-relaxed text-base-content/64">
          Confirm this change to replace your current admin password. All active
          sessions will be signed out.
        </p>

        {feedback ? (
          <div
            className={`rounded-[0.8rem] border px-4 py-4 text-sm leading-relaxed ${
              feedback.tone === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/20 bg-red-500/10 text-red-200"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending || confirmed || !token}
            className={adminPrimaryButtonClass}
          >
            {confirmed
              ? "Confirmed"
              : isPending
                ? "Confirming..."
                : "Confirm password change"}
          </button>

          <Link href="/admin/login" className={adminSecondaryButtonClass}>
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";

type AdminAuthFormProps = {
  adminHasPassword: boolean;
};

type Feedback =
  | { tone: "success"; text: string }
  | { tone: "error"; text: string }
  | null;

export default function AdminAuthForm({
  adminHasPassword,
}: AdminAuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const modeLabel = useMemo(
    () => (adminHasPassword ? "Sign in" : "Create owner account"),
    [adminHasPassword],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const endpoint = adminHasPassword ? "/api/auth/login" : "/api/auth/setup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Authentication failed.");
      }

      startTransition(() => {
        setFeedback({
          tone: "success",
          text: adminHasPassword ? "Signed in." : "Account created.",
        });
        router.replace("/admin");
        router.refresh();
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "Authentication failed.",
      });
    }
  }

  return (
    <div className="admin-panel-muted p-6 md:p-8">
      <div className="border-b border-base-content/8 pb-6">
        <p className="admin-kicker">
          {adminHasPassword ? "Authentication" : "Setup"}
        </p>
        <h2 className="mt-3 text-[clamp(2.3rem,5vw,3.6rem)] leading-[0.94] font-semibold tracking-[-0.045em]">
          {modeLabel}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {!adminHasPassword && (
          <label className="block">
            <span className="admin-kicker">
              Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Your name"
              className="admin-field mt-3"
            />
          </label>
        )}

        <label className="block">
          <span className="admin-kicker">
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="you@example.com"
            className="admin-field mt-3"
            required
          />
        </label>

        <label className="block">
          <span className="admin-kicker">
            Password
          </span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder={
              adminHasPassword ? "Your password" : "Create a strong password"
            }
            className="admin-field mt-3"
            minLength={adminHasPassword ? 8 : 12}
            maxLength={200}
            required
          />
        </label>

        {feedback && (
          <div
            className={`rounded-[0.8rem] border px-4 py-4 text-sm leading-relaxed ${
              feedback.tone === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/20 bg-red-500/10 text-red-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="submit"
            disabled={isPending}
            className="admin-button-primary px-6"
          >
            {isPending ? "Working..." : modeLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

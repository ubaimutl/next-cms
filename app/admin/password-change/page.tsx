import type { Metadata } from "next";
import Link from "next/link";

import {
  adminKickerClass,
  adminPanelMutedClass,
  adminPillClass,
} from "../components/ui";

import PasswordChangeConfirmForm from "./PasswordChangeConfirmForm";

export const metadata: Metadata = {
  title: "Confirm Password Change",
  description: "Confirm an admin password change request.",
  alternates: {
    canonical: "/admin/password-change",
  },
};

export default async function AdminPasswordChangePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const tokenParam = resolvedSearchParams.token;
  const token =
    typeof tokenParam === "string"
      ? tokenParam
      : Array.isArray(tokenParam)
        ? tokenParam[0] ?? null
        : null;

  return (
    <section className="next-cms-admin admin-shell [font-family:-apple-system,BlinkMacSystemFont,Segoe_UI,Roboto,Oxygen,Ubuntu,Droid_Sans,Helvetica_Neue,sans-serif]">
      <div className="shell max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="admin-panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_24rem]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-8">
                <div>
                  <p className={adminKickerClass}>Workspace access</p>
                  <h1 className="mt-3 text-[clamp(3rem,10vw,5.8rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-white">
                    Password confirmation
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/48">
                    Confirm the emailed link to finish updating your admin
                    password.
                  </p>
                </div>

                <Link href="/admin/login" className="admin-link self-start">
                  Back to login
                </Link>
              </div>

              <div className="mt-8">
                <PasswordChangeConfirmForm token={token} />
              </div>
            </div>

            <aside className="space-y-4">
              <div className={`${adminPanelMutedClass} p-6`}>
                <p className={adminKickerClass}>Status</p>
                <p className="mt-3 text-[1.7rem] leading-[1.05] font-semibold tracking-[-0.03em] text-white">
                  {token ? "Ready to confirm" : "Token missing"}
                </p>
              </div>

              <div className={`${adminPanelMutedClass} p-6`}>
                <p className={adminKickerClass}>What happens next</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={adminPillClass("neutral")}>Password updated</span>
                  <span className={adminPillClass("neutral")}>Sessions revoked</span>
                  <span className={adminPillClass("neutral")}>Sign in again</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

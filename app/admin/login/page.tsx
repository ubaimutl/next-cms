import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAuthenticatedAdmin,
  hasConfiguredAdminPassword,
} from "@/lib/auth";

import AdminAuthForm from "./AdminAuthForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin access.",
  alternates: {
    canonical: "/admin/login",
  },
};

export default async function AdminLoginPage() {
  const [authenticatedAdmin, adminHasPassword] = await Promise.all([
    getAuthenticatedAdmin(),
    hasConfiguredAdminPassword(),
  ]);

  if (authenticatedAdmin) {
    redirect("/admin");
  }

  return (
    <section className="ghost-admin admin-shell">
      <div className="shell max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="admin-panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_24rem]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-8">
                <div>
                  <p className="admin-kicker">Workspace access</p>
                  <h1 className="mt-3 text-[clamp(3rem,10vw,5.8rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-white">
                    Admin login
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/48">
                    Sign in to manage publishing, shop offers, messages, and
                    workspace settings.
                  </p>
                </div>

                <Link href="/" className="admin-link self-start">
                  Back to site
                </Link>
              </div>

              <div className="mt-8">
                <AdminAuthForm adminHasPassword={adminHasPassword} />
              </div>
            </div>

            <aside className="space-y-4">
              <div className="admin-panel-muted p-6">
                <p className="admin-kicker">Status</p>
                <p className="mt-3 text-[1.7rem] leading-[1.05] font-semibold tracking-[-0.03em] text-white">
                  {adminHasPassword ? "Ready to sign in" : "Owner setup required"}
                </p>
              </div>

              <div className="admin-panel-muted p-6">
                <p className="admin-kicker">What you can do</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="admin-pill">Posts</span>
                  <span className="admin-pill">Projects</span>
                  <span className="admin-pill">Shop</span>
                  <span className="admin-pill">Orders</span>
                  <span className="admin-pill">Messages</span>
                  <span className="admin-pill">Settings</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

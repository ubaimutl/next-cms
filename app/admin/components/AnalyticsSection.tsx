"use client";

import {
  adminKickerClass,
  adminPanelMutedClass,
  adminPillClass,
  adminPrimaryButtonClass,
} from "./ui";
import type { AdminAnalyticsOverview } from "./types";

type AnalyticsSectionProps = {
  analytics: AdminAnalyticsOverview;
  isUpdatingAnalytics: boolean;
  onToggleAnalytics: (nextEnabled: boolean) => void;
};

export default function AnalyticsSection({
  analytics,
  isUpdatingAnalytics,
  onToggleAnalytics,
}: AnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={`${adminPanelMutedClass} p-5`}>
          <p className={adminKickerClass}>
            Total page views
          </p>
          <p className="mt-4 text-[2.4rem] leading-none font-semibold">
            {analytics.totalPageViews}
          </p>
        </div>

        <div className={`${adminPanelMutedClass} p-5`}>
          <p className={adminKickerClass}>
            Visits
          </p>
          <p className="mt-4 text-[2.4rem] leading-none font-semibold">
            {analytics.totalVisits}
          </p>
        </div>

        <div className={`${adminPanelMutedClass} p-5`}>
          <p className={adminKickerClass}>
            Post views
          </p>
          <p className="mt-4 text-[2.4rem] leading-none font-semibold">
            {analytics.postPageViews}
          </p>
        </div>

        <div className={`${adminPanelMutedClass} p-5`}>
          <p className={adminKickerClass}>
            Last 7 days
          </p>
          <p className="mt-4 text-[2.4rem] leading-none font-semibold">
            {analytics.pageViewsLast7Days}
          </p>
          <p className="mt-2 text-sm text-base-content/52">
            {analytics.visitsLast7Days} visits
          </p>
        </div>
      </section>

      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={adminKickerClass}>
              Tracking
            </p>
            <h2 className="mt-3 text-[2rem] leading-none font-semibold">
              {analytics.enabled ? "Enabled" : "Disabled"}
            </h2>
            <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-base-content/62">
              Track public page views and visits across the site, including
              per-post traffic. Turning this off stops new events from being
              stored without clearing the existing analytics data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleAnalytics(!analytics.enabled)}
            disabled={isUpdatingAnalytics}
            className={adminPrimaryButtonClass}
          >
            {isUpdatingAnalytics
              ? "Saving"
              : analytics.enabled
                ? "Disable analytics"
                : "Enable analytics"}
          </button>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="admin-panel px-6 py-6">
          <div className="flex items-center justify-between gap-3 border-b border-base-content/8 pb-4">
            <h2 className="text-[1.5rem] leading-none font-semibold">Top pages</h2>
            <span className={adminPillClass("neutral")}>
              Views
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {analytics.topPages.length === 0 ? (
              <p className="text-sm text-base-content/56">
                No tracked pages yet
              </p>
            ) : (
              analytics.topPages.map((page) => (
                <div
                  key={page.path}
                  className="flex items-start justify-between gap-4 border-b border-base-content/8 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm text-base-content/68">
                    {page.path}
                  </p>
                  <p className="shrink-0 text-sm text-base-content/52">
                    {page.views}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-panel px-6 py-6">
          <div className="flex items-center justify-between gap-3 border-b border-base-content/8 pb-4">
            <h2 className="text-[1.5rem] leading-none font-semibold">Top posts</h2>
            <span className={adminPillClass("neutral")}>
              Views
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {analytics.topPosts.length === 0 ? (
              <p className="text-sm text-base-content/56">
                No tracked posts yet
              </p>
            ) : (
              analytics.topPosts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-start justify-between gap-4 border-b border-base-content/8 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[1rem] font-semibold">
                      {post.title}
                    </p>
                    <p className="mt-2 text-sm text-base-content/52">
                      /posts/{post.slug}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-base-content/52">
                    {post.views}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

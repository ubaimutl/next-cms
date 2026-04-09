"use client";

import { formatPrice } from "@/lib/shop-helpers";

import {
  adminKickerClass,
  adminPanelMutedClass,
  adminPillClass,
  formatDateTime,
} from "./ui";
import type {
  AdminAnalyticsOverview,
  AdminMessage,
  AdminOrder,
  AdminPost,
  AdminProduct,
  AdminProject,
} from "./types";

type DashboardSectionProps = {
  analytics: AdminAnalyticsOverview;
  posts: AdminPost[];
  projects: AdminProject[];
  products: AdminProduct[];
  orders: AdminOrder[];
  messages: AdminMessage[];
  onOpenPosts: () => void;
  onNewPost: () => void;
  onOpenMessages: () => void;
  onOpenOrders: () => void;
  onOpenShop: () => void;
  onOpenProjects: () => void;
};

function Icon({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const normalized = values.length > 0 ? values : [4, 7, 6, 9, 8, 10, 11];
  const max = Math.max(...normalized, 1);
  const points = normalized
    .map((value, index) => {
      const x = (index / Math.max(normalized.length - 1, 1)) * 100;
      const y = 50 - (value / max) * 36;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 50" className="h-28 w-full" preserveAspectRatio="none">
      <g stroke="rgba(255,255,255,0.08)">
        {[10, 25, 40].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} />
        ))}
      </g>
      <polyline
        fill="none"
        stroke="rgba(83,197,255,0.95)"
        strokeWidth="2.25"
        points={points}
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className={`${adminPanelMutedClass} p-5`}>
      <p className={adminKickerClass}>{label}</p>
      <p className="mt-4 text-[2rem] leading-none font-semibold tracking-[-0.04em]">
        {value}
      </p>
      <p className="mt-3 text-sm text-white/44">{detail}</p>
    </div>
  );
}

export default function DashboardSection({
  analytics,
  posts,
  projects,
  products,
  orders,
  messages,
  onOpenPosts,
  onNewPost,
  onOpenMessages,
  onOpenOrders,
  onOpenShop,
  onOpenProjects,
}: DashboardSectionProps) {
  const sparkValues = analytics.topPages
    .slice(0, 7)
    .map((entry) => entry.views)
    .reverse();
  const recentActivity = [
    ...messages.slice(0, 4).map((message) => ({
      id: `message-${message.id}`,
      title: message.name,
      detail: message.email,
      meta: "Inbox",
      timestamp: message.createdAt,
      icon: <Icon path="M4 6h16M4 12h16M4 18h10" />,
    })),
    ...orders.slice(0, 4).map((order) => ({
      id: `order-${order.id}`,
      title: order.productTitle,
      detail:
        order.buyerEmail ||
        formatPrice(order.amountCents, order.currency),
      meta: "Order",
      timestamp: order.createdAt,
      icon: <Icon path="M6 7h15l-1.5 8h-11zM6 7 4 4M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01" />,
    })),
  ]
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total page views"
          value={String(analytics.totalPageViews)}
          detail={`${analytics.pageViewsLast7Days} in the last 7 days`}
        />
        <MetricCard
          label="Visits"
          value={String(analytics.totalVisits)}
          detail={`${analytics.visitsLast7Days} recent sessions`}
        />
        <MetricCard
          label="Published posts"
          value={String(posts.filter((post) => post.published).length)}
          detail={`${posts.length} total posts in the workspace`}
        />
        <MetricCard
          label="Unread messages"
          value={String(messages.filter((message) => message.status === "NEW").length)}
          detail={`${orders.length} orders currently stored`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_20rem]">
        <section className="admin-panel px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-5">
            <div>
              <p className={adminKickerClass}>30 days</p>
              <h2 className="mt-2 text-[2rem] leading-none font-semibold tracking-[-0.04em]">
                Site performance
              </h2>
            </div>
            <span className={adminPillClass("neutral")}>Traffic overview</span>
          </div>

          <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className={adminKickerClass}>Views</p>
                  <p className="mt-2 text-[2.8rem] leading-none font-semibold tracking-[-0.05em]">
                    {analytics.totalPageViews}
                  </p>
                </div>
                <p className="text-sm text-white/42">
                  {analytics.totalVisits} visits across the public site
                </p>
              </div>
              <div className="mt-6 rounded-[0.9rem] border border-white/6 bg-black/10 px-4 py-3">
                <Sparkline values={sparkValues} />
              </div>
            </div>

            <div className="space-y-3">
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>Top pages</p>
                <p className="mt-3 text-[1.8rem] leading-none font-semibold tracking-[-0.04em]">
                  {analytics.topPages.length}
                </p>
              </div>
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>Products</p>
                <p className="mt-3 text-[1.8rem] leading-none font-semibold tracking-[-0.04em]">
                  {products.length}
                </p>
              </div>
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>Projects</p>
                <p className="mt-3 text-[1.8rem] leading-none font-semibold tracking-[-0.04em]">
                  {projects.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="admin-panel px-6 py-6">
          <p className={adminKickerClass}>Recent activity</p>
          <div className="mt-5 space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-white/46">No recent activity yet.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/62">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-white/92">
                        {item.title}
                      </p>
                      <span className="text-xs text-white/34">{item.meta}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-white/48">
                      {item.detail}
                    </p>
                    <p className="mt-2 text-xs text-white/30">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="admin-panel px-6 py-6 md:px-8">
          <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-5">
            <div>
              <p className={adminKickerClass}>Start creating content</p>
              <h2 className="mt-2 text-[1.8rem] leading-none font-semibold tracking-[-0.04em]">
                Quick actions
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={onNewPost}
              className={`${adminPanelMutedClass} flex items-start gap-4 p-5 text-left transition hover:bg-white/[0.06]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] bg-[#28cf43] text-black">
                <Icon path="M12 5v14M5 12h14" />
              </div>
              <div>
                <p className="text-[1rem] font-semibold text-white/94">Write a new post</p>
                <p className="mt-2 text-sm leading-relaxed text-white/46">
                  Open the editor and start drafting immediately.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenMessages}
              className={`${adminPanelMutedClass} flex items-start gap-4 p-5 text-left transition hover:bg-white/[0.06]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] bg-[#ff1a75] text-white">
                <Icon path="M4 7h16v10H4zM4 7l8 6 8-6" />
              </div>
              <div>
                <p className="text-[1rem] font-semibold text-white/94">Review inbox</p>
                <p className="mt-2 text-sm leading-relaxed text-white/46">
                  Open contact requests and follow up on new briefs.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenOrders}
              className={`${adminPanelMutedClass} flex items-start gap-4 p-5 text-left transition hover:bg-white/[0.06]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] bg-[#53c5ff] text-black">
                <Icon path="M6 7h15l-1.5 8h-11zM6 7 4 4M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01" />
              </div>
              <div>
                <p className="text-[1rem] font-semibold text-white/94">Check orders</p>
                <p className="mt-2 text-sm leading-relaxed text-white/46">
                  Review recent payments and buyer details.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className={`${adminPanelMutedClass} flex items-start gap-4 p-5 text-left transition hover:bg-white/[0.06]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] bg-white text-black">
                <Icon path="M5 8h14M7 8V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V8m-10 0v10h10V8" />
              </div>
              <div>
                <p className="text-[1rem] font-semibold text-white/94">Manage shop</p>
                <p className="mt-2 text-sm leading-relaxed text-white/46">
                  Update offers, pricing, and delivery details.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="admin-panel px-6 py-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-4">
              <h2 className="text-[1.35rem] leading-none font-semibold tracking-[-0.03em]">
                Top posts
              </h2>
              <button type="button" onClick={onOpenPosts} className="admin-link">
                Open posts
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {analytics.topPosts.length === 0 ? (
                <p className="text-sm text-white/46">No tracked posts yet.</p>
              ) : (
                analytics.topPosts.slice(0, 5).map((post) => (
                  <div key={post.slug} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/92">
                        {post.title}
                      </p>
                      <p className="mt-1 text-xs text-white/34">/posts/{post.slug}</p>
                    </div>
                    <span className={adminPillClass("neutral")}>{post.views} views</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="admin-panel px-6 py-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-4">
              <h2 className="text-[1.35rem] leading-none font-semibold tracking-[-0.03em]">
                Workspace
              </h2>
              <button type="button" onClick={onOpenProjects} className="admin-link">
                Open projects
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className={`${adminPanelMutedClass} flex items-center justify-between p-4`}>
                <div>
                  <p className={adminKickerClass}>Projects</p>
                  <p className="mt-2 text-[1.45rem] leading-none font-semibold tracking-[-0.03em]">
                    {projects.length}
                  </p>
                </div>
                <Icon path="M4 20 20 4M8 4h12v12" className="h-5 w-5 text-white/35" />
              </div>
              <div className={`${adminPanelMutedClass} flex items-center justify-between p-4`}>
                <div>
                  <p className={adminKickerClass}>Products</p>
                  <p className="mt-2 text-[1.45rem] leading-none font-semibold tracking-[-0.03em]">
                    {products.length}
                  </p>
                </div>
                <Icon path="M5 8h14M7 8V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V8m-10 0v10h10V8" className="h-5 w-5 text-white/35" />
              </div>
              <div className={`${adminPanelMutedClass} flex items-center justify-between p-4`}>
                <div>
                  <p className={adminKickerClass}>Drafts</p>
                  <p className="mt-2 text-[1.45rem] leading-none font-semibold tracking-[-0.03em]">
                    {posts.filter((post) => !post.published).length}
                  </p>
                </div>
                <Icon path="M4 20h16M5 16l4-4 3 3 7-7" className="h-5 w-5 text-white/35" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

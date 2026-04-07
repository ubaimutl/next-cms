"use client";

import { TopFilter } from "./ui";
import type {
  AdminSection,
  MessageFilter,
  OrderFilter,
  PostFilter,
} from "./types";

type AdminHeaderProps = {
  activeSection: AdminSection;
  pageTitle: string;
  filter: PostFilter;
  messageFilter: MessageFilter;
  orderFilter: OrderFilter;
  analyticsEnabled: boolean;
  canManageSettings: boolean;
  projectCount: number;
  productCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
  failedOrderCount: number;
  canceledOrderCount: number;
  showComposer: boolean;
  isEditingPost: boolean;
  isEditingProject: boolean;
  isEditingProduct: boolean;
  onSetFilter: (filter: PostFilter) => void;
  onSetMessageFilter: (filter: MessageFilter) => void;
  onSetOrderFilter: (filter: OrderFilter) => void;
  onComposerButtonClick: () => void;
};

export default function AdminHeader({
  activeSection,
  pageTitle,
  filter,
  messageFilter,
  orderFilter,
  analyticsEnabled,
  canManageSettings,
  projectCount,
  productCount,
  orderCount,
  pendingOrderCount,
  completedOrderCount,
  failedOrderCount,
  canceledOrderCount,
  showComposer,
  isEditingPost,
  isEditingProject,
  isEditingProduct,
  onSetFilter,
  onSetMessageFilter,
  onSetOrderFilter,
  onComposerButtonClick,
}: AdminHeaderProps) {
  const showComposerToggle =
    activeSection === "posts" ||
    activeSection === "projects" ||
    activeSection === "shop";
  const composerLabel =
    showComposer &&
    ((activeSection === "posts" && !isEditingPost) ||
      (activeSection === "projects" && !isEditingProject) ||
      (activeSection === "shop" && !isEditingProduct))
      ? "Close editor"
      : activeSection === "posts"
        ? "New post"
        : activeSection === "projects"
          ? "New project"
          : "New product";

  return (
    <header className="border-b border-white/6 pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[0.96] font-semibold tracking-[-0.045em] text-white">
            {pageTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-[0.96rem] leading-relaxed text-white/46">
            {activeSection === "dashboard"
              ? "A Ghost-inspired publishing workspace for content, sales, and site operations."
              : activeSection === "settings"
                ? canManageSettings
                  ? analyticsEnabled
                    ? "Manage modules, analytics, and admin access."
                    : "Tracking is disabled. Modules and access are still editable."
                  : "Settings are visible in read-only mode."
                : activeSection === "projects"
                  ? `${projectCount} projects currently stored in the workspace.`
                  : activeSection === "shop"
                    ? `${productCount} products currently stored in the workspace.`
                    : activeSection === "orders"
                      ? `Filter ${orderCount} stored orders by payment state.`
                      : activeSection === "messages"
                        ? "Review contact requests and update their inbox status."
                        : "Review posts, filter drafts, and open the editor."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
          {activeSection === "posts" ? (
            <>
              <TopFilter
                label="All posts"
                active={filter === "all"}
                onClick={() => onSetFilter("all")}
              />
              <TopFilter
                label="Published"
                active={filter === "published"}
                onClick={() => onSetFilter("published")}
              />
              <TopFilter
                label="Drafts"
                active={filter === "draft"}
                onClick={() => onSetFilter("draft")}
              />
            </>
          ) : activeSection === "messages" ? (
            <>
              <TopFilter
                label="All messages"
                active={messageFilter === "all"}
                onClick={() => onSetMessageFilter("all")}
              />
              <TopFilter
                label="New"
                active={messageFilter === "new"}
                onClick={() => onSetMessageFilter("new")}
              />
              <TopFilter
                label="Read"
                active={messageFilter === "read"}
                onClick={() => onSetMessageFilter("read")}
              />
              <TopFilter
                label="Archived"
                active={messageFilter === "archived"}
                onClick={() => onSetMessageFilter("archived")}
              />
            </>
          ) : activeSection === "orders" ? (
            <>
              <TopFilter
                label={`All ${orderCount}`}
                active={orderFilter === "all"}
                onClick={() => onSetOrderFilter("all")}
              />
              <TopFilter
                label={`Pending ${pendingOrderCount}`}
                active={orderFilter === "pending"}
                onClick={() => onSetOrderFilter("pending")}
              />
              <TopFilter
                label={`Completed ${completedOrderCount}`}
                active={orderFilter === "completed"}
                onClick={() => onSetOrderFilter("completed")}
              />
              <TopFilter
                label={`Failed ${failedOrderCount}`}
                active={orderFilter === "failed"}
                onClick={() => onSetOrderFilter("failed")}
              />
              <TopFilter
                label={`Canceled ${canceledOrderCount}`}
                active={orderFilter === "canceled"}
                onClick={() => onSetOrderFilter("canceled")}
              />
            </>
          ) : null}

          {showComposerToggle ? (
            <button
              type="button"
              onClick={onComposerButtonClick}
              className="admin-button-primary"
            >
              {composerLabel}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

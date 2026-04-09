"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import Logo from "@/app/components/layout/Logo";
import { siteConfig } from "@/lib/site";

import type {
  AdminAccount,
  AdminSection,
  MessageFilter,
  OrderFilter,
  PostFilter,
  ThemeMode,
} from "./types";
import { adminNavMetaClass } from "./ui";

type AdminSidebarProps = {
  admin: AdminAccount;
  theme: ThemeMode;
  isLoggingOut: boolean;
  activeSection: AdminSection;
  postCount: number;
  projectCount: number;
  productCount: number;
  mediaCount: number;
  orderCount: number;
  messageCount: number;
  userCount: number;
  filter: PostFilter;
  draftCount: number;
  publishedCount: number;
  orderFilter: OrderFilter;
  pendingOrderCount: number;
  completedOrderCount: number;
  failedOrderCount: number;
  canceledOrderCount: number;
  messageFilter: MessageFilter;
  newMessageCount: number;
  readMessageCount: number;
  archivedMessageCount: number;
  canManageSettings: boolean;
  onLogout: () => void;
  onToggleTheme: () => void;
  onSwitchSection: (section: AdminSection) => void;
  onSetFilter: (filter: PostFilter) => void;
  onSetOrderFilter: (filter: OrderFilter) => void;
  onSetMessageFilter: (filter: MessageFilter) => void;
};

type SidebarGroup = "content" | "sales" | "admin";

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

function NavItem({
  label,
  icon,
  active,
  meta,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  meta?: string | number | null;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-nav-link min-w-0 ${active ? "admin-nav-link-active" : ""}`}
    >
      <span className="text-white/58">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
      {meta !== undefined && meta !== null ? (
        <span className={adminNavMetaClass}>{meta}</span>
      ) : null}
    </button>
  );
}

function SubItem({
  label,
  meta,
  active,
  onClick,
}: {
  label: string;
  meta: string | number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-nav-link min-w-0 py-2 pr-3 pl-11 text-[0.84rem] ${active ? "admin-nav-link-active" : ""
        }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className={adminNavMetaClass}>{meta}</span>
    </button>
  );
}

function GroupHeader({
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
      className="flex w-full items-center justify-between px-3 py-2 text-left text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--admin-faint)] uppercase"
    >
      <span>{label}</span>
      <span className={`transition-transform ${open ? "rotate-90" : "rotate-0"}`}>
        <Icon path="m9 6 6 6-6 6" className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export default function AdminSidebar({
  admin,
  theme,
  isLoggingOut,
  activeSection,
  postCount,
  projectCount,
  productCount,
  mediaCount,
  orderCount,
  messageCount,
  userCount,
  filter,
  draftCount,
  publishedCount,
  orderFilter,
  pendingOrderCount,
  completedOrderCount,
  failedOrderCount,
  canceledOrderCount,
  messageFilter,
  newMessageCount,
  readMessageCount,
  archivedMessageCount,
  canManageSettings,
  onLogout,
  onToggleTheme,
  onSwitchSection,
  onSetFilter,
  onSetOrderFilter,
  onSetMessageFilter,
}: AdminSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<SidebarGroup, boolean>>({
    content: true,
    sales: true,
    admin: false,
  });

  function toggleGroup(group: SidebarGroup) {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  }

  return (
    <aside className="overflow-hidden xl:sticky xl:top-0 xl:h-screen xl:self-start">
      <div className="flex h-full min-w-0 flex-col overflow-hidden border-b border-white/6 bg-[#111315] px-4 py-5 xl:border-r xl:border-b-0">
        <div className="flex items-center justify-between gap-3 px-2">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/14 bg-white/[0.02] text-white/88">
              <Logo className="h-4.5 w-4.5" />
            </span>
            <span className="truncate text-sm font-semibold text-white/92">
              {siteConfig.shortName}
            </span>
          </Link>

          <button
            type="button"
            onClick={onToggleTheme}
            className="admin-icon-button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Icon path="M12 3v2.5M12 18.5V21M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M3 12h2.5M18.5 12H21M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77M12 16.25A4.25 4.25 0 1 1 12 7.75a4.25 4.25 0 0 1 0 8.5Z" />
            ) : (
              <Icon path="M20.354 15.354A9 9 0 0 1 8.646 3.646a9 9 0 1 0 11.708 11.708Z" />
            )}
          </button>
        </div>

        <div className="mt-8 space-y-1">
          <NavItem
            label="Dashboard"
            icon={<Icon path="M4 12.5 12 5l8 7.5M6.5 10.5V20h11v-9.5" />}
            active={activeSection === "dashboard"}
            onClick={() => onSwitchSection("dashboard")}
          />

          <Link href="/" className="admin-nav-link">
            <span className="text-white/58">
              <Icon path="M12 3v18M3 12h18" />
            </span>
            <span>View site</span>
          </Link>
        </div>

        <nav className="mt-8 flex-1 space-y-5 overflow-y-auto overflow-x-hidden pr-1">
          <div className="space-y-1">
            <GroupHeader
              label="Content"
              open={openGroups.content}
              onClick={() => toggleGroup("content")}
            />
            {openGroups.content ? (
              <div className="space-y-1">
                <NavItem
                  label="Posts"
                  icon={<Icon path="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />}
                  active={activeSection === "posts"}
                  meta={postCount}
                  onClick={() => onSwitchSection("posts")}
                />
                {activeSection === "posts" ? (
                  <div className="space-y-1">
                    <SubItem
                      label="All posts"
                      meta={postCount}
                      active={filter === "all"}
                      onClick={() => onSetFilter("all")}
                    />
                    <SubItem
                      label="Drafts"
                      meta={draftCount}
                      active={filter === "draft"}
                      onClick={() => onSetFilter("draft")}
                    />
                    <SubItem
                      label="Published"
                      meta={publishedCount}
                      active={filter === "published"}
                      onClick={() => onSetFilter("published")}
                    />
                  </div>
                ) : null}

                <NavItem
                  label="Projects"
                  icon={<Icon path="M4 7h16M4 12h16M4 17h10" />}
                  active={activeSection === "projects"}
                  meta={projectCount}
                  onClick={() => onSwitchSection("projects")}
                />

                <NavItem
                  label="Shop"
                  icon={<Icon path="M5 8h14M7 8V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V8m-10 0v10h10V8" />}
                  active={activeSection === "shop"}
                  meta={productCount}
                  onClick={() => onSwitchSection("shop")}
                />

                <NavItem
                  label="Media"
                  icon={<Icon path="M4.5 6.5h15v11h-15zM8 11l2.2-2.2a1 1 0 0 1 1.4 0l1.8 1.8 1.1-1.1a1 1 0 0 1 1.4 0L19 13M9 10.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />}
                  active={activeSection === "media"}
                  meta={mediaCount}
                  onClick={() => onSwitchSection("media")}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <GroupHeader
              label="Inbox"
              open={openGroups.sales}
              onClick={() => toggleGroup("sales")}
            />
            {openGroups.sales ? (
              <div className="space-y-1">
                <NavItem
                  label="Messages"
                  icon={<Icon path="M4 7h16v10H4zM4 7l8 6 8-6" />}
                  active={activeSection === "messages"}
                  meta={messageCount}
                  onClick={() => onSwitchSection("messages")}
                />
                {activeSection === "messages" ? (
                  <div className="space-y-1">
                    <SubItem
                      label="All"
                      meta={messageCount}
                      active={messageFilter === "all"}
                      onClick={() => onSetMessageFilter("all")}
                    />
                    <SubItem
                      label="New"
                      meta={newMessageCount}
                      active={messageFilter === "new"}
                      onClick={() => onSetMessageFilter("new")}
                    />
                    <SubItem
                      label="Read"
                      meta={readMessageCount}
                      active={messageFilter === "read"}
                      onClick={() => onSetMessageFilter("read")}
                    />
                    <SubItem
                      label="Archived"
                      meta={archivedMessageCount}
                      active={messageFilter === "archived"}
                      onClick={() => onSetMessageFilter("archived")}
                    />
                  </div>
                ) : null}

                <NavItem
                  label="Orders"
                  icon={<Icon path="M6 7h15l-1.5 8h-11zM6 7 4 4M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01" />}
                  active={activeSection === "orders"}
                  meta={orderCount}
                  onClick={() => onSwitchSection("orders")}
                />
                {activeSection === "orders" ? (
                  <div className="space-y-1">
                    <SubItem
                      label="All"
                      meta={orderCount}
                      active={orderFilter === "all"}
                      onClick={() => onSetOrderFilter("all")}
                    />
                    <SubItem
                      label="Pending"
                      meta={pendingOrderCount}
                      active={orderFilter === "pending"}
                      onClick={() => onSetOrderFilter("pending")}
                    />
                    <SubItem
                      label="Completed"
                      meta={completedOrderCount}
                      active={orderFilter === "completed"}
                      onClick={() => onSetOrderFilter("completed")}
                    />
                    <SubItem
                      label="Failed"
                      meta={failedOrderCount}
                      active={orderFilter === "failed"}
                      onClick={() => onSetOrderFilter("failed")}
                    />
                    <SubItem
                      label="Canceled"
                      meta={canceledOrderCount}
                      active={orderFilter === "canceled"}
                      onClick={() => onSetOrderFilter("canceled")}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <GroupHeader
              label="Admin"
              open={openGroups.admin}
              onClick={() => toggleGroup("admin")}
            />
            {openGroups.admin ? (
              <div className="space-y-1">
                <NavItem
                  label="Settings"
                  icon={<Icon path="M12 3v3M12 18v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M3 12h3M18 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />}
                  active={activeSection === "settings"}
                  meta={canManageSettings ? userCount : null}
                  onClick={() => onSwitchSection("settings")}
                />
              </div>
            ) : null}
          </div>
        </nav>

        <div className="mt-6 border-t border-white/6 px-2 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/92">
                {admin.email}
              </p>
              <p className="mt-1 text-xs text-white/38">{admin.role}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="admin-icon-button"
              aria-label="Log out"
            >
              <Icon path="M15 17l5-5-5-5M20 12H9M9 20H5V4h4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

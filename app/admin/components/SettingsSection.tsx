"use client";

import {
  RolePill,
  adminDangerButtonClass,
  adminInputClass,
  adminKickerClass,
  adminPanelMutedClass,
  adminPillClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "./ui";
import type {
  AdminAnalyticsOverview,
  AdminAppSettings,
  AdminUser,
  AdminUserFormState,
  AdminUserRole,
} from "./types";

type SettingsSectionProps = {
  settings: AdminAppSettings;
  analytics: AdminAnalyticsOverview;
  adminUsers: AdminUser[];
  currentAdmin: {
    id: number;
    role: AdminUserRole;
  };
  canManageSettings: boolean;
  canManageUsers: boolean;
  isSavingSettings: boolean;
  isUpdatingAnalytics: boolean;
  isSubmittingUser: boolean;
  isUpdatingUserId: number | null;
  isDeletingUserId: number | null;
  userForm: AdminUserFormState;
  onToggleModule: (
    module: keyof Pick<
      AdminAppSettings,
      "blogEnabled" | "projectsEnabled" | "shopEnabled"
    >,
    nextValue: boolean,
  ) => void;
  onToggleAnalytics: (nextEnabled: boolean) => void;
  onUserFormChange: (
    field: keyof AdminUserFormState,
    value: string | boolean,
  ) => void;
  onCreateUser: () => void;
  onUpdateUserRole: (user: AdminUser, role: AdminUserRole) => void;
  onToggleUserActive: (user: AdminUser, nextActive: boolean) => void;
  onDeleteUser: (user: AdminUser) => void;
};

function SettingsToggle({
  label,
  description,
  enabled,
  disabled,
  onClick,
}: {
  label: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${adminPanelMutedClass} flex w-full items-start justify-between gap-5 p-5 text-left transition hover:border-base-content/14 disabled:cursor-not-allowed disabled:opacity-55`}
    >
      <div className="min-w-0">
        <p className={adminKickerClass}>{label}</p>
        <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-base-content/62">
          {description}
        </p>
      </div>

      <span className={`shrink-0 ${adminPillClass(enabled ? "strong" : "neutral")}`}>
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </button>
  );
}

export default function SettingsSection({
  settings,
  analytics,
  adminUsers,
  currentAdmin,
  canManageSettings,
  canManageUsers,
  isSavingSettings,
  isUpdatingAnalytics,
  isSubmittingUser,
  isUpdatingUserId,
  isDeletingUserId,
  userForm,
  onToggleModule,
  onToggleAnalytics,
  onUserFormChange,
  onCreateUser,
  onUpdateUserRole,
  onToggleUserActive,
  onDeleteUser,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <section className="admin-panel px-6 py-6 md:px-8">
        <div className="border-b border-base-content/8 pb-5">
          <p className={adminKickerClass}>Modules</p>
          <h2 className="mt-2 text-[1.9rem] leading-none font-semibold tracking-[-0.03em]">
            Public sections
          </h2>
          <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-base-content/62">
            Turn blog, projects, and shop on or off without removing the
            underlying content.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <SettingsToggle
            label="Blog"
            description="Enable the public posts archive and post detail pages."
            enabled={settings.blogEnabled}
            disabled={!canManageSettings || isSavingSettings}
            onClick={() => onToggleModule("blogEnabled", !settings.blogEnabled)}
          />
          <SettingsToggle
            label="Projects"
            description="Enable public work pages and project-led homepage sections."
            enabled={settings.projectsEnabled}
            disabled={!canManageSettings || isSavingSettings}
            onClick={() =>
              onToggleModule("projectsEnabled", !settings.projectsEnabled)
            }
          />
          <SettingsToggle
            label="Shop"
            description="Enable the storefront, product detail pages, and purchase flow."
            enabled={settings.shopEnabled}
            disabled={!canManageSettings || isSavingSettings}
            onClick={() => onToggleModule("shopEnabled", !settings.shopEnabled)}
          />
        </div>
      </section>

      <section className="admin-panel px-6 py-6 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={adminKickerClass}>Analytics</p>
            <h2 className="mt-2 text-[1.9rem] leading-none font-semibold tracking-[-0.03em]">
              {analytics.enabled ? "Tracking enabled" : "Tracking disabled"}
            </h2>
            <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-base-content/62">
              Track public page views and visits independently from the content
              modules above.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleAnalytics(!analytics.enabled)}
            disabled={!canManageSettings || isUpdatingAnalytics}
            className={`${adminPrimaryButtonClass} self-start px-5`}
          >
            {isUpdatingAnalytics
              ? "Saving"
              : analytics.enabled
                ? "Disable analytics"
                : "Enable analytics"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,24rem)]">
        <div className="admin-panel px-6 py-6 md:px-8">
          <div className="flex items-center justify-between gap-4 border-b border-base-content/8 pb-5">
            <div>
              <p className={adminKickerClass}>Admin users</p>
              <h2 className="mt-2 text-[1.8rem] leading-none font-semibold tracking-[-0.03em]">
                Roles and access
              </h2>
            </div>
            <span className={adminPillClass("neutral")}>{adminUsers.length} users</span>
          </div>

          <div className="mt-5 space-y-4">
            {adminUsers.map((user) => (
              <div key={user.id} className={`${adminPanelMutedClass} p-5`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[1.05rem] font-semibold">
                        {user.name?.trim() || user.email}
                      </p>
                      <RolePill role={user.role} />
                      <span className={adminPillClass("neutral")}>
                        {user.active ? "Active" : "Disabled"}
                      </span>
                      {currentAdmin.id === user.id ? (
                        <span className={adminPillClass("neutral")}>Current session</span>
                      ) : null}
                    </div>

                    <p className="mt-3 break-all text-sm text-base-content/56">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["OWNER", "ADMIN", "EDITOR"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => onUpdateUserRole(user, role)}
                        disabled={
                          !canManageUsers ||
                          isUpdatingUserId === user.id ||
                          user.role === role
                        }
                        className={
                          user.role === role
                            ? `${adminPrimaryButtonClass} min-h-10 px-4`
                            : `${adminSecondaryButtonClass} min-h-10 px-4`
                        }
                      >
                        {role}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => onToggleUserActive(user, !user.active)}
                      disabled={!canManageUsers || isUpdatingUserId === user.id}
                      className={`${adminSecondaryButtonClass} min-h-10 px-4`}
                    >
                      {user.active ? "Disable" : "Enable"}
                    </button>

                    {currentAdmin.id !== user.id ? (
                      <button
                        type="button"
                      onClick={() => onDeleteUser(user)}
                      disabled={!canManageUsers || isDeletingUserId === user.id}
                      className={`${adminDangerButtonClass} min-h-10 px-4`}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel px-6 py-6 md:px-8">
          <p className={adminKickerClass}>Add admin user</p>
          <h2 className="mt-2 text-[1.8rem] leading-none font-semibold tracking-[-0.03em]">
            New account
          </h2>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className={adminKickerClass}>Name</span>
              <input
                type="text"
                value={userForm.name}
                onChange={(event) => onUserFormChange("name", event.target.value)}
                className={`${adminInputClass} mt-3`}
                placeholder="Team member name"
                disabled={!canManageUsers || isSubmittingUser}
              />
            </label>

            <label className="block">
              <span className={adminKickerClass}>Email</span>
              <input
                type="email"
                value={userForm.email}
                onChange={(event) => onUserFormChange("email", event.target.value)}
                className={`${adminInputClass} mt-3`}
                placeholder="editor@example.com"
                disabled={!canManageUsers || isSubmittingUser}
              />
            </label>

            <label className="block">
              <span className={adminKickerClass}>Password</span>
              <input
                type="password"
                value={userForm.password}
                onChange={(event) =>
                  onUserFormChange("password", event.target.value)
                }
                className={`${adminInputClass} mt-3`}
                placeholder="At least 12 characters"
                disabled={!canManageUsers || isSubmittingUser}
              />
            </label>

            <div>
              <p className={adminKickerClass}>Role</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["OWNER", "ADMIN", "EDITOR"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onUserFormChange("role", role)}
                    disabled={!canManageUsers || isSubmittingUser}
                    className={
                      userForm.role === role
                        ? `${adminPrimaryButtonClass} min-h-10 px-4`
                        : `${adminSecondaryButtonClass} min-h-10 px-4`
                    }
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-base-content/68">
              <input
                type="checkbox"
                checked={userForm.active}
                onChange={(event) =>
                  onUserFormChange("active", event.target.checked)
                }
                disabled={!canManageUsers || isSubmittingUser}
                className="h-4 w-4 rounded border-base-content/20"
              />
              <span>Account active</span>
            </label>

            <button
              type="button"
              onClick={onCreateUser}
              disabled={!canManageUsers || isSubmittingUser}
              className={`${adminPrimaryButtonClass} w-full`}
            >
              {isSubmittingUser ? "Creating" : "Create admin user"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

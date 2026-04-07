"use client";

import { MessageStatusPill, formatDateTime } from "./ui";
import type { AdminMessage, AdminMessageStatus } from "./types";

type MessagesSectionProps = {
  messages: AdminMessage[];
  selectedMessage: AdminMessage | null;
  isUpdatingMessage: boolean;
  isDeletingMessageId: number | null;
  onOpenMessage: (message: AdminMessage) => void;
  onUpdateMessageStatus: (
    messageId: number,
    status: AdminMessageStatus,
  ) => void;
  onDeleteMessage: (message: AdminMessage) => void;
};

export default function MessagesSection({
  messages,
  selectedMessage,
  isUpdatingMessage,
  isDeletingMessageId,
  onOpenMessage,
  onUpdateMessageStatus,
  onDeleteMessage,
}: MessagesSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)]">
      <section className="admin-panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/6 px-6 py-5 md:px-8">
          <div>
            <p className="admin-kicker">Messages</p>
            <h2 className="mt-2 text-[1.8rem] leading-none font-semibold tracking-[-0.03em]">
              Contact inbox
            </h2>
          </div>
          <p className="text-sm text-white/42">
            Open a thread to review the brief and update its state.
          </p>
        </div>

        <div>
          {messages.length === 0 ? (
            <div className="px-6 py-8 text-sm text-white/46 md:px-8">
              No messages yet.
            </div>
          ) : (
            messages.map((message) => (
              <button
                type="button"
                key={message.id}
                onClick={() => onOpenMessage(message)}
                className={`grid w-full gap-4 border-b border-white/6 px-6 py-5 text-left transition last:border-b-0 md:px-8 ${
                  selectedMessage?.id === message.id
                    ? "bg-white/[0.05]"
                    : "hover:bg-white/[0.025]"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[1rem] font-semibold text-white/94">
                        {message.name}
                      </h3>
                      {message.services[0] ? (
                        <span className="admin-pill">{message.services[0]}</span>
                      ) : null}
                    </div>
                    <p className="mt-2 truncate text-[0.92rem] text-white/42">
                      {message.email}
                    </p>
                    <p className="mt-3 line-clamp-2 text-[0.95rem] leading-relaxed text-white/46">
                      {message.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 text-left lg:items-end">
                    <MessageStatusPill status={message.status} />
                    <span className="text-xs text-white/34">
                      {formatDateTime(message.createdAt)}
                    </span>
                    <span className="text-xs text-white/28">
                      {message.emailSentAt
                        ? "Mail sent"
                        : message.emailError
                          ? "Mail issue"
                          : "Saved"}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <aside className="admin-panel px-6 py-6 md:px-8">
        {selectedMessage ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-5">
              <div>
                <p className="admin-kicker">Selected message</p>
                <h2 className="mt-2 text-[1.9rem] leading-[1] font-semibold tracking-[-0.03em]">
                  {selectedMessage.name}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <MessageStatusPill status={selectedMessage.status} />
                <span className="admin-pill">
                  {formatDateTime(selectedMessage.createdAt)}
                </span>
              </div>
            </div>

            <div>
              <a
                href={`mailto:${selectedMessage.email}`}
                className="text-[0.98rem] text-white/68 transition hover:text-white"
              >
                {selectedMessage.email}
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="admin-panel-muted p-4">
                <p className="admin-kicker">Company</p>
                <p className="mt-2 text-[0.98rem] text-white/86">
                  {selectedMessage.company || "Not provided"}
                </p>
              </div>
              <div className="admin-panel-muted p-4">
                <p className="admin-kicker">Website</p>
                {selectedMessage.website ? (
                  <a
                    href={selectedMessage.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-[0.98rem] text-white/68 transition hover:text-white"
                  >
                    {selectedMessage.website}
                  </a>
                ) : (
                  <p className="mt-2 text-[0.98rem] text-white/86">Not provided</p>
                )}
              </div>
              <div className="admin-panel-muted p-4">
                <p className="admin-kicker">Budget</p>
                <p className="mt-2 text-[0.98rem] text-white/86">
                  {selectedMessage.budget || "Not specified"}
                </p>
              </div>
              <div className="admin-panel-muted p-4">
                <p className="admin-kicker">Timeline</p>
                <p className="mt-2 text-[0.98rem] text-white/86">
                  {selectedMessage.timeline || "Not specified"}
                </p>
              </div>
            </div>

            <div>
              <p className="admin-kicker">Services</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMessage.services.map((service) => (
                  <span key={service} className="admin-pill">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="admin-kicker">Message</p>
              <p className="mt-3 whitespace-pre-wrap text-[1rem] leading-relaxed text-white/72">
                {selectedMessage.message}
              </p>
            </div>

            <div className="space-y-2 border-t border-white/6 pt-5">
              <p className="admin-kicker">Delivery</p>
              <p className="text-[0.98rem] text-white/68">
                {selectedMessage.emailSentAt
                  ? `Mail sent ${formatDateTime(selectedMessage.emailSentAt)}`
                  : selectedMessage.emailError
                    ? "Mail delivery failed"
                    : "Saved only"}
              </p>
              {selectedMessage.emailError ? (
                <p className="text-[0.92rem] leading-relaxed text-[#ffb2b2]">
                  {selectedMessage.emailError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/6 pt-5">
              <a
                href={`mailto:${selectedMessage.email}`}
                className="admin-button-secondary"
              >
                Reply
              </a>

              {selectedMessage.status === "NEW" ? (
                <button
                  type="button"
                  onClick={() => onUpdateMessageStatus(selectedMessage.id, "READ")}
                  disabled={isUpdatingMessage}
                  className="admin-button-secondary"
                >
                  Mark read
                </button>
              ) : null}

              {selectedMessage.status !== "ARCHIVED" ? (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateMessageStatus(selectedMessage.id, "ARCHIVED")
                  }
                  disabled={isUpdatingMessage}
                  className="admin-button-primary"
                >
                  Archive
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdateMessageStatus(selectedMessage.id, "READ")}
                  disabled={isUpdatingMessage}
                  className="admin-button-primary"
                >
                  Restore
                </button>
              )}

              <button
                type="button"
                onClick={() => onDeleteMessage(selectedMessage)}
                disabled={isDeletingMessageId === selectedMessage.id}
                className="admin-button-danger"
              >
                {isDeletingMessageId === selectedMessage.id ? "Deleting" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-panel-muted px-5 py-6 text-sm text-white/46">
            Select a message.
          </div>
        )}
      </aside>
    </div>
  );
}

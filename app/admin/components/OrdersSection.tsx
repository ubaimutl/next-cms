"use client";

import Link from "next/link";

import { formatPrice } from "@/lib/shop-helpers";

import {
  OrderStatusPill,
  adminKickerClass,
  adminPanelMutedClass,
  adminPillClass,
  formatDateTime,
} from "./ui";
import type { AdminOrder } from "./types";

type OrdersSectionProps = {
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  onOpenOrder: (order: AdminOrder) => void;
};

export default function OrdersSection({
  orders,
  selectedOrder,
  onOpenOrder,
}: OrdersSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)]">
      <section className="admin-panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/6 px-6 py-5 md:px-8">
          <div>
            <p className={adminKickerClass}>Orders</p>
            <h2 className="mt-2 text-[1.8rem] leading-none font-semibold tracking-[-0.03em]">
              Payment activity
            </h2>
          </div>
          <p className="text-sm text-white/42">
            Select an order to inspect buyer and payment details.
          </p>
        </div>

        <div>
          {orders.length === 0 ? (
            <div className="px-6 py-8 text-sm text-white/46 md:px-8">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <button
                type="button"
                key={order.id}
                onClick={() => onOpenOrder(order)}
                className={`grid w-full gap-4 border-b border-white/6 px-6 py-5 text-left transition last:border-b-0 md:px-8 ${
                  selectedOrder?.id === order.id
                    ? "bg-white/[0.05]"
                    : "hover:bg-white/[0.025]"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-[1rem] font-semibold text-white/94">
                      {order.productTitle}
                    </h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-white/52">
                      {formatPrice(order.amountCents, order.currency)}
                    </p>
                    <p className="mt-3 truncate text-[0.92rem] text-white/38">
                      {order.buyerEmail || "Buyer email not provided"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                    <OrderStatusPill status={order.status} />
                    <span className="text-xs text-white/34">
                      {formatDateTime(order.createdAt)}
                    </span>
                    <span className="text-xs text-white/28">#{order.id}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <aside className="admin-panel px-6 py-6 md:px-8">
        {selectedOrder ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-5">
              <div>
                <p className={adminKickerClass}>Selected order</p>
                <h2 className="mt-2 text-[1.9rem] leading-[1] font-semibold tracking-[-0.03em]">
                  {selectedOrder.productTitle}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <OrderStatusPill status={selectedOrder.status} />
                <span className={adminPillClass("neutral")}>
                  {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[1rem] text-white/66">
                {formatPrice(selectedOrder.amountCents, selectedOrder.currency)}
              </p>
              {selectedOrder.productSlug ? (
                <Link
                  href={`/shop/${selectedOrder.productSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-link mt-4"
                >
                  Preview product
                </Link>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>Buyer</p>
                <p className="mt-2 text-[0.98rem] text-white/86">
                  {selectedOrder.buyerName || "Not provided"}
                </p>
              </div>
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>Buyer email</p>
                <p className="mt-2 break-all text-[0.98rem] text-white/86">
                  {selectedOrder.buyerEmail || "Not provided"}
                </p>
              </div>
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>PayPal order</p>
                <p className="mt-2 break-all text-[0.98rem] text-white/86">
                  {selectedOrder.paypalOrderId}
                </p>
              </div>
              <div className={`${adminPanelMutedClass} p-4`}>
                <p className={adminKickerClass}>Capture</p>
                <p className="mt-2 break-all text-[0.98rem] text-white/86">
                  {selectedOrder.paypalCaptureId || "Pending"}
                </p>
              </div>
            </div>

            {selectedOrder.buyerBrief ? (
              <div className="border-t border-white/6 pt-5">
                <p className={adminKickerClass}>Buyer brief</p>
                <p className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-relaxed text-white/72">
                  {selectedOrder.buyerBrief}
                </p>
              </div>
            ) : null}

            <div className="border-t border-white/6 pt-5">
              <p className={adminKickerClass}>Updated</p>
              <p className="mt-2 text-[0.98rem] text-white/68">
                {formatDateTime(selectedOrder.updatedAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className={`${adminPanelMutedClass} px-5 py-6 text-sm text-white/46`}>
            Select an order.
          </div>
        )}
      </aside>
    </div>
  );
}

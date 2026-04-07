"use client";

import { useEffect, useRef, useState } from "react";

import { SHOP_BRIEF_MIN_LENGTH } from "@/lib/shop-helpers";

type PayPalCheckoutProps = {
  clientId: string | null;
  currency: string;
  productId: number;
  available: boolean;
  unavailableMessage?: string | null;
  requiresBrief?: boolean;
  briefPrompt?: string | null;
};

type CreateOrderResponse = {
  id?: string;
  error?: string;
};

type CaptureOrderResponse = {
  status?: string;
  buyerName?: string | null;
  error?: string;
};

type PayPalButtonActions = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, string>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (error: unknown) => void;
      }) => PayPalButtonActions;
    };
  }
}

async function loadPayPalSdk(clientId: string, currency: string) {
  const existingScript = document.getElementById(
    "paypal-js-sdk",
  ) as HTMLScriptElement | null;

  if (window.paypal && existingScript?.dataset.currency === currency) {
    return;
  }

  if (existingScript) {
    existingScript.remove();
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "paypal-js-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
    script.dataset.currency = currency;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal."));
    document.body.appendChild(script);
  });
}

export default function PayPalCheckout({
  clientId,
  currency,
  productId,
  available,
  unavailableMessage,
  requiresBrief = false,
  briefPrompt,
}: PayPalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const briefRef = useRef("");
  const [message, setMessage] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "success" | "error"
  >("idle");
  const trimmedBrief = brief.trim();
  const canSubmitBrief =
    !requiresBrief || trimmedBrief.length >= SHOP_BRIEF_MIN_LENGTH;

  useEffect(() => {
    briefRef.current = trimmedBrief;
  }, [trimmedBrief]);

  useEffect(() => {
    let cancelled = false;
    let buttons: PayPalButtonActions | null = null;

    async function initialize() {
      if (!available) {
        setStatus("idle");
        setMessage(unavailableMessage || "This product is not available right now.");
        return;
      }

      if (requiresBrief && !canSubmitBrief) {
        setStatus("idle");
        setMessage(null);
        if (containerRef.current) {
          containerRef.current.replaceChildren();
        }
        return;
      }

      if (!clientId) {
        setStatus("error");
        setMessage("PayPal checkout will appear once the account is configured.");
        return;
      }

      if (!containerRef.current) {
        return;
      }

      setStatus("loading");
      setMessage(null);

      try {
        await loadPayPalSdk(clientId, currency);

        if (cancelled || !containerRef.current || !window.paypal) {
          return;
        }

        containerRef.current.replaceChildren();
        buttons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            shape: "rect",
            label: "paypal",
          },
          createOrder: async () => {
            const response = await fetch("/api/shop/paypal/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId,
                buyerBrief: requiresBrief ? briefRef.current : undefined,
              }),
            });
            const payload = (await response.json()) as CreateOrderResponse;

            if (!response.ok || !payload.id) {
              throw new Error(payload.error || "Failed to create the order.");
            }

            return payload.id;
          },
          onApprove: async (data) => {
            const response = await fetch("/api/shop/paypal/capture-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderID,
              }),
            });
            const payload = (await response.json()) as CaptureOrderResponse;

            if (!response.ok || payload.status !== "COMPLETED") {
              throw new Error(
                payload.error || "Payment was not completed successfully.",
              );
            }

            if (cancelled) {
              return;
            }

            setStatus("success");
            setMessage(
              payload.buyerName
                ? `Payment received. Thanks, ${payload.buyerName}.`
                : "Payment received. I’ll follow up by email.",
            );
          },
          onError: (error) => {
            console.error("PayPal button error:", error);
            if (cancelled) {
              return;
            }

            setStatus("error");
            setMessage("PayPal could not complete the checkout.");
          },
        });

        await buttons.render(containerRef.current);

        if (!cancelled) {
          setStatus("ready");
        }
      } catch (error) {
        console.error("Error loading PayPal checkout:", error);

        if (cancelled) {
          return;
        }

        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "PayPal is unavailable.",
        );
      }
    }

    void initialize();

    return () => {
      cancelled = true;
      void buttons?.close?.();
    };
  }, [
    available,
    canSubmitBrief,
    clientId,
    currency,
    productId,
    requiresBrief,
    unavailableMessage,
  ]);

  return (
    <div className="space-y-4">
      {requiresBrief ? (
        <div className="space-y-3">
          <label className="grid gap-2">
            <span className="front-kicker">Before checkout</span>
            <textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              className="front-textarea min-h-32"
              placeholder={
                briefPrompt ||
                "Tell me what you need, what this should include, and any references or constraints."
              }
            />
          </label>

          {!canSubmitBrief ? (
            <p className="text-sm text-base-content/62">
              Add a short brief to unlock checkout.
            </p>
          ) : null}
        </div>
      ) : null}

      <div ref={containerRef} />

      {status === "loading" ? (
        <p className="text-sm text-base-content/62">Loading checkout...</p>
      ) : null}

      {message ? (
        <div
          className={`front-status ${
            status === "success"
              ? "border-success/25 bg-success/10 text-success-content dark:text-success"
              : "border-error/25 bg-error/10 text-error-content dark:text-error"
          }`}
        >
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}

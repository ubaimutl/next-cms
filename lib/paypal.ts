import "server-only";

import { randomUUID } from "node:crypto";

type PayPalEnvironment = "sandbox" | "live";

type PayPalCreateOrderArgs = {
  productId: number;
  title: string;
  amountCents: number;
  currency: string;
};

type PayPalOrderResponse = {
  id: string;
  status: string;
};

type PayPalCaptureResponse = {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
      }>;
    };
  }>;
};

function getPayPalEnvironment(): PayPalEnvironment {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

function getPayPalApiBase() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalClientId() {
  return process.env.PAYPAL_CLIENT_ID?.trim() || null;
}

function getPayPalSecret() {
  return process.env.PAYPAL_CLIENT_SECRET?.trim() || null;
}

export function isPayPalConfigured() {
  return Boolean(getPayPalClientId() && getPayPalSecret());
}

function assertPayPalConfigured() {
  const clientId = getPayPalClientId();
  const secret = getPayPalSecret();

  if (!clientId || !secret) {
    throw new Error("PayPal is not configured.");
  }

  return { clientId, secret };
}

function formatOrderAmount(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

async function readPayPalResponse<T>(response: Response) {
  const json = (await response.json()) as T & {
    details?: Array<{ issue?: string; description?: string }>;
    message?: string;
  };

  if (response.ok) {
    return json;
  }

  const detail = json.details?.[0];
  const message =
    detail?.description ??
    detail?.issue ??
    json.message ??
    "PayPal request failed.";

  throw new Error(message);
}

async function getPayPalAccessToken() {
  const { clientId, secret } = assertPayPalConfigured();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const json = (await readPayPalResponse<{
    access_token: string;
  }>(response)) as { access_token: string };

  return json.access_token;
}

export async function createPayPalOrder(
  args: PayPalCreateOrderArgs,
): Promise<PayPalOrderResponse> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": randomUUID(),
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `product-${args.productId}`,
          custom_id: String(args.productId),
          description: args.title,
          amount: {
            currency_code: args.currency,
            value: formatOrderAmount(args.amountCents),
          },
        },
      ],
    }),
    cache: "no-store",
  });

  return readPayPalResponse<PayPalOrderResponse>(response);
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": randomUUID(),
      },
      cache: "no-store",
    },
  );

  return readPayPalResponse<PayPalCaptureResponse>(response);
}

import nodemailer from "nodemailer";

type GlobalMailState = typeof globalThis & {
  contactTransporter?: ReturnType<typeof nodemailer.createTransport>;
};

export function getConfiguredFromAddress(kind: "contact" | "auth" = "contact") {
  if (kind === "auth") {
    return (
      process.env.AUTH_FROM_EMAIL ||
      process.env.CONTACT_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER ||
      null
    );
  }

  return (
    process.env.CONTACT_FROM_EMAIL ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER ||
    null
  );
}

export function getMailDebugSummary() {
  if (process.env.SMTP_URL) {
    return {
      mode: "url",
      host: "configured-via-url",
      port: "configured-via-url",
      from: getConfiguredFromAddress("contact"),
      authFrom: getConfiguredFromAddress("auth"),
      to: process.env.CONTACT_TO_EMAIL || null,
    };
  }

  return {
    mode: "host",
    host: process.env.SMTP_HOST || null,
    port: process.env.SMTP_PORT || null,
      secure:
        process.env.SMTP_SECURE === "true" ||
        Number(process.env.SMTP_PORT) === 465,
    from: getConfiguredFromAddress("contact"),
    authFrom: getConfiguredFromAddress("auth"),
    to: process.env.CONTACT_TO_EMAIL || null,
  };
}

export function isMailConfigured(kind: "contact" | "auth" = "contact") {
  return Boolean(
    process.env.SMTP_URL ||
    (process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      getConfiguredFromAddress(kind)),
  );
}

export function getTransporter() {
  const globalState = globalThis as GlobalMailState;

  if (globalState.contactTransporter) {
    return globalState.contactTransporter;
  }

  const transporter = process.env.SMTP_URL
    ? nodemailer.createTransport(process.env.SMTP_URL)
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure:
          process.env.SMTP_SECURE === "true" ||
          Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            }
          : undefined,
      });

  globalState.contactTransporter = transporter;
  return transporter;
}

export async function verifyMailTransport(kind: "contact" | "auth" = "contact") {
  if (!isMailConfigured(kind) || !getConfiguredFromAddress(kind)) {
    throw new Error(
      "SMTP is not configured. Set SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER and the appropriate sender email env.",
    );
  }

  const transporter = getTransporter();
  await transporter.verify();

  return transporter;
}

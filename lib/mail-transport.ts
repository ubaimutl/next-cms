import nodemailer from "nodemailer";

type GlobalMailState = typeof globalThis & {
  contactTransporter?: ReturnType<typeof nodemailer.createTransport>;
};

export function getConfiguredFromAddress() {
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
      from: getConfiguredFromAddress(),
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
    from: getConfiguredFromAddress(),
    to: process.env.CONTACT_TO_EMAIL || null,
  };
}

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_URL ||
    (process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      getConfiguredFromAddress()),
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

export async function verifyMailTransport() {
  if (!isMailConfigured() || !getConfiguredFromAddress()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER and CONTACT_FROM_EMAIL.",
    );
  }

  const transporter = getTransporter();
  await transporter.verify();

  return transporter;
}

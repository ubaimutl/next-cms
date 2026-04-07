import "dotenv/config";

import {
  getConfiguredFromAddress,
  getMailDebugSummary,
  verifyMailTransport,
} from "../lib/mail-transport";

function parseArgs(argv: string[]) {
  return {
    send: argv.includes("--send"),
    to:
      argv.find((arg) => arg.startsWith("--to="))?.slice("--to=".length) ||
      process.env.CONTACT_TO_EMAIL ||
      null,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const transporter = await verifyMailTransport();
  const summary = getMailDebugSummary();

  console.log("SMTP verify: ok");
  console.log(`mode: ${summary.mode}`);
  console.log(`host: ${summary.host ?? "not set"}`);
  console.log(`port: ${summary.port ?? "not set"}`);
  console.log(`from: ${summary.from ?? "not set"}`);
  console.log(`to: ${summary.to ?? "not set"}`);

  if (!args.send) {
    return;
  }

  const from = getConfiguredFromAddress();

  if (!args.to || !from) {
    throw new Error("Set CONTACT_TO_EMAIL or pass --to=email@example.com.");
  }

  const result = await transporter.sendMail({
    from,
    to: args.to,
    subject: "SMTP local test",
    text: [
      "This is a test email from the local SMTP verification script.",
      "",
      `Sent at: ${new Date().toISOString()}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p>This is a test email from the local SMTP verification script.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
  });

  console.log("SMTP send: ok");
  console.log(`messageId: ${result.messageId}`);
}

main().catch((error) => {
  console.error(
    `SMTP test failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});

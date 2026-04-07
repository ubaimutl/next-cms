import "server-only";

import type { ContactSubmission } from "@/lib/contact";
import {
  getConfiguredFromAddress,
  getTransporter,
  isMailConfigured,
} from "@/lib/mail-transport";
import { siteConfig } from "@/lib/site";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendContactEmail(submission: ContactSubmission) {
  const from = getConfiguredFromAddress();
  const to = process.env.CONTACT_TO_EMAIL || siteConfig.email;

  if (!isMailConfigured() || !from) {
    throw new Error(
      "SMTP is not configured. Set SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER and CONTACT_FROM_EMAIL.",
    );
  }

  const transporter = getTransporter();
  const services = submission.services.join(", ");
  const escapedMessage = escapeHtml(submission.message);

  const text = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company ?? "Not provided"}`,
    `Website: ${submission.website ?? "Not provided"}`,
    `Services: ${services}`,
    `Budget: ${submission.budget ?? "Not specified"}`,
    `Timeline: ${submission.timeline ?? "Not specified"}`,
    "",
    "Message:",
    submission.message,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2 style="margin-bottom: 20px;">New contact inquiry</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tbody>
          <tr><td style="padding: 6px 0; width: 120px;"><strong>Name</strong></td><td>${escapeHtml(submission.name)}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Email</strong></td><td>${escapeHtml(submission.email)}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Company</strong></td><td>${escapeHtml(submission.company ?? "Not provided")}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Website</strong></td><td>${escapeHtml(submission.website ?? "Not provided")}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Services</strong></td><td>${escapeHtml(services)}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Budget</strong></td><td>${escapeHtml(submission.budget ?? "Not specified")}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Timeline</strong></td><td>${escapeHtml(submission.timeline ?? "Not specified")}</td></tr>
        </tbody>
      </table>
      <div style="margin-top: 28px;">
        <p style="margin: 0 0 8px;"><strong>Message</strong></p>
        <div style="white-space: pre-wrap;">${escapedMessage}</div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    to,
    from,
    replyTo: `${submission.name} <${submission.email}>`,
    subject: `New inquiry from ${submission.name}`,
    text,
    html,
  });
}

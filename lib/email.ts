/**
 * Email sending via Resend API.
 * No SDK needed — just fetch.
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Zephio <hello@zephio.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Send a single email via Resend.
 * Fails silently in development if RESEND_API_KEY is not set.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    // Dev mode — log instead of sending
    console.log(`[email] Would send to ${opts.to}: "${opts.subject}"`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend error ${res.status}:`, body);
    }
  } catch (err) {
    // Never let email failures crash the main flow
    console.error("[email] Failed to send:", err);
  }
}

// ── Typed email senders ───────────────────────────────────────────────────────

import {
  welcomeEmailHtml,
  usageSummaryEmailHtml,
  upgradeReminderEmailHtml,
} from "./email-templates";

export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
}) {
  await sendEmail({
    to: opts.to,
    subject: "Welcome to Zephio — let's build something stunning ✨",
    html: welcomeEmailHtml({ firstName: opts.firstName, appUrl: APP_URL }),
  });
}

export async function sendUsageSummaryEmail(opts: {
  to: string;
  firstName: string;
  used: number;
  limit: number;
  resetDate: string;
}) {
  await sendEmail({
    to: opts.to,
    subject: `Your Zephio usage this month — ${opts.used}/${opts.limit} generations`,
    html: usageSummaryEmailHtml({ ...opts, appUrl: APP_URL }),
  });
}

export async function sendUpgradeReminderEmail(opts: {
  to: string;
  firstName: string;
  used: number;
  limit: number;
  remaining: number;
}) {
  await sendEmail({
    to: opts.to,
    subject: `You have ${opts.remaining} generation${opts.remaining !== 1 ? "s" : ""} left this month`,
    html: upgradeReminderEmailHtml({ ...opts, appUrl: APP_URL }),
  });
}

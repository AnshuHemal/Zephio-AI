/**
 * HTML email templates.
 * All styles are inline — required for email client compatibility.
 * Design: dark background, primary orange/red accent, clean typography.
 */

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Zephio</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0f0f;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Logo header -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#dc5028,#b83d1a);border-radius:10px;padding:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;line-height:1;">✦</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Zephio<span style="color:#dc5028;">.</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;">
              <!-- Top accent bar -->
              <div style="height:3px;background:linear-gradient(90deg,#dc5028,#ff6b3d,#dc5028);"></div>
              <div style="padding:36px 40px;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#555555;line-height:1.6;">
                You're receiving this because you signed up for Zephio.<br/>
                <a href="{{appUrl}}/dashboard" style="color:#dc5028;text-decoration:none;">Open dashboard</a>
                &nbsp;·&nbsp;
                <a href="mailto:hello@zephio.app" style="color:#555555;text-decoration:none;">Contact us</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#3a3a3a;">
                © ${new Date().getFullYear()} Zephio. AI that designs. You that decides.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function replaceAppUrl(html: string, appUrl: string): string {
  return html.replace(/\{\{appUrl\}\}/g, appUrl);
}

// ── Shared components ─────────────────────────────────────────────────────────
function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;color:#aaaaaa;line-height:1.7;">${text}</p>`;
}

function button(text: string, href: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
      <tr>
        <td style="background-color:#dc5028;border-radius:8px;">
          <a href="${href}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">${text}</a>
        </td>
      </tr>
    </table>`;
}

function divider(): string {
  return `<div style="height:1px;background-color:#2a2a2a;margin:24px 0;"></div>`;
}

function pill(text: string): string {
  return `<span style="display:inline-block;padding:4px 12px;background-color:#2a2a2a;border-radius:100px;font-size:12px;color:#888888;margin:0 4px 8px 0;">${text}</span>`;
}

// ── Welcome email ─────────────────────────────────────────────────────────────
export function welcomeEmailHtml({
  firstName,
  appUrl,
}: {
  firstName: string;
  appUrl: string;
}): string {
  const content = `
    ${heading(`Welcome to Zephio, ${firstName} 👋`)}
    ${paragraph("You're in. Zephio turns your ideas into production-ready web designs in seconds — no code, no drag-and-drop, just describe what you want.")}

    ${button("Start building →", `${appUrl}/new`)}

    ${divider()}

    <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">Try one of these prompts</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${[
        { icon: "🤖", label: "AI SaaS Landing", prompt: "A cutting-edge landing page for an AI workflow platform. Dark mode, indigo accents, bento grid features." },
        { icon: "🎨", label: "Designer Portfolio", prompt: "A minimal portfolio for a UI/UX designer. Clean white background, case study grid, generous whitespace." },
        { icon: "💳", label: "Payments Platform", prompt: "A high-conversion landing page for a payment product. Trust badges, feature grid, bold CTA." },
      ].map(({ icon, label, prompt }) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width:32px;font-size:18px;vertical-align:top;padding-top:2px;">${icon}</td>
                <td style="padding-left:10px;">
                  <p style="margin:0 0 3px;font-size:13px;font-weight:600;color:#ffffff;">${label}</p>
                  <p style="margin:0;font-size:12px;color:#666666;line-height:1.5;">${prompt}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("")}
    </table>

    ${divider()}

    <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">What you get on the free tier</p>
    <p style="margin:0 0 6px;font-size:14px;color:#aaaaaa;">
      ${["10 AI generations/month", "Unlimited projects", "Export as HTML", "Share preview links"].map(f => `✓ ${f}`).join("&nbsp;&nbsp;")}
    </p>

    ${divider()}

    ${paragraph(`Questions? Just reply to this email — we read every one.`)}
    <p style="margin:0;font-size:14px;color:#666666;">— The Zephio team</p>
  `;

  return replaceAppUrl(emailWrapper(content), appUrl);
}

// ── Monthly usage summary ─────────────────────────────────────────────────────
export function usageSummaryEmailHtml({
  firstName,
  used,
  limit,
  resetDate,
  appUrl,
}: {
  firstName: string;
  used: number;
  limit: number;
  resetDate: string;
  appUrl: string;
}): string {
  const pct = Math.round((used / limit) * 100);
  const remaining = limit - used;
  const isHeavyUser = used >= limit * 0.8;

  const content = `
    ${heading(`Your Zephio usage this month`)}
    ${paragraph(`Hi ${firstName}, here's a quick look at how you've been using Zephio this month.`)}

    <!-- Usage card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#242424;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:13px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Generations used</p>
                <p style="margin:0;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:-1px;">${used}<span style="font-size:18px;color:#555555;font-weight:400;"> / ${limit}</span></p>
              </td>
              <td style="text-align:right;vertical-align:top;">
                <span style="display:inline-block;padding:6px 14px;background-color:${isHeavyUser ? "#3d1a0a" : "#1a2a1a"};border-radius:100px;font-size:12px;font-weight:600;color:${isHeavyUser ? "#dc5028" : "#4ade80"};">${remaining} remaining</span>
              </td>
            </tr>
          </table>

          <!-- Progress bar -->
          <div style="margin-top:16px;height:6px;background-color:#333333;border-radius:100px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#dc5028,#ff6b3d);border-radius:100px;"></div>
          </div>
          <p style="margin:8px 0 0;font-size:12px;color:#555555;">Resets on ${resetDate}</p>
        </td>
      </tr>
    </table>

    ${isHeavyUser ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#2a1a0a;border:1px solid #3d2a1a;border-radius:12px;margin-bottom:24px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#ff8c5a;">Running low on generations</p>
            <p style="margin:0 0 16px;font-size:13px;color:#aa7755;line-height:1.6;">You've used ${pct}% of your monthly limit. Upgrade to Pro for unlimited generations and never hit a wall mid-project.</p>
            ${button("Upgrade to Pro — $12/mo", `${appUrl}/#pricing`)}
          </td>
        </tr>
      </table>
    ` : `
      ${button("Keep building →", `${appUrl}/new`)}
    `}

    ${divider()}
    ${paragraph(`Thanks for using Zephio. We're constantly improving the AI — expect better outputs every week.`)}
    <p style="margin:0;font-size:14px;color:#666666;">— The Zephio team</p>
  `;

  return replaceAppUrl(emailWrapper(content), appUrl);
}

// ── Upgrade reminder (approaching limit) ─────────────────────────────────────
export function upgradeReminderEmailHtml({
  firstName,
  used,
  limit,
  remaining,
  appUrl,
}: {
  firstName: string;
  used: number;
  limit: number;
  remaining: number;
  appUrl: string;
}): string {
  const content = `
    ${heading(`${remaining} generation${remaining !== 1 ? "s" : ""} left this month`)}
    ${paragraph(`Hi ${firstName}, you've used <strong style="color:#ffffff;">${used} of ${limit}</strong> free generations this month. You're almost at your limit.`)}

    <!-- Urgency card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#2a1a0a;border:1px solid #3d2a1a;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 6px;font-size:28px;font-weight:700;color:#ff8c5a;letter-spacing:-1px;">${remaining} left</p>
          <p style="margin:0 0 16px;font-size:13px;color:#aa7755;line-height:1.6;">
            Once you hit 0, generations will be paused until next month — unless you upgrade to Pro.
          </p>
          ${button("Upgrade to Pro — $12/mo", `${appUrl}/#pricing`)}
          <p style="margin:0;font-size:12px;color:#555555;">Unlimited generations · No monthly limits · Cancel anytime</p>
        </td>
      </tr>
    </table>

    ${divider()}

    <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">What Pro includes</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${[
        "Unlimited AI generations",
        "Unlimited projects",
        "Export as ZIP (all pages)",
        "No watermark on exports",
        "Priority AI models",
      ].map(f => `
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#aaaaaa;">
            <span style="color:#4ade80;margin-right:8px;">✓</span>${f}
          </td>
        </tr>`).join("")}
    </table>

    ${paragraph(`Or keep building with your ${remaining} remaining generation${remaining !== 1 ? "s" : ""} — your limit resets at the start of next month.`)}
    ${button("Continue building →", `${appUrl}/new`)}

    <p style="margin:0;font-size:14px;color:#666666;">— The Zephio team</p>
  `;

  return replaceAppUrl(emailWrapper(content), appUrl);
}

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import LegalPage, { type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Zephio collects, uses, and protects your personal information when you use our AI web design platform.",
  path: "/privacy",
  noIndex: false,
});

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          At Zephio, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our Service.
        </p>
        <p>
          We are committed to transparency. This policy is written in plain language so you
          understand exactly what happens with your data — not just the legal minimum.
        </p>
        <div className="highlight-box">
          <strong>The short version:</strong> We collect only what we need to run the Service. We
          don't sell your data. You can request deletion at any time.
        </div>
      </>
    ),
  },
  {
    id: "information-collected",
    title: "Information We Collect",
    content: (
      <>
        <h3>Information you provide</h3>
        <ul>
          <li>
            <strong>Account data:</strong> Name, email address, and password when you register
          </li>
          <li>
            <strong>Payment data:</strong> Billing information processed by Stripe. We never store
            full card numbers — Stripe handles all payment data under PCI-DSS compliance
          </li>
          <li>
            <strong>Content:</strong> Prompts, images, and other inputs you provide to generate
            designs
          </li>
          <li>
            <strong>Communications:</strong> Messages you send to our support team
          </li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>
            <strong>Usage data:</strong> Pages visited, features used, generation counts, and
            session duration
          </li>
          <li>
            <strong>Device data:</strong> Browser type, operating system, IP address, and
            referring URLs
          </li>
          <li>
            <strong>Cookies:</strong> Authentication tokens (HTTP-only, secure) and preference
            cookies. See our Cookie section below
          </li>
          <li>
            <strong>Error data:</strong> Crash reports and performance data via Sentry to help us
            fix bugs
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and improve the Service</li>
          <li>Process payments and manage your subscription</li>
          <li>Send transactional emails (account verification, receipts, usage summaries)</li>
          <li>Respond to your support requests</li>
          <li>Monitor and enforce our Terms of Service</li>
          <li>Detect and prevent fraud, abuse, and security incidents</li>
          <li>Analyze usage patterns to improve features (using aggregated, anonymized data)</li>
          <li>Send product updates and promotional emails (you can opt out at any time)</li>
        </ul>
        <p>
          We do not use your design prompts or generated content to train AI models without your
          explicit consent.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Information Sharing",
    content: (
      <>
        <p>
          We do not sell, rent, or trade your personal information. We share data only in the
          following limited circumstances:
        </p>
        <ul>
          <li>
            <strong>Service providers:</strong> Trusted third parties who help us operate the
            Service (Stripe for payments, Resend for email, Sentry for error tracking, Insforge
            for infrastructure). These providers are contractually bound to protect your data.
          </li>
          <li>
            <strong>AI model providers:</strong> Your prompts and images are sent to AI model
            providers (Anthropic, Google) to generate designs. These providers have their own
            privacy policies governing data handling.
          </li>
          <li>
            <strong>Legal requirements:</strong> We may disclose information if required by law,
            court order, or to protect the rights and safety of Zephio and its users.
          </li>
          <li>
            <strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of
            assets, your data may be transferred. We will notify you before this occurs.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    content: (
      <>
        <p>We use the following types of cookies:</p>
        <ul>
          <li>
            <strong>Essential cookies:</strong> HTTP-only authentication tokens required for you
            to stay logged in. These cannot be disabled without breaking the Service.
          </li>
          <li>
            <strong>Preference cookies:</strong> Store your theme preference (light/dark mode) and
            UI settings.
          </li>
          <li>
            <strong>Analytics:</strong> We use anonymized, aggregated analytics to understand how
            the Service is used. We do not use Google Analytics or other invasive tracking.
          </li>
        </ul>
        <p>
          We do not use third-party advertising cookies or cross-site tracking. You can clear
          cookies at any time through your browser settings, though this will log you out.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <>
        <p>We retain your data for as long as your account is active or as needed to provide the Service:</p>
        <ul>
          <li>
            <strong>Account data:</strong> Retained until you delete your account
          </li>
          <li>
            <strong>Generated designs:</strong> Retained until you delete them or your account
          </li>
          <li>
            <strong>Payment records:</strong> Retained for 7 years as required by financial
            regulations
          </li>
          <li>
            <strong>Error logs:</strong> Retained for 90 days
          </li>
          <li>
            <strong>After account deletion:</strong> Most data is deleted within 30 days. Some
            anonymized, aggregated data may be retained for analytics.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <p>
          Depending on your location, you may have the following rights regarding your personal
          data:
        </p>
        <ul>
          <li>
            <strong>Access:</strong> Request a copy of the personal data we hold about you
          </li>
          <li>
            <strong>Correction:</strong> Request correction of inaccurate or incomplete data
          </li>
          <li>
            <strong>Deletion:</strong> Request deletion of your personal data ("right to be
            forgotten")
          </li>
          <li>
            <strong>Portability:</strong> Request your data in a machine-readable format
          </li>
          <li>
            <strong>Objection:</strong> Object to processing of your data for marketing purposes
          </li>
          <li>
            <strong>Restriction:</strong> Request restriction of processing in certain
            circumstances
          </li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@zephio.app">privacy@zephio.app</a>. We will respond within 30
          days. For EU/EEA residents, you also have the right to lodge a complaint with your local
          data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <>
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul>
          <li>All data is transmitted over HTTPS/TLS encryption</li>
          <li>Authentication tokens are stored in HTTP-only, secure cookies</li>
          <li>Passwords are hashed using industry-standard algorithms — we never store plain text</li>
          <li>Payment data is handled exclusively by Stripe (PCI-DSS Level 1 certified)</li>
          <li>Access to production systems is restricted to authorized personnel only</li>
          <li>We conduct regular security reviews and dependency audits</li>
        </ul>
        <p>
          No system is 100% secure. If you discover a security vulnerability, please report it
          responsibly to{" "}
          <a href="mailto:security@zephio.app">security@zephio.app</a>.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: (
      <>
        <p>
          The Service is not directed to children under the age of 16. We do not knowingly collect
          personal information from children under 16. If you believe we have inadvertently
          collected such information, please contact us immediately at{" "}
          <a href="mailto:privacy@zephio.app">privacy@zephio.app</a> and we will delete it
          promptly.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. When we make material changes, we
          will:
        </p>
        <ul>
          <li>Update the "Last updated" date at the top of this page</li>
          <li>Send an email notification to registered users</li>
          <li>Display a notice in the application for significant changes</li>
        </ul>
        <p>
          Your continued use of the Service after changes take effect constitutes acceptance of the
          revised policy. If you do not agree to the changes, please stop using the Service and
          delete your account.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      badge="Legal"
      title="Privacy Policy"
      subtitle="We believe privacy is a right, not a feature. Here's exactly how we handle your data — no legalese, no surprises."
      effectiveDate="January 1, 2025"
      lastUpdated="April 14, 2026"
      sections={sections}
    />
  );
}

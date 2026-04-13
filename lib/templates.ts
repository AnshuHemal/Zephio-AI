export type Template = {
  id: string;
  label: string;
  category: "SaaS" | "Portfolio" | "E-commerce" | "FinTech" | "Dashboard" | "Agency" | "Startup";
  emoji: string;
  description: string;
  prompt: string;
};

export const TEMPLATES: Template[] = [
  // ── SaaS ──────────────────────────────────────────────────────────────
  {
    id: "saas-ai",
    label: "AI SaaS Landing",
    category: "SaaS",
    emoji: "🤖",
    description: "Dark mode AI platform with glowing hero and bento features",
    prompt:
      "A cutting-edge landing page for an autonomous AI workflow platform called 'Nexus AI'. Deep space dark mode with vibrant indigo radial light-leaks, floating glassmorphic navbar with logo and nav links, hero section with glowing gradient headline 'Automate Everything', animated bento grid showcasing 6 features with icons, a 3-tier pricing section with glassmorphic cards, and a bold CTA footer. Use indigo/violet as primary accent.",
  },
  {
    id: "saas-hr",
    label: "HR & Payroll SaaS",
    category: "SaaS",
    emoji: "👥",
    description: "B2B HR platform with bento grid and dashboard mockups",
    prompt:
      "A clean, high-conversion B2B SaaS landing page for an HR and Payroll platform called 'PeopleOS'. Royal blue primary color, bright yellow accent for CTA buttons, alternating solid blue and ultra-light gray sections. Hero with solid blue background, faint grid mesh, centered bold typography, and floating white UI dashboard cards showing mock payroll data and SVG charts. 3-column bento grid for features, 2-column section with stylized SVG globe, horizontal timeline-based pricing on blue background, 3-column testimonials grid, and bright yellow rounded CTA banner above a clean footer.",
  },
  {
    id: "saas-b2b",
    label: "B2B SaaS Marketing",
    category: "SaaS",
    emoji: "📊",
    description: "Enterprise-grade with client logos, diagrams, and pricing",
    prompt:
      "A serious B2B SaaS marketing site for a project management tool called 'Orbit'. Structured hero with bold headline and product screenshot, client logos strip (Vercel, Linear, Notion, Stripe, Figma), feature sections with diagrams and icons, data visualization preview section, 3-tier pricing comparison table, FAQ accordion, and enterprise call-to-action. Clean hierarchy, strong spacing rhythm, light theme with slate accents.",
  },

  // ── Portfolio ──────────────────────────────────────────────────────────
  {
    id: "portfolio-designer",
    label: "UI/UX Designer Portfolio",
    category: "Portfolio",
    emoji: "🎨",
    description: "Minimal portfolio with case studies and clean typography",
    prompt:
      "A minimal, editorial portfolio for a senior UI/UX designer named 'Alex Chen'. Clean white background with subtle warm gray accents. Large typographic hero with name and title, 4-card case study grid with project thumbnails (use picsum images), skills section with tool logos, a 'Selected Work' bento grid, brief about section with photo placeholder, and a contact section. Elegant Inter typography, generous whitespace, subtle hover animations.",
  },
  {
    id: "portfolio-dev",
    label: "Developer Portfolio",
    category: "Portfolio",
    emoji: "💻",
    description: "Dark terminal-inspired dev portfolio with project grid",
    prompt:
      "A dark-mode developer portfolio for a full-stack engineer named 'Jordan Lee'. Terminal-inspired aesthetic with a deep charcoal background and green/cyan accent colors. Hero with animated typing effect placeholder, tech stack badges row (React, Node, TypeScript, PostgreSQL), 6-card project grid with GitHub links, open source contributions section, a timeline-style work experience section, and a minimal contact form. Monospace font for code elements.",
  },

  // ── E-commerce ─────────────────────────────────────────────────────────
  {
    id: "ecommerce-fashion",
    label: "Luxury Fashion Store",
    category: "E-commerce",
    emoji: "👗",
    description: "Editorial e-commerce with hero, product grid, and lookbook",
    prompt:
      "A luxury fashion e-commerce homepage for a brand called 'Maison Noir'. Editorial full-bleed hero with model image placeholder (picsum), minimal black and white palette with gold accents. Featured collections grid (3 columns), new arrivals product cards with hover zoom, a lookbook section with overlapping images, brand story section, newsletter signup with elegant styling, and a minimal footer. Premium feel, generous whitespace.",
  },
  {
    id: "ecommerce-tech",
    label: "Tech Product Store",
    category: "E-commerce",
    emoji: "🎧",
    description: "Apple-style product showcase with specs and buy CTA",
    prompt:
      "An Apple-inspired product landing page for premium wireless headphones called 'Aura Pro'. Clean white background, product hero with large centered product image (picsum), animated feature callouts, technical specs grid, color variant selector mockup, comparison table vs competitors, customer reviews section with star ratings, and a sticky buy button. Minimal typography, lots of breathing room, subtle shadows.",
  },

  // ── FinTech ────────────────────────────────────────────────────────────
  {
    id: "fintech-payments",
    label: "Payments Platform",
    category: "FinTech",
    emoji: "💳",
    description: "High-conversion payments landing with trust signals",
    prompt:
      "A high-conversion landing page for a payment link product called 'PayFlow'. Strong hero with 'Accept Payments Instantly' headline, live payment preview mockup on the right, trust badges (SSL, PCI DSS, SOC2), feature grid explaining no-code checkout, use-case sections (Creators, SaaS, Freelancers), pricing comparison table, customer logos, and a bold CTA. Clean fintech-grade design with blue/indigo palette.",
  },
  {
    id: "fintech-neobank",
    label: "Neobank Website",
    category: "FinTech",
    emoji: "🏦",
    description: "Modern neobank with app preview and trust metrics",
    prompt:
      "A modern neobank marketing website for 'Vault'. Confident hero with mobile app preview mockup, trust metrics row showing '2M+ users', '$4.2B processed', '4.9★ rating'. Debit card showcase section with 3D-style card, feature breakdown grid (instant transfers, no fees, smart savings), comparison table vs traditional banks, testimonials carousel, and strong sign-up CTA. Dark navy and electric blue palette.",
  },

  // ── Dashboard ──────────────────────────────────────────────────────────
  {
    id: "dashboard-analytics",
    label: "Analytics Dashboard",
    category: "Dashboard",
    emoji: "📈",
    description: "Dark analytics dashboard with charts and KPI cards",
    prompt:
      "A high-fidelity analytics dashboard for a SaaS product called 'Metrics'. Dark sidebar navigation with icons, top header with search and user avatar. Main content area with 4 KPI cards (Total Revenue $124k, Active Users 8,432, Conversion 3.2%, Churn 1.1%), a large SVG line chart for revenue over time, a bar chart for weekly signups, a recent activity feed, and a top pages table. Dark charcoal background, emerald green accents for positive metrics.",
  },

  // ── Agency ─────────────────────────────────────────────────────────────
  {
    id: "agency-creative",
    label: "Creative Agency",
    category: "Agency",
    emoji: "✨",
    description: "Bold agency site with work showcase and team section",
    prompt:
      "A bold creative agency website for 'Studio Flux'. Dark background with electric yellow accent. Large typographic hero 'We Build Digital Experiences', horizontal scrolling work showcase with 5 project cards (use picsum images), services section with animated icons, team grid with member photos (pravatar), client logos, awards section, and a contact form. Confident, editorial, slightly brutalist aesthetic.",
  },

  // ── Startup ────────────────────────────────────────────────────────────
  {
    id: "startup-launch",
    label: "Startup Launch Page",
    category: "Startup",
    emoji: "🚀",
    description: "Coming soon / waitlist page with email capture",
    prompt:
      "A high-energy startup launch page for a product called 'Spark'. Centered layout with a bold gradient headline, product tagline, email waitlist signup form with a glowing CTA button, social proof showing '2,847 people already joined', 3 key benefit pills, a product screenshot placeholder, and a minimal footer with social links. Dark background with vibrant orange/amber gradient accents. Urgency-driven copy.",
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "SaaS",
  "Portfolio",
  "E-commerce",
  "FinTech",
  "Dashboard",
  "Agency",
  "Startup",
] as const;

import { useState, useEffect } from 'react';

const baseUrl = () => import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

async function apiFetch<T>(path: string): Promise<{ data: T | null; ready: boolean }> {
  try {
    const res = await fetch(`${baseUrl()}${path}`);
    if (!res.ok) return { data: null, ready: false };
    return await res.json();
  } catch {
    return { data: null, ready: false };
  }
}

// ---------------------------------------------------------------------------
// Shared / global types
// ---------------------------------------------------------------------------

export interface SocialLinks {
  linkedin: string;
  twitter: string;
  github: string;
  email: string;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroBadgeText: string;
  aboutNarrativeParagraphs: string[];
  profileImageUrl: string;
  calendarBookingUrl: string;
  social: SocialLinks;
  substackUrl: string;
}

// ---------------------------------------------------------------------------
// Home page types
// ---------------------------------------------------------------------------

export interface HomeContent {
  heroHeadline: string;
  heroSubtext: string;
  heroImageUrl: string | null;
  heroImageHotspot: { x: number; y: number } | null;
  heroBackgroundImageUrl: string | null;
  primaryCTA: string;
}

// ---------------------------------------------------------------------------
// About page types
// ---------------------------------------------------------------------------

export interface CricketStat {
  aspect: string;
  value: string;
}

export interface AboutContent {
  portraitUrl: string | null;
  portraitHotspot: { x: number; y: number } | null;
  explorerImageUrl: string | null;
  bikingImageUrl: string | null;
  bookCoverImageUrl: string | null;
  narrative: string[];
  cricketStats: CricketStat[];
}

// ---------------------------------------------------------------------------
// AI Dad page types
// ---------------------------------------------------------------------------

export interface AiPillar {
  title: string;
  description: string;
  icon: string;
}

export interface KeyMetric {
  value: string;
  label: string;
  description: string;
}

export interface AiDadContent {
  strategyTitle: string;
  aiPillars: AiPillar[];
  frameworkPDFUrl: string | null;
  frameworkImageUrl: string | null;
  philosophyImageUrl: string | null;
  missionStatement: string;
  keyMetrics: KeyMetric[];
  quote: string;
  leadershipPhilosophy: string[];
}

export interface TimelineItem {
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface StrategyPillar {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Projects page types
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  title: string;
  slug: string | null;
  thumbnailUrl: string | null;
  thumbnailHotspot: { x: number; y: number } | null;
  videoUrl: string | null;
  description: string;
  tech: string[];
  status: 'active' | 'coming-soon' | 'archived';
  link: string;
}

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const FALLBACK_SETTINGS: SiteSettings = {
  heroHeadline: 'Architecting Intelligent Solutions for a World in Motion.',
  heroSubheadline:
    'From built environments to digital frontiers, Sarit Sethi delivers measurable business impact through strategic AI roadmaps. Beyond the boardroom, he is a published author, cricket enthusiast, and a global citizen.',
  heroBadgeText: 'AI Product Leader',
  aboutNarrativeParagraphs: [
    "A global citizen who has lived and worked in Delhi, Toronto, and Chicago, drawing a broad worldview from these diverse cultural and professional hubs.",
    "I balance the excitement of AI's potential with a grounded concern for its pervasiveness. I focus on building a rich personality through physical experiences while preparing for a world shaped by technology.",
  ],
  profileImageUrl: '',
  calendarBookingUrl: 'https://calendar.app.google/Xh2ruF2wWSN8Y2JP9',
  social: {
    linkedin: 'https://www.linkedin.com/in/sarit-sethi/',
    twitter: 'https://twitter.com/saritsethi',
    github: 'https://github.com/saritsethi',
    email: 'mailto:saritsethi@gmail.com',
  },
  substackUrl: 'https://substack.com/@saritsethi',
};

const FALLBACK_HOME: HomeContent = {
  heroHeadline: 'Architecting Intelligent Solutions for a World in Motion.',
  heroSubtext:
    'From built environments to digital frontiers, Sarit Sethi delivers measurable business impact through strategic AI roadmaps. Beyond the boardroom, he is a published author, cricket enthusiast, and a global citizen.',
  heroImageUrl: null,
  heroImageHotspot: null,
  heroBackgroundImageUrl: null,
  primaryCTA: 'Book Strategic Session',
};

const FALLBACK_ABOUT: AboutContent = {
  portraitUrl: null,
  portraitHotspot: null,
  explorerImageUrl: null,
  bikingImageUrl: null,
  bookCoverImageUrl: null,
  narrative: [
    "A global citizen who has lived and worked in Delhi, Toronto, and Chicago, drawing a broad worldview from these diverse cultural and professional hubs.",
    "I balance the excitement of AI's potential with a grounded concern for its pervasiveness. I focus on building a rich personality through physical experiences while preparing for a world shaped by technology.",
    "As a father to a two-year-old, I am grappling with the architecture of the world my son will inherit. In a world of digital saturation, my goal is to ensure my son comes home with dirt on his pants rather than keys impressed on his fingertips.",
    "Co-authored a poetry collection with my wife, Neetika Wahi, exploring emotions, relationships, and introspection. Written in the AI era without AI — a testament to human authenticity.",
  ],
  cricketStats: [
    { aspect: 'Obsession Level', value: 'Professional' },
    { aspect: 'Second Office', value: 'The 22 yards' },
    { aspect: 'Style', value: 'Strategy, precision, and endurance' },
    { aspect: 'Book', value: 'From Our Veranda — co-authored with Neetika Wahi' },
  ],
};

const FALLBACK_TIMELINE: TimelineItem[] = [
  {
    year: '2024–2026',
    title: 'Product Management Director',
    company: 'Fortune 200 Enterprise',
    description:
      'Spearheaded global enterprise AI roadmaps. Delivered production-grade automation reaching 200,000+ monthly interactions and enabling safe, enterprise-data-grounded artifact creation.',
  },
  {
    year: '2022–2024',
    title: 'Senior Product Manager',
    company: 'Fortune 200 Enterprise',
    description:
      'Led a portfolio of seven products and a 30-person team, influencing $1B in revenue generation and significantly improving pursuit win rates through AI empowerment.',
  },
  {
    year: '2016–2021',
    title: 'Co-Founder & CPO/COO',
    company: 'Archer Technologies',
    description:
      'Scaled multiple construction SaaS solutions from zero to $10M in annual revenue with a 60-member team.',
  },
  {
    year: '2014–2016',
    title: 'Co-Founder',
    company: 'LetzSLAB',
    description:
      'Launched a peer-to-peer equipment sharing platform for the construction industry with 11,000+ listings.',
  },
  {
    year: '2010–2014',
    title: 'Project & Design Manager',
    company: 'M+W Group',
    description:
      'Directed the design and construction of massive industrial facilities for global clients like Michelin and Dana.',
  },
  {
    year: '2007–2009',
    title: 'Architect Team Leader',
    company: 'IAAD',
    description:
      'Pioneered the conceptual design for GIFT City and large-scale automatic infrastructure projects in India.',
  },
];

const FALLBACK_PILLARS: StrategyPillar[] = [
  {
    id: 'p1',
    icon: 'Target',
    title: 'Measurable Agentic Automation',
    description:
      "Prioritizing Hero Workflows with obvious automation potential and measurable ROI. Agentic systems performing complex tasks autonomously within guarded parameters.",
  },
  {
    id: 'p2',
    icon: 'Users',
    title: 'AI Literacy & Bridging',
    description:
      'Providing the workforce with tools to build familiarity and serve as a bridge to a more mature AI future.',
  },
  {
    id: 'p3',
    icon: 'ShieldCheck',
    title: 'Responsible AI & Risk Mitigation',
    description:
      'Grounding outcomes in high-quality enterprise data and including Human-in-the-Loop where necessary to ensure safety and contextual accuracy.',
  },
];

const FALLBACK_AIDAD: AiDadContent = {
  strategyTitle: 'Enterprise AI Strategy: The Three Buckets',
  aiPillars: FALLBACK_PILLARS.map((p) => ({
    title: p.title,
    description: p.description,
    icon: p.icon,
  })),
  frameworkPDFUrl: null,
  frameworkImageUrl: null,
  philosophyImageUrl: null,
  missionStatement:
    "Bridging the visibility gap between executive intent and engineering execution to prevent Strategic Failure in AI implementations.",
  keyMetrics: [
    { value: '200K+', label: 'Monthly Interactions', description: 'Production-grade AI automation interactions delivered at a Fortune 200 Enterprise' },
    { value: '$1B', label: 'Revenue Influenced', description: 'Revenue generation influenced through AI-empowered pursuit strategies' },
    { value: '$10M', label: 'ARR Built', description: 'Annual revenue scaled from zero at Archer Technologies' },
  ],
  quote: "Leadership is about providing clarity in chaos. My approach combines the rigorous discipline of an engineer with the adaptive agility of a product leader, ensuring that every technological shift is grounded in human value.",
  leadershipPhilosophy: [
    "Outcome First: Products must achieve the specific goals they were designed for. Before a single line of code is written, KPIs and BHAGs must be crystal clear.",
    "The Build vs. Buy Logic: If the build ROI is negligible, we buy. We only build for high-differentiation where we own the core value proposition.",
    "The Intuition Test: If you need to teach a product, you have built the wrong thing.",
  ],
};

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj1',
    title: 'SARTH(A)i: Enterprise AI Alignment',
    slug: 'sarthai',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: '/videos/sarthai-demo.mp4',
    description:
      'Bridging the visibility gap between executive intent and engineering execution to prevent Strategic Failure in AI implementations. An active governance architecture for enterprise AI programs.',
    tech: ['AI Governance', 'Enterprise Architecture', 'Product Strategy', 'RAG'],
    status: 'active',
    link: '#',
  },
  {
    id: 'proj2',
    title: 'CricketIQ: Expert AI Coaching',
    slug: 'cricketiq',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: null,
    description:
      'Access to expert-level cricket intelligence through multi-modal RAG systems grounded in real match data and vision analysis. Built and deployed on Replit.',
    tech: ['Gemini Pro', 'RAG', 'Computer Vision', 'Replit'],
    status: 'active',
    link: 'https://cricket-coach-ai.replit.app',
  },
  {
    id: 'proj3',
    title: 'HomeDecider: Data-Driven Real Estate',
    slug: 'homedecider',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: null,
    description:
      "Smarter Rent vs. Buy decisions using live market data from FRED and neighborhood analysis. Built and deployed on Streamlit.",
    tech: ['Python', 'Streamlit', 'FRED API', 'Data Analysis'],
    status: 'active',
    link: 'https://home-decider-saritsethi.replit.app',
  },
  {
    id: 'proj4',
    title: 'sarit.tech Digital Twin',
    slug: 'sarit-tech-digital-twin',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: null,
    description:
      "A high-conversion storefront and always-on concierge speaking in a direct, industrial minimalist tone. Live production AI digital twin powered by Gemini and RAG.",
    tech: ['Gemini AI', 'RAG', 'React', 'PostgreSQL', 'Sanity CMS'],
    status: 'active',
    link: 'https://sarit.tech',
  },
];

// ---------------------------------------------------------------------------
// Block content helper (for legacy siteSettings endpoint)
// ---------------------------------------------------------------------------

function blockContentToText(
  blocks?: Array<{ children?: Array<{ text?: string }> }>,
): string[] {
  if (!blocks || blocks.length === 0) return [];
  return blocks
    .map((block) =>
      (block.children ?? [])
        .map((child) => child.text ?? '')
        .join(''),
    )
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Per-page hooks
// ---------------------------------------------------------------------------

export function useHomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<HomeContent>(FALLBACK_HOME);

  useEffect(() => {
    let mounted = true;
    apiFetch<HomeContent>('/api/content/home').then(({ data, ready }) => {
      if (!mounted) return;
      if (ready && data) {
        setContent({
          heroHeadline: data.heroHeadline || FALLBACK_HOME.heroHeadline,
          heroSubtext: data.heroSubtext || FALLBACK_HOME.heroSubtext,
          heroImageUrl: data.heroImageUrl ?? null,
          heroImageHotspot: data.heroImageHotspot ?? null,
          heroBackgroundImageUrl: data.heroBackgroundImageUrl ?? null,
          primaryCTA: data.primaryCTA || FALLBACK_HOME.primaryCTA,
        });
      }
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { isLoading, content };
}

export function useAboutContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<AboutContent>(FALLBACK_ABOUT);

  useEffect(() => {
    let mounted = true;
    apiFetch<AboutContent>('/api/content/about').then(({ data, ready }) => {
      if (!mounted) return;
      if (ready && data) {
        setContent({
          portraitUrl: data.portraitUrl ?? null,
          portraitHotspot: data.portraitHotspot ?? null,
          explorerImageUrl: data.explorerImageUrl ?? null,
          bikingImageUrl: data.bikingImageUrl ?? null,
          bookCoverImageUrl: data.bookCoverImageUrl ?? null,
          narrative: data.narrative?.length ? data.narrative : FALLBACK_ABOUT.narrative,
          cricketStats: data.cricketStats ?? [],
        });
      }
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { isLoading, content };
}

export function useAiDadContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [leadership, setLeadership] = useState<AiDadContent>(FALLBACK_AIDAD);
  const [timeline, setTimeline] = useState<TimelineItem[]>(FALLBACK_TIMELINE);
  const [pillars, setPillars] = useState<StrategyPillar[]>(FALLBACK_PILLARS);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch<AiDadContent>('/api/content/leadership'),
      apiFetch<TimelineItem[]>('/api/content/timeline'),
      apiFetch<StrategyPillar[]>('/api/content/pillars'),
    ]).then(([l, t, p]) => {
      if (!mounted) return;
      if (l.ready && l.data) {
        const d = l.data as Record<string, unknown>;
        const philosophy = blockContentToText(
          d.leadershipPhilosophy as Array<{ children?: Array<{ text?: string }> }> | undefined,
        );
        setLeadership({
          strategyTitle: (d.strategyTitle as string) || FALLBACK_AIDAD.strategyTitle,
          aiPillars: (d.aiPillars as AiPillar[] | null)?.length
            ? (d.aiPillars as AiPillar[])
            : FALLBACK_AIDAD.aiPillars,
          frameworkPDFUrl: (d.frameworkPDFUrl as string | null) ?? null,
          frameworkImageUrl: (d.frameworkImageUrl as string | null) ?? null,
          philosophyImageUrl: (d.philosophyImageUrl as string | null) ?? null,
          missionStatement: (d.missionStatement as string) || FALLBACK_AIDAD.missionStatement,
          keyMetrics: (d.keyMetrics as KeyMetric[] | null)?.length
            ? (d.keyMetrics as KeyMetric[])
            : FALLBACK_AIDAD.keyMetrics,
          quote: (d.quote as string) || FALLBACK_AIDAD.quote,
          leadershipPhilosophy: philosophy.length ? philosophy : FALLBACK_AIDAD.leadershipPhilosophy,
        });
      }
      if (t.ready && t.data?.length) setTimeline(t.data);
      if (p.ready && p.data?.length) setPillars(p.data);
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { isLoading, leadership, timeline, pillars };
}

export function useProjectsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);

  useEffect(() => {
    let mounted = true;
    apiFetch<Project[]>('/api/content/projects').then(({ data, ready }) => {
      if (!mounted) return;
      if (ready && data?.length) setProjects(data);
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { isLoading, projects };
}

// ---------------------------------------------------------------------------
// Legacy combined hook — kept for backward compatibility
// ---------------------------------------------------------------------------

interface SanitySiteSettings {
  heroHeadline?: string;
  heroSubheadline?: string;
  heroBadgeText?: string;
  aboutNarrative?: Array<{ children?: Array<{ text?: string }> }>;
  profileImageUrl?: string;
  calendarBookingUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  emailAddress?: string;
  substackUrl?: string;
}

async function fetchSettings(): Promise<SiteSettings> {
  const { data, ready } = await apiFetch<SanitySiteSettings>('/api/content/settings');
  if (!ready || !data) return FALLBACK_SETTINGS;
  const paragraphs = blockContentToText(data.aboutNarrative);
  return {
    heroHeadline: data.heroHeadline || FALLBACK_SETTINGS.heroHeadline,
    heroSubheadline: data.heroSubheadline || FALLBACK_SETTINGS.heroSubheadline,
    heroBadgeText: data.heroBadgeText || FALLBACK_SETTINGS.heroBadgeText,
    aboutNarrativeParagraphs:
      paragraphs.length > 0 ? paragraphs : FALLBACK_SETTINGS.aboutNarrativeParagraphs,
    profileImageUrl: data.profileImageUrl || FALLBACK_SETTINGS.profileImageUrl,
    calendarBookingUrl: data.calendarBookingUrl || FALLBACK_SETTINGS.calendarBookingUrl,
    social: {
      linkedin: data.linkedinUrl || FALLBACK_SETTINGS.social.linkedin,
      twitter: data.twitterUrl || FALLBACK_SETTINGS.social.twitter,
      github: data.githubUrl || FALLBACK_SETTINGS.social.github,
      email: data.emailAddress ? `mailto:${data.emailAddress}` : FALLBACK_SETTINGS.social.email,
    },
    substackUrl: data.substackUrl || FALLBACK_SETTINGS.substackUrl,
  };
}

export function useContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(FALLBACK_TIMELINE);
  const [pillars, setPillars] = useState<StrategyPillar[]>(FALLBACK_PILLARS);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchSettings(),
      apiFetch<TimelineItem[]>('/api/content/timeline'),
      apiFetch<StrategyPillar[]>('/api/content/pillars'),
      apiFetch<Project[]>('/api/content/projects'),
    ]).then(([s, t, p, proj]) => {
      if (!mounted) return;
      setSettings(s);
      if (t.ready && t.data?.length) setTimeline(t.data);
      if (p.ready && p.data?.length) setPillars(p.data);
      if (proj.ready && proj.data?.length) setProjects(proj.data);
      setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { isLoading, settings, timeline, pillars, projects };
}

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
  missionStatement: string;
  keyMetrics: KeyMetric[];
  quote: string;
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
  heroHeadline: 'Building ROI-First AI Solutions',
  heroSubheadline:
    'Bridging the gap between construction tech execution and enterprise AI strategy. I build systems that solve real problems, not just cool tech demos.',
  heroBadgeText: 'AI Product Leader',
  aboutNarrativeParagraphs: [
    "From the construction sites of Toronto to the AI boardrooms of Chicago — my journey is one of relentless translation. I've always sat at the uncomfortable intersection of the deeply technical and the strategically human.",
    "As a product leader, I architect realistic, scalable, and ethical pathways for AI adoption in industries that others write off as \"too legacy.\" I don't just advocate for AI — I make it work.",
  ],
  profileImageUrl: '',
  calendarBookingUrl: 'https://calendar.app.google/PTXjuRKDb97Qyp3B6',
  social: {
    linkedin: 'https://linkedin.com/in/saritsethi',
    twitter: 'https://twitter.com/saritsethi',
    github: 'https://github.com/saritsethi',
    email: 'mailto:hello@sarit.tech',
  },
  substackUrl: 'https://substack.com/@saritsethi',
};

const FALLBACK_HOME: HomeContent = {
  heroHeadline: 'Building ROI-First AI Solutions',
  heroSubtext:
    'Bridging the gap between construction tech execution and enterprise AI strategy. I build systems that solve real problems, not just cool tech demos.',
  heroImageUrl: null,
  heroImageHotspot: null,
  primaryCTA: 'Book a Strategy Call',
};

const FALLBACK_ABOUT: AboutContent = {
  portraitUrl: null,
  portraitHotspot: null,
  narrative: [
    "From the construction sites of Toronto to the AI boardrooms of Chicago — my journey is one of relentless translation. I've always sat at the uncomfortable intersection of the deeply technical and the strategically human.",
    "As a product leader, I architect realistic, scalable, and ethical pathways for AI adoption in industries that others write off as \"too legacy.\" I don't just advocate for AI — I make it work.",
  ],
  cricketStats: [],
};

const FALLBACK_TIMELINE: TimelineItem[] = [
  {
    year: '2023 - Present',
    title: 'AI Product Leader',
    company: 'Enterprise AI Solutions',
    description:
      'Spearheading ROI-driven AI deployments for Fortune 500 companies. Architecting Digital Twins and RAG-based systems that reduce operational bottlenecks by 40%.',
  },
  {
    year: '2020 - 2023',
    title: 'Head of Product',
    company: 'Construction Tech Innovators · Chicago',
    description:
      'Led the digital transformation of legacy construction workflows. Bridged the gap between field execution and boardroom strategy.',
  },
  {
    year: '2016 - 2020',
    title: 'Senior Product Manager',
    company: 'BuildCorp · Toronto',
    description:
      'Managed a portfolio of predictive analytics tools for project lifecycle management, resulting in a 25% increase in resource efficiency.',
  },
  {
    year: '2012 - 2016',
    title: 'Product Analyst',
    company: 'Tech Ventures · Delhi',
    description:
      'Started as an analyst at a product consultancy in Delhi, learning the foundations of user research, agile delivery, and technology strategy.',
  },
];

const FALLBACK_PILLARS: StrategyPillar[] = [
  {
    id: 'p1',
    icon: 'Target',
    title: 'ROI-First Discovery',
    description: "Aligning AI capabilities with quantifiable business outcomes. No tech for tech's sake.",
  },
  {
    id: 'p2',
    icon: 'Users',
    title: 'Cross-Functional Alignment',
    description:
      'Bridging engineering, design, and executive stakeholders to ensure adoption and real-world impact.',
  },
  {
    id: 'p3',
    icon: 'Layers',
    title: 'Scalable Architecture',
    description:
      'Designing systems that grow with the enterprise, prioritizing security, modularity, and maintainability.',
  },
  {
    id: 'p4',
    icon: 'ShieldCheck',
    title: 'Ethical AI Deployment',
    description:
      'Ensuring models are transparent, unbiased, and compliant with evolving global regulations.',
  },
];

const FALLBACK_AIDAD: AiDadContent = {
  strategyTitle: 'My AI Leadership Framework',
  aiPillars: FALLBACK_PILLARS.map((p) => ({
    title: p.title,
    description: p.description,
    icon: p.icon,
  })),
  frameworkPDFUrl: null,
  missionStatement:
    "I don't just build AI products — I teach them to think like humans, and teach humans to think like engineers.",
  keyMetrics: [
    { value: '40%', label: 'Cost Reduction', description: 'Average operational cost reduction across deployments' },
    { value: '10K+', label: 'Users Impacted', description: 'Professionals using AI tools I shipped' },
    { value: '87%', label: 'Adoption Rate', description: 'Enterprise AI adoption rate vs 34% industry avg' },
  ],
  quote: "The best AI strategy isn't the most complex one — it's the one your team actually uses.",
};

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj1',
    title: 'Cricket Coach AI',
    slug: 'cricket-coach-ai',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: null,
    description:
      'An AI-powered coaching assistant that analyzes batting/bowling technique via video, generates personalized training plans, and tracks performance metrics over time.',
    tech: ['Python', 'Computer Vision', 'Gemini Pro', 'React Native'],
    status: 'active',
    link: '#',
  },
  {
    id: 'proj2',
    title: 'Sarth(A)i',
    slug: 'sarthai',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: null,
    description:
      'A next-generation AI assistant platform designed to serve as a personal digital twin for knowledge workers — remembering context, drafting decisions, and surfacing insights.',
    tech: ['LangChain', 'Vector DB', 'FastAPI', 'React'],
    status: 'active',
    link: '#',
  },
  {
    id: 'proj3',
    title: 'Enterprise RAG System',
    slug: 'enterprise-rag',
    thumbnailUrl: null,
    thumbnailHotspot: null,
    videoUrl: null,
    description:
      'Secure, scalable retrieval-augmented generation pipeline deployed across a 10,000+ employee organization to unify internal knowledge and cut answer time by 60%.',
    tech: ['Gemini Pro', 'Pinecone', 'FastAPI', 'Docker'],
    status: 'active',
    link: '#',
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
        setLeadership({
          strategyTitle: (d.strategyTitle as string) || FALLBACK_AIDAD.strategyTitle,
          aiPillars: (d.aiPillars as AiPillar[] | null)?.length
            ? (d.aiPillars as AiPillar[])
            : FALLBACK_AIDAD.aiPillars,
          frameworkPDFUrl: (d.frameworkPDFUrl as string | null) ?? null,
          missionStatement: (d.missionStatement as string) || FALLBACK_AIDAD.missionStatement,
          keyMetrics: (d.keyMetrics as KeyMetric[] | null)?.length
            ? (d.keyMetrics as KeyMetric[])
            : FALLBACK_AIDAD.keyMetrics,
          quote: (d.quote as string) || FALLBACK_AIDAD.quote,
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

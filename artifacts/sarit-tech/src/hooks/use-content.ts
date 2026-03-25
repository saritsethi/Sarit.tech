import { useState, useEffect } from 'react';

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

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
}

export interface Article {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  link: string;
}

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

const FALLBACK_SETTINGS: SiteSettings = {
  heroHeadline: 'Building ROI-First AI Solutions',
  heroSubheadline:
    'Bridging the gap between construction tech execution and enterprise AI strategy. I build systems that solve real problems, not just cool tech demos.',
  heroBadgeText: 'AI Product Leader',
  aboutNarrativeParagraphs: [
    'From the construction sites of Toronto to the AI boardrooms of Chicago — my journey is one of relentless translation. I\'ve always sat at the uncomfortable intersection of the deeply technical and the strategically human.',
    'As a product leader, I architect realistic, scalable, and ethical pathways for AI adoption in industries that others write off as "too legacy." I don\'t just advocate for AI — I make it work.',
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

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj1',
    title: 'Cricket Coach AI',
    description:
      'An AI-powered coaching assistant that analyzes batting/bowling technique via video, generates personalized training plans, and tracks performance metrics over time.',
    tech: ['Python', 'Computer Vision', 'Gemini Pro', 'React Native'],
    link: '#',
  },
  {
    id: 'proj2',
    title: 'Sarth(A)i',
    description:
      'A next-generation AI assistant platform designed to serve as a personal digital twin for knowledge workers — remembering context, drafting decisions, and surfacing insights.',
    tech: ['LangChain', 'Vector DB', 'FastAPI', 'React'],
    link: '#',
  },
  {
    id: 'proj3',
    title: 'Enterprise RAG System',
    description:
      'Secure, scalable retrieval-augmented generation pipeline deployed across a 10,000+ employee organization to unify internal knowledge and cut answer time by 60%.',
    tech: ['Gemini Pro', 'Pinecone', 'FastAPI', 'Docker'],
    link: '#',
  },
];

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

const baseUrl = () => import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${baseUrl()}/api/content/settings`);
    if (!res.ok) return FALLBACK_SETTINGS;
    const { data, ready } = (await res.json()) as { data: SanitySiteSettings | null; ready: boolean };
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
  } catch {
    return FALLBACK_SETTINGS;
  }
}

async function fetchTimeline(): Promise<TimelineItem[]> {
  try {
    const res = await fetch(`${baseUrl()}/api/content/timeline`);
    if (!res.ok) return FALLBACK_TIMELINE;
    const { data, ready } = (await res.json()) as { data: TimelineItem[] | null; ready: boolean };
    if (!ready || !data || data.length === 0) return FALLBACK_TIMELINE;
    return data;
  } catch {
    return FALLBACK_TIMELINE;
  }
}

async function fetchPillars(): Promise<StrategyPillar[]> {
  try {
    const res = await fetch(`${baseUrl()}/api/content/pillars`);
    if (!res.ok) return FALLBACK_PILLARS;
    const { data, ready } = (await res.json()) as { data: StrategyPillar[] | null; ready: boolean };
    if (!ready || !data || data.length === 0) return FALLBACK_PILLARS;
    return data;
  } catch {
    return FALLBACK_PILLARS;
  }
}

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${baseUrl()}/api/content/projects`);
    if (!res.ok) return FALLBACK_PROJECTS;
    const { data, ready } = (await res.json()) as { data: Project[] | null; ready: boolean };
    if (!ready || !data || data.length === 0) return FALLBACK_PROJECTS;
    return data;
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export function useContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(FALLBACK_TIMELINE);
  const [pillars, setPillars] = useState<StrategyPillar[]>(FALLBACK_PILLARS);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [
        fetchedSettings,
        fetchedTimeline,
        fetchedPillars,
        fetchedProjects,
      ] = await Promise.all([
        fetchSettings(),
        fetchTimeline(),
        fetchPillars(),
        fetchProjects(),
      ]);
      if (!mounted) return;
      setSettings(fetchedSettings);
      setTimeline(fetchedTimeline);
      setPillars(fetchedPillars);
      setProjects(fetchedProjects);
      setIsLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { isLoading, settings, timeline, pillars, projects };
}

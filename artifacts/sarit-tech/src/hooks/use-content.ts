import { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID || 'placeholder';
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || 'production';
const SANITY_TOKEN = import.meta.env.VITE_SANITY_API_TOKEN;
const sanityReady = SANITY_PROJECT_ID !== 'placeholder';

const sanityClient = sanityReady
  ? createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      useCdn: true,
      apiVersion: '2024-01-01',
      token: SANITY_TOKEN,
    })
  : null;

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
    'My journey spans from navigating the complexities of construction tech in Toronto to driving Enterprise AI strategy in Chicago. I\'m passionate about building systems that make people\'s lives easier and businesses more efficient.',
    'As a product leader, I sit at the intersection of deeply technical architecture and high-level executive strategy. I don\'t just advocate for AI—I architect realistic, scalable, and ethical pathways for its adoption in legacy industries.',
  ],
  profileImageUrl: '',
  calendarBookingUrl: 'https://calendar.app.google/PTXjuRKDb97Qyp3B6',
  social: {
    linkedin: 'https://linkedin.com/in/saritsethi',
    twitter: 'https://twitter.com/saritsethi',
    github: 'https://github.com/saritsethi',
    email: 'mailto:hello@sarit.tech',
  },
  substackUrl: 'https://saritsethi.substack.com',
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
    company: 'Construction Tech Innovators',
    description:
      'Led the digital transformation of legacy construction workflows. Bridged the gap between field execution and boardroom strategy in Chicago.',
  },
  {
    year: '2016 - 2020',
    title: 'Senior Product Manager',
    company: 'BuildCorp Toronto',
    description:
      'Managed a portfolio of predictive analytics tools for project lifecycle management, resulting in a 25% increase in resource efficiency.',
  },
];

const FALLBACK_PILLARS: StrategyPillar[] = [
  {
    id: 'p1',
    icon: 'Target',
    title: 'ROI-First Discovery',
    description: 'Aligning AI capabilities with quantifiable business outcomes. No tech for tech\'s sake.',
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
    title: 'AI Twin Architecture',
    description:
      'A framework for generating highly contextualized digital twins for subject matter experts, utilizing advanced RAG and LLM orchestration.',
    tech: ['Python', 'LangChain', 'Vector DB', 'React'],
    link: '#',
  },
  {
    id: 'proj2',
    title: 'Enterprise RAG System',
    description:
      'Secure, scalable retrieval-augmented generation pipeline deployed across a 10,000+ employee organization to unify internal knowledge.',
    tech: ['Gemini Pro', 'Pinecone', 'FastAPI', 'Docker'],
    link: '#',
  },
  {
    id: 'proj3',
    title: 'Construction Predictive Analytics',
    description:
      'Machine learning model predicting material supply chain delays with 87% accuracy, saving millions in operational downtime.',
    tech: ['TensorFlow', 'PostgreSQL', 'AWS', 'Next.js'],
    link: '#',
  },
];

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'art1',
    title: 'Why Most Enterprise AI Initiatives Fail (And How to Fix Them)',
    date: 'Oct 12, 2023',
    excerpt:
      'The disconnect between pilot excitement and production reality is killing AI ROI. Here\'s the framework to bridge the gap.',
    link: 'https://saritsethi.substack.com',
  },
  {
    id: 'art2',
    title: 'From Hardhats to LLMs: Lessons in Change Management',
    date: 'Sep 28, 2023',
    excerpt:
      'What leading digital transformation in legacy construction taught me about deploying AI in the modern enterprise.',
    link: 'https://saritsethi.substack.com',
  },
  {
    id: 'art3',
    title: 'The Rise of the Digital Twin in Executive Leadership',
    date: 'Sep 15, 2023',
    excerpt:
      'Scaling your decision-making and knowledge sharing through specialized, context-aware AI agents.',
    link: 'https://saritsethi.substack.com',
  },
];

async function fetchSanityContent<T>(query: string, fallback: T): Promise<T> {
  if (!sanityClient) return fallback;
  try {
    const result = await sanityClient.fetch<T>(query);
    return result && (Array.isArray(result) ? result.length > 0 : true) ? result : fallback;
  } catch {
    return fallback;
  }
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

async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!sanityClient) return FALLBACK_SETTINGS;
  try {
    const raw = await sanityClient.fetch<SanitySiteSettings>(
      `*[_type == "siteSettings"][0]{
        heroHeadline, heroSubheadline, heroBadgeText,
        aboutNarrative, profileImageUrl,
        calendarBookingUrl, linkedinUrl, twitterUrl, githubUrl, emailAddress,
        substackUrl
      }`,
    );
    if (!raw) return FALLBACK_SETTINGS;
    const paragraphs = blockContentToText(raw.aboutNarrative);
    return {
      heroHeadline: raw.heroHeadline || FALLBACK_SETTINGS.heroHeadline,
      heroSubheadline: raw.heroSubheadline || FALLBACK_SETTINGS.heroSubheadline,
      heroBadgeText: raw.heroBadgeText || FALLBACK_SETTINGS.heroBadgeText,
      aboutNarrativeParagraphs:
        paragraphs.length > 0 ? paragraphs : FALLBACK_SETTINGS.aboutNarrativeParagraphs,
      profileImageUrl: raw.profileImageUrl || FALLBACK_SETTINGS.profileImageUrl,
      calendarBookingUrl: raw.calendarBookingUrl || FALLBACK_SETTINGS.calendarBookingUrl,
      social: {
        linkedin: raw.linkedinUrl || FALLBACK_SETTINGS.social.linkedin,
        twitter: raw.twitterUrl || FALLBACK_SETTINGS.social.twitter,
        github: raw.githubUrl || FALLBACK_SETTINGS.social.github,
        email: raw.emailAddress ? `mailto:${raw.emailAddress}` : FALLBACK_SETTINGS.social.email,
      },
      substackUrl: raw.substackUrl || FALLBACK_SETTINGS.substackUrl,
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}

interface RssFeedItem {
  guid?: string;
  title: string;
  pubDate?: string;
  description: string;
  link: string;
}

async function fetchSubstackArticles(): Promise<Article[]> {
  try {
    const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
    const res = await fetch(`${baseUrl}/api/rss/substack`);
    if (!res.ok) return FALLBACK_ARTICLES;
    const data = (await res.json()) as { items?: RssFeedItem[] };
    if (!data.items || data.items.length === 0) return FALLBACK_ARTICLES;
    return data.items.map((item, i) => ({
      id: item.guid || String(i),
      title: item.title,
      date: item.pubDate
        ? new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '',
      excerpt: item.description,
      link: item.link,
    }));
  } catch {
    return FALLBACK_ARTICLES;
  }
}

export function useContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(FALLBACK_TIMELINE);
  const [pillars, setPillars] = useState<StrategyPillar[]>(FALLBACK_PILLARS);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [
        fetchedSettings,
        fetchedTimeline,
        fetchedPillars,
        fetchedProjects,
        fetchedArticles,
      ] = await Promise.all([
        fetchSiteSettings(),
        fetchSanityContent<TimelineItem[]>(
          `*[_type == "timeline"] | order(order asc)`,
          FALLBACK_TIMELINE,
        ),
        fetchSanityContent<StrategyPillar[]>(
          `*[_type == "strategyPillar"] | order(order asc)`,
          FALLBACK_PILLARS,
        ),
        fetchSanityContent<Project[]>(
          `*[_type == "project"] | order(order asc)`,
          FALLBACK_PROJECTS,
        ),
        fetchSubstackArticles(),
      ]);
      if (!mounted) return;
      setSettings(fetchedSettings);
      setTimeline(fetchedTimeline);
      setPillars(fetchedPillars);
      setProjects(fetchedProjects);
      setArticles(fetchedArticles);
      setIsLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { isLoading, settings, timeline, pillars, projects, articles };
}

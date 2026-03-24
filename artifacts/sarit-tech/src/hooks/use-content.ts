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

const FALLBACK_TIMELINE: TimelineItem[] = [
  {
    year: "2023 - Present",
    title: "AI Product Leader",
    company: "Enterprise AI Solutions",
    description: "Spearheading ROI-driven AI deployments for Fortune 500 companies. Architecting Digital Twins and RAG-based systems that reduce operational bottlenecks by 40%.",
  },
  {
    year: "2020 - 2023",
    title: "Head of Product",
    company: "Construction Tech Innovators",
    description: "Led the digital transformation of legacy construction workflows. Bridged the gap between field execution and boardroom strategy in Chicago.",
  },
  {
    year: "2016 - 2020",
    title: "Senior Product Manager",
    company: "BuildCorp Toronto",
    description: "Managed a portfolio of predictive analytics tools for project lifecycle management, resulting in a 25% increase in resource efficiency.",
  },
];

const FALLBACK_PILLARS: StrategyPillar[] = [
  {
    id: "p1",
    icon: "Target",
    title: "ROI-First Discovery",
    description: "Aligning AI capabilities with quantifiable business outcomes. No tech for tech's sake.",
  },
  {
    id: "p2",
    icon: "Users",
    title: "Cross-Functional Alignment",
    description: "Bridging engineering, design, and executive stakeholders to ensure adoption and real-world impact.",
  },
  {
    id: "p3",
    icon: "Layers",
    title: "Scalable Architecture",
    description: "Designing systems that grow with the enterprise, prioritizing security, modularity, and maintainability.",
  },
  {
    id: "p4",
    icon: "ShieldCheck",
    title: "Ethical AI Deployment",
    description: "Ensuring models are transparent, unbiased, and compliant with evolving global regulations.",
  },
];

const FALLBACK_PROJECTS: Project[] = [
  {
    id: "proj1",
    title: "AI Twin Architecture",
    description: "A framework for generating highly contextualized digital twins for subject matter experts, utilizing advanced RAG and LLM orchestration.",
    tech: ["Python", "LangChain", "Vector DB", "React"],
    link: "#",
  },
  {
    id: "proj2",
    title: "Enterprise RAG System",
    description: "Secure, scalable retrieval-augmented generation pipeline deployed across a 10,000+ employee organization to unify internal knowledge.",
    tech: ["Gemini Pro", "Pinecone", "FastAPI", "Docker"],
    link: "#",
  },
  {
    id: "proj3",
    title: "Construction Predictive Analytics",
    description: "Machine learning model predicting material supply chain delays with 87% accuracy, saving millions in operational downtime.",
    tech: ["TensorFlow", "PostgreSQL", "AWS", "Next.js"],
    link: "#",
  },
];

const FALLBACK_ARTICLES: Article[] = [
  {
    id: "art1",
    title: "Why Most Enterprise AI Initiatives Fail (And How to Fix Them)",
    date: "Oct 12, 2023",
    excerpt: "The disconnect between pilot excitement and production reality is killing AI ROI. Here's the framework to bridge the gap.",
    link: "https://saritsethi.substack.com",
  },
  {
    id: "art2",
    title: "From Hardhats to LLMs: Lessons in Change Management",
    date: "Sep 28, 2023",
    excerpt: "What leading digital transformation in legacy construction taught me about deploying AI in the modern enterprise.",
    link: "https://saritsethi.substack.com",
  },
  {
    id: "art3",
    title: "The Rise of the Digital Twin in Executive Leadership",
    date: "Sep 15, 2023",
    excerpt: "Scaling your decision-making and knowledge sharing through specialized, context-aware AI agents.",
    link: "https://saritsethi.substack.com",
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

async function fetchSubstackArticles(): Promise<Article[]> {
  try {
    const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
    const res = await fetch(`${baseUrl}/api/rss/substack`);
    if (!res.ok) return FALLBACK_ARTICLES;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return FALLBACK_ARTICLES;
    interface RssFeedItem {
      guid?: string;
      title: string;
      pubDate?: string;
      description: string;
      link: string;
    }
    return (data.items as RssFeedItem[]).map((item, i) => ({
      id: item.guid || String(i),
      title: item.title,
      date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
      excerpt: item.description,
      link: item.link,
    }));
  } catch {
    return FALLBACK_ARTICLES;
  }
}

export function useContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>(FALLBACK_TIMELINE);
  const [pillars, setPillars] = useState<StrategyPillar[]>(FALLBACK_PILLARS);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [fetchedTimeline, fetchedPillars, fetchedProjects, fetchedArticles] = await Promise.all([
        fetchSanityContent(`*[_type == "timeline"] | order(year desc)`, FALLBACK_TIMELINE),
        fetchSanityContent(`*[_type == "strategyPillar"]`, FALLBACK_PILLARS),
        fetchSanityContent(`*[_type == "project"]`, FALLBACK_PROJECTS),
        fetchSubstackArticles(),
      ]);
      if (!mounted) return;
      setTimeline(fetchedTimeline);
      setPillars(fetchedPillars);
      setProjects(fetchedProjects);
      setArticles(fetchedArticles);
      setIsLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  return { isLoading, timeline, pillars, projects, articles };
}

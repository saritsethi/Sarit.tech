import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { useProjectsContent } from '@/hooks/use-content';
import { useSectionTracking } from '@/hooks/use-analytics';
import { useAnalytics } from '@/hooks/use-analytics';
import { ArrowUpRight, Play, X, Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

function resolveVideoUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ---------------------------------------------------------------------------
// Video Modal
// ---------------------------------------------------------------------------
function VideoModal({
  videoUrl,
  title,
  onClose,
}: {
  videoUrl: string;
  title: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => videoRef.current?.play().catch(() => {}), 300);
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,10,24,0.95)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-4xl mx-4"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Video Tile
// ---------------------------------------------------------------------------
function ProjectTile({
  project,
  index,
  onPlay,
}: {
  project: {
    id: string;
    title: string;
    slug: string | null;
    description: string;
    tech: string[];
    status: string;
    link: string;
    videoUrl: string | null;
    thumbnailUrl: string | null;
  };
  index: number;
  onPlay: () => void;
}) {
  const { trackEvent } = useAnalytics();
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolvedVideo = resolveVideoUrl(project.videoUrl);
  const hasVideo = !!resolvedVideo;
  const hasLink = project.link && project.link !== '#';

  const handlePlay = () => {
    trackEvent('project_video_played', { project: project.title });
    onPlay();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="group flex flex-col rounded-2xl border border-white/10 bg-card overflow-hidden hover:border-primary/40 transition-colors duration-300"
    >
      {/* Thumbnail / video preview area */}
      <div className="relative aspect-video bg-secondary overflow-hidden flex-shrink-0">
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              src={resolvedVideo}
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
              onMouseEnter={() => { videoRef.current?.play().catch(() => {}); }}
              onMouseLeave={() => {
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
            />
            {/* Play button overlay */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center group/play"
            >
              <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/40 group-hover/play:scale-110 group-hover/play:bg-primary transition-all duration-200">
                <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
              </div>
            </button>
          </>
        ) : project.thumbnailUrl ? (
          <>
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Play className="w-5 h-5 text-white/40 fill-white/40 ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          /* Placeholder when no video/thumbnail */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(45,212,191,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.15) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-white/20 fill-white/20 ml-0.5" />
            </div>
            <span className="text-xs text-white/30 font-medium relative z-10">Video coming soon</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm uppercase tracking-wider">
            {project.status === 'coming-soon' ? 'Coming Soon' : 'Live'}
          </span>
        </div>

        {/* Stealth ribbon — SARTH(A)i only */}
        {project.slug === 'sarthai' && (
          <div
            className="absolute top-5 right-[-30px] rotate-45 w-32 py-[5px] text-center text-[9px] font-bold tracking-[0.2em] uppercase pointer-events-none select-none"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              boxShadow: '0 2px 12px rgba(124,58,237,0.5)',
              color: '#fff',
              letterSpacing: '0.18em',
            }}
          >
            Stealth
          </div>
        )}

        {/* External link — top right */}
        {hasLink && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('project_link_clicked', { project: project.title })}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-display font-bold text-white leading-snug">{project.title}</h3>
          {hasLink && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('project_link_clicked', { project: project.title })}
              className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/8 text-white/50 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-white/60 border border-white/5"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Projects() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { projects } = useProjectsContent();
  useSectionTracking('builder_page', true);

  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  return (
    <Layout>
      <AnimatePresence>
        {activeVideo && (
          <VideoModal
            videoUrl={activeVideo.url}
            title={activeVideo.title}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>

      {/* Page Hero */}
      <section className="pt-32 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                The Proof
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4">
                The Builder
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl font-light leading-relaxed">
                The best product leaders stay hands-on. Here are selected systems and
                architectures I've built — from AI coaching to enterprise RAG.
              </p>
            </div>
            <a
              href="https://github.com/saritsethi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button variant="outline" size="sm" className="border-white/10 hover:border-primary/50">
                <Github className="w-4 h-4 mr-2" />
                View GitHub
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid — 2×2 on desktop, 1 col on mobile */}
      <section ref={sectionRef} className="py-10 pb-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {projects.map((project, i) => {
              const resolvedVideo = resolveVideoUrl(project.videoUrl);
              return (
                <ProjectTile
                  key={project.id}
                  project={project}
                  index={i}
                  onPlay={() => {
                    if (resolvedVideo) setActiveVideo({ url: resolvedVideo, title: project.title });
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}

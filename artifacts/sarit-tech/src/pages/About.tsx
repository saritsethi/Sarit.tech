import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layout } from '@/components/layout/Layout';
import { useContent, useAboutContent } from '@/hooks/use-content';
import { useSectionTracking } from '@/hooks/use-analytics';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const JOURNEY_STOPS = [
  { city: 'Delhi, India', color: 'bg-orange-400' },
  { city: 'Toronto, Canada', color: 'bg-blue-400' },
  { city: 'Chicago, USA', color: 'bg-primary' },
];

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { timeline, settings } = useContent();
  const { content: aboutContent } = useAboutContent();
  useSectionTracking('about_page', inView);

  const narrativeParagraphs = aboutContent.narrative.length
    ? aboutContent.narrative
    : settings.aboutNarrativeParagraphs;

  return (
    <Layout>
      {/* Page Hero */}
      <section className="pt-32 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              The Journey
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4">
              My Story
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl font-light leading-relaxed">
              A global citizen who has lived and worked across Delhi, Toronto, and Chicago —
              drawing a broad worldview from diverse cultural and professional hubs.
            </p>

            {/* Journey stops */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {JOURNEY_STOPS.map((stop, i) => (
                <React.Fragment key={stop.city}>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                    <div className={`w-2 h-2 rounded-full ${stop.color}`} />
                    <span className="text-sm text-muted-foreground">{stop.city}</span>
                  </div>
                  {i < JOURNEY_STOPS.length - 1 && (
                    <MapPin className="w-3 h-3 text-white/20" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRACK RECORD (first) ─────────────────────────────────── */}
      <section className="py-10 bg-secondary/20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
              The Track Record
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Career Progression</h2>
          </motion.div>

          {/* 2-col grid to halve the vertical scroll */}
          <div className="relative">
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-7">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.07 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(45,212,191,0.35)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-[2px] flex-1 bg-white/8 mt-1" />
                    )}
                  </div>
                  <div className="pb-2">
                    <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                      {item.year}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{item.title}</h4>
                    <span className="text-xs text-white/50 font-medium block mb-1.5">
                      {item.company}
                    </span>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-CHAPTER STORY ─────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-8">

          {/* Chapter 1: The Explorer — text LEFT, portrait image RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 items-center py-16 border-b border-white/5"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-2">
                Chapter 1
              </p>
              <h2 className="text-2xl font-display font-bold mb-4 text-white">The Explorer</h2>
              {narrativeParagraphs.slice(0, 2).map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-3 font-light text-sm">{p}</p>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}images/explorer-marina.jpg`}
                alt="Marina at sunset — the explorer's view"
                className="w-full h-72 lg:h-80 object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Chapter 2: The Dad — image LEFT, text RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 items-center py-16 border-b border-white/5"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 flex-shrink-0 order-last lg:order-first">
              <img
                src={`${import.meta.env.BASE_URL}images/family-biking.jpg`}
                alt="Family biking adventure"
                className="w-full h-64 lg:h-72 object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                Chapter 2
              </p>
              <h2 className="text-2xl font-display font-bold mb-4 text-white">The Dad</h2>
              {narrativeParagraphs.slice(2, 3).map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed font-light text-sm">{p}</p>
              ))}
            </div>
          </motion.div>

          {/* Chapter 3: The Author — text LEFT, book cover + Amazon link RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-[1fr_220px] gap-10 lg:gap-16 items-center py-16"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">
                Chapter 3
              </p>
              <h2 className="text-2xl font-display font-bold mb-4 text-white">The Author</h2>
              {narrativeParagraphs.slice(3).map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed font-light text-sm mb-3">{p}</p>
              ))}
            </div>

            {/* Book cover + Amazon link in the same column */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <motion.a
                href="https://a.co/d/06PF9LC6"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="block"
              >
                <img
                  src={`${import.meta.env.BASE_URL}images/from-our-verandah.png`}
                  alt="From Our Verandah — Poems by Neetika Wahi & Sarit Sethi"
                  className="w-44 md:w-52 rounded-xl shadow-2xl shadow-black/60 border border-white/10 hover:shadow-violet-500/10 transition-shadow duration-500"
                />
              </motion.a>
              <a
                href="https://a.co/d/06PF9LC6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="border-white/10 hover:border-violet-400/50 hover:bg-violet-500/5 group w-full">
                  <ExternalLink className="w-3.5 h-3.5 mr-2 group-hover:text-violet-400" />
                  Buy on Amazon
                </Button>
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Cricket Stats */}
      {aboutContent.cricketStats.length > 0 && (
        <section className="py-12 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                Beyond the Boardroom
              </p>
              <h2 className="text-2xl font-display font-bold">Cricket, Family & More</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutContent.cricketStats.map((stat, i) => (
                <motion.div
                  key={stat.aspect}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="p-4 rounded-2xl border border-white/10 bg-card hover:border-primary/30 transition-colors"
                >
                  <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold mb-1.5">
                    {stat.aspect}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

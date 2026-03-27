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
      <section className="pt-40 pb-20 relative overflow-hidden">
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
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              The Journey
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6">
              My Story
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
              A global citizen who has lived and worked across Delhi, Toronto, and Chicago —
              drawing a broad worldview from diverse cultural and professional hubs.
            </p>

            {/* Journey stops */}
            <div className="flex flex-wrap items-center gap-3 mt-10">
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

      {/* 3-Chapter Story Sections */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-8">

          {/* Chapter 1: The Explorer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 border-b border-white/5"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3">
                Chapter 1
              </p>
              <h2 className="text-3xl font-display font-bold mb-6 text-white">The Explorer</h2>
              {narrativeParagraphs.slice(0, 2).map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4 font-light">{p}</p>
              ))}
            </div>
            {/* Placeholder — image coming */}
            <div className="h-64 lg:h-72 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
              <span className="text-white/10 text-xs uppercase tracking-widest">Image coming</span>
            </div>
          </motion.div>

          {/* Chapter 2: The Dad */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 border-b border-white/5"
          >
            {/* Placeholder — image coming (swapped side) */}
            <div className="h-64 lg:h-72 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center order-last lg:order-first">
              <span className="text-white/10 text-xs uppercase tracking-widest">Image coming</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Chapter 2
              </p>
              <h2 className="text-3xl font-display font-bold mb-6 text-white">The Dad</h2>
              {narrativeParagraphs.slice(2, 3).map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed font-light">{p}</p>
              ))}
            </div>
          </motion.div>

          {/* Chapter 3: The Author */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
                Chapter 3
              </p>
              <h2 className="text-3xl font-display font-bold mb-6 text-white">The Author</h2>
              {narrativeParagraphs.slice(3).map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-6 font-light">{p}</p>
              ))}
              <a
                href="https://a.co/d/06PF9LC6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-white/10 hover:border-violet-400/50 hover:bg-violet-500/5 group">
                  <ExternalLink className="w-4 h-4 mr-2 group-hover:text-violet-400" />
                  Buy on Amazon
                </Button>
              </a>
            </div>
            <div className="flex justify-center">
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
                  className="w-56 md:w-64 rounded-xl shadow-2xl shadow-black/60 border border-white/10 hover:shadow-violet-500/10 transition-shadow duration-500"
                />
              </motion.a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Career Progression */}
      <section className="py-20 bg-secondary/20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              The Track Record
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Career Progression</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-white/10" />
            <div className="space-y-12 relative z-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                  className="flex gap-8 relative"
                >
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center flex-shrink-0 z-10 shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="pt-1">
                    <span className="text-sm font-semibold text-primary tracking-wider uppercase">
                      {item.year}
                    </span>
                    <h4 className="text-xl font-bold text-white mt-1">{item.title}</h4>
                    <span className="text-sm text-white/60 font-medium block mb-3">
                      {item.company}
                    </span>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cricket Stats */}
      {aboutContent.cricketStats.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Beyond the Boardroom
              </p>
              <h2 className="text-3xl font-display font-bold">Cricket, Family & More</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutContent.cricketStats.map((stat, i) => (
                <motion.div
                  key={stat.aspect}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="p-5 rounded-2xl border border-white/10 bg-card hover:border-primary/30 transition-colors"
                >
                  <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold mb-2">
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

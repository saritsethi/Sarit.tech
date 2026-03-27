import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layout } from '@/components/layout/Layout';
import { useContent } from '@/hooks/use-content';
import { useSectionTracking } from '@/hooks/use-analytics';
import { MapPin } from 'lucide-react';

const JOURNEY_STOPS = [
  { city: 'Delhi, India', color: 'bg-orange-400' },
  { city: 'Toronto, Canada', color: 'bg-blue-400' },
  { city: 'Chicago, USA', color: 'bg-primary' },
];

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { timeline, settings } = useContent();
  useSectionTracking('about_page', inView);

  const portraitSrc =
    settings.profileImageUrl ||
    `${import.meta.env.BASE_URL}images/sarit-portrait.png`;

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

      {/* Narrative + Portrait */}
      <section className="py-16 bg-secondary/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-16 items-start"
          >
            <div className="space-y-6">
              <div className="prose prose-invert prose-lg text-muted-foreground font-light leading-relaxed">
                {settings.aboutNarrativeParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Portrait */}
              <div className="relative mt-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass-card inline-block">
                <img
                  src={portraitSrc}
                  alt="Sarit Sethi"
                  className="w-full max-w-[400px] h-auto object-cover opacity-90 mix-blend-luminosity hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Career Timeline */}
            <div className="relative">
              <h3 className="text-2xl font-display font-bold mb-10 text-white">
                Career Progression
              </h3>

              <div className="absolute left-[15px] top-[80px] bottom-0 w-[2px] bg-white/10" />

              <div className="space-y-12 relative z-10">
                {timeline.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
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
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

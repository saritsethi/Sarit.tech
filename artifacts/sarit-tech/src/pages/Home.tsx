import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/sections/Hero';
import { ArrowRight, Calendar, Mail, Github } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useContent } from '@/hooks/use-content';

const NAV_TILES = [
  {
    href: '/about',
    label: 'About',
    title: 'The Journey',
    description: 'The Delhi to Chicago Narrative — from construction tech roots to enterprise AI strategy.',
    accent: 'from-blue-500/10 to-transparent',
    border: 'hover:border-blue-400/40',
  },
  {
    href: '/aidad',
    label: 'AI Dad',
    title: 'The Manifesto',
    description: 'ROI-First AI Strategy — product leadership that treats AI as a business enabler, not a science experiment.',
    accent: 'from-primary/10 to-transparent',
    border: 'hover:border-primary/40',
    featured: true,
  },
  {
    href: '/projects',
    label: 'Projects',
    title: 'The Proof',
    description: 'SARTH(A)i & AI Prototypes — real systems solving real problems across enterprise and beyond.',
    accent: 'from-violet-500/10 to-transparent',
    border: 'hover:border-violet-400/40',
  },
];

export default function Home() {
  const { trackEvent } = useAnalytics();
  const { settings } = useContent();

  const calendarUrl = settings.calendarBookingUrl || 'https://calendar.app.google/Xh2ruF2wWSN8Y2JP9';

  return (
    <Layout>
      <Hero />

      {/* Navigation Tiles */}
      <section className="py-24 relative bg-secondary/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              Navigate
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Explore
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {NAV_TILES.map((tile, i) => (
              <motion.div
                key={tile.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={tile.href}
                  onClick={() => trackEvent('tile_clicked', { tile: tile.title })}
                  className={`group block p-8 rounded-2xl border border-white/10 bg-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${tile.border} ${tile.featured ? 'ring-1 ring-primary/20' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} pointer-events-none`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${tile.featured ? 'text-primary border-primary/30 bg-primary/10' : 'text-muted-foreground border-white/10'}`}>
                        {tile.label}
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${tile.featured ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-3">{tile.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tile.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              Direct Access
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Let's Connect
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('cta_clicked', { button: 'book_strategic_session' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book Strategic Session
            </a>

            <a
              href="mailto:saritsethi@gmail.com"
              onClick={() => trackEvent('cta_clicked', { button: 'direct_inquiry' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground font-semibold hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Direct Inquiry
            </a>

            <a
              href="https://github.com/saritsethi"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('cta_clicked', { button: 'source_code' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground font-semibold hover:border-white/30 hover:bg-white/10 transition-colors"
            >
              <Github className="w-4 h-4" />
              Source Code
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { ArrowRight, Bot, Calendar, BookOpen, Brain, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/hooks/use-analytics';
import { useContent, useHomeContent } from '@/hooks/use-content';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

const NAV_TILES = [
  {
    href: '/about',
    label: 'My Story',
    description: 'Delhi to Chicago — the narrative behind the builder.',
    icon: BookOpen,
    accent: 'from-blue-500/10 to-transparent',
    border: 'hover:border-blue-400/40',
    iconColor: 'text-blue-400',
  },
  {
    href: '/aidad',
    label: 'Professional',
    description: 'ROI-First AI strategy. Enterprise execution. Zero theater.',
    icon: Brain,
    accent: 'from-primary/10 to-transparent',
    border: 'hover:border-primary/40',
    iconColor: 'text-primary',
    featured: true,
  },
  {
    href: '/builder',
    label: 'Projects',
    description: 'Real systems solving real problems — the proof of work.',
    icon: Hammer,
    accent: 'from-violet-500/10 to-transparent',
    border: 'hover:border-violet-400/40',
    iconColor: 'text-violet-400',
  },
];

export default function Home() {
  const { trackEvent } = useAnalytics();
  const { settings } = useContent();
  const { content: homeContent } = useHomeContent();

  const calendarUrl = settings.calendarBookingUrl || 'https://calendar.app.google/Xh2ruF2wWSN8Y2JP9';

  const handleChatOpen = () => {
    trackEvent('cta_clicked', { button: 'meet_digital_twin_hero' });
    const chatBtn = document.querySelector('[data-testid="button-chat-toggle"]') as HTMLButtonElement | null;
    chatBtn?.click();
  };

  return (
    <Layout>
      <section className="h-[100dvh] grid grid-rows-[1fr_auto] overflow-hidden relative">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={homeContent.heroBackgroundImageUrl || `${BASE}/images/hero-grid.png`}
            alt=""
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px]" />
        </div>

        {/* Hero — occupies the 1fr grid row */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-8 min-h-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-3 w-full max-w-4xl"
          >
            {/* Subtle portrait — face to the voice */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 ring-1 ring-primary/20 shadow-lg shadow-primary/10">
                <img
                  src={homeContent.heroImageUrl || `${BASE}/images/sarit-portrait.png`}
                  alt="Sarit Sethi"
                  className="w-full h-full object-cover object-top opacity-85 mix-blend-luminosity hover:opacity-100 hover:mix-blend-normal transition-all duration-500"
                />
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {settings.heroBadgeText}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1]">
              <span className="text-gradient-primary">{settings.heroHeadline}</span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              {settings.heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cta_clicked', { button: 'lets_connect_hero' })}>
                <Button size="sm" className="w-full sm:w-auto group px-5 py-2.5">
                  <Calendar className="mr-2 w-4 h-4" />
                  Let's Connect
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto group border-white/10 bg-white/5 px-5 py-2.5"
                onClick={handleChatOpen}
              >
                <Bot className="mr-2 w-4 h-4 text-primary group-hover:animate-bounce" />
                Meet My Digital Twin
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tiles */}
        <div className="relative z-10 px-4 md:px-8 pb-4 md:pb-6">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-3 md:gap-4">
            {NAV_TILES.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.div
                  key={tile.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  <Link
                    href={tile.href}
                    onClick={() => trackEvent('tile_clicked', { tile: tile.label })}
                    className={`group block p-4 md:p-5 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${tile.border} ${tile.featured ? 'ring-1 ring-primary/20' : ''}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} pointer-events-none`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${tile.iconColor}`} />
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${tile.featured ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <h3 className="text-sm md:text-base font-display font-bold mb-1">{tile.label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tile.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}

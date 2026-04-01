import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layout } from '@/components/layout/Layout';
import { useContent } from '@/hooks/use-content';
import { useAnalytics, useSectionTracking } from '@/hooks/use-analytics';
import {
  Github,
  Mail,
  Calendar,
  FileDown,
  Globe,
  ArrowUpRight,
  Linkedin,
} from 'lucide-react';

interface ContactTile {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  description: string;
  href: string;
  download?: string;
  isDownload?: boolean;
  accent: string;
  border: string;
  iconColor: string;
}

export default function Contact() {
  const { settings } = useContent();
  const { trackEvent } = useAnalytics();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  useSectionTracking('contact_page', inView);

  const tiles: ContactTile[] = [
    {
      id: 'github',
      icon: Github,
      label: 'GitHub',
      sublabel: 'github.com/saritsethi',
      description: 'Explore the open-source projects and code behind the work.',
      href: 'https://github.com/saritsethi',
      accent: 'from-violet-500/10 to-transparent',
      border: 'hover:border-violet-400/40',
      iconColor: 'text-violet-400',
    },
    {
      id: 'website',
      icon: Globe,
      label: 'Website',
      sublabel: 'sarit.tech',
      description: "You're already here — share this portfolio with someone who should meet Sarit.",
      href: 'https://sarit.tech',
      accent: 'from-primary/10 to-transparent',
      border: 'hover:border-primary/40',
      iconColor: 'text-primary',
    },
    {
      id: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      sublabel: 'linkedin.com/in/saritsethi',
      description: 'Connect professionally, follow thought leadership, and see the full career arc.',
      href: settings.social.linkedin || 'https://linkedin.com/in/saritsethi',
      accent: 'from-blue-500/10 to-transparent',
      border: 'hover:border-blue-400/40',
      iconColor: 'text-blue-400',
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      sublabel: 'saritsethi@gmail.com',
      description: 'Direct line for opportunities, collaborations, and sharp questions.',
      href: 'mailto:saritsethi@gmail.com',
      accent: 'from-green-500/10 to-transparent',
      border: 'hover:border-green-400/40',
      iconColor: 'text-green-400',
    },
    {
      id: 'book-call',
      icon: Calendar,
      label: 'Book a Call',
      sublabel: 'Strategy session — 30 min',
      description: 'Schedule a call to discuss AI leadership, product strategy, or advisory work.',
      href: settings.calendarBookingUrl || 'https://calendar.app.google/Xh2ruF2wWSN8Y2JP9',
      accent: 'from-orange-500/10 to-transparent',
      border: 'hover:border-orange-400/40',
      iconColor: 'text-orange-400',
    },
    {
      id: 'resume',
      icon: FileDown,
      label: 'Download Resume',
      sublabel: 'PDF · Updated 2026',
      description: 'Full career history, key metrics, and the technical depth behind the leadership.',
      href: `${import.meta.env.BASE_URL}Sarit_Sethi_Resume.pdf`,
      download: 'Sarit_Sethi_Resume.pdf',
      isDownload: true,
      accent: 'from-teal-500/10 to-transparent',
      border: 'hover:border-teal-400/40',
      iconColor: 'text-teal-400',
    },
  ];

  const handleTileClick = (tile: ContactTile) => {
    if (tile.id === 'resume') {
      trackEvent('resume_downloaded', { source: 'contact_page' });
    } else if (tile.id === 'book-call') {
      trackEvent('cta_clicked', { button: 'book_calendar_contact_page' });
    } else if (tile.id === 'email') {
      trackEvent('social_clicked', { network: 'Email', source: 'contact_page' });
    } else {
      trackEvent('social_clicked', { network: tile.label, source: 'contact_page' });
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              Get In Touch
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-6">
              Let's Build <span className="text-gradient-primary">Together</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
              Open to AI leadership roles, fractional advisory, and strategic consulting.
              Pick your preferred channel below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tiles Grid */}
      <section ref={ref} className="pb-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-8 pt-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              const isExternal = !tile.isDownload;
              const commonClasses = `group relative flex flex-col p-6 md:p-8 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 cursor-pointer ${tile.border}`;

              const inner = (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} pointer-events-none`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors`}>
                        <Icon className={`w-6 h-6 ${tile.iconColor}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </div>
                    <p className="text-lg font-bold font-display tracking-tight mb-0.5">
                      {tile.label}
                    </p>
                    <p className={`text-sm font-medium mb-3 ${tile.iconColor}`}>
                      {tile.sublabel}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                      {tile.description}
                    </p>
                  </div>
                </>
              );

              return (
                <motion.div
                  key={tile.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  {tile.isDownload ? (
                    <a
                      href={tile.href}
                      download={tile.download}
                      className={commonClasses}
                      onClick={() => handleTileClick(tile)}
                    >
                      {inner}
                    </a>
                  ) : (
                    <a
                      href={tile.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className={commonClasses}
                      onClick={() => handleTileClick(tile)}
                    >
                      {inner}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/sections/Hero';
import { ArrowRight, User, Brain, Code2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

const PREVIEW_CARDS = [
  {
    href: '/about',
    icon: User,
    label: 'My Story',
    title: 'From Delhi to Chicago',
    description:
      'Construction tech roots, enterprise AI ambitions. A journey spanning continents and industries.',
    accent: 'from-blue-500/10 to-transparent',
    border: 'hover:border-blue-400/40',
  },
  {
    href: '/aidad',
    icon: Brain,
    label: 'AI Dad',
    title: 'The AI Dad',
    description:
      'Product leadership, AI strategy, and enterprise alignment. ROI-first by design.',
    accent: 'from-primary/10 to-transparent',
    border: 'hover:border-primary/40',
    featured: true,
  },
  {
    href: '/projects',
    icon: Code2,
    label: 'Projects',
    title: 'The Builder',
    description:
      'Cricket Coach AI, Sarth(A)i, and more. Real systems solving real problems.',
    accent: 'from-violet-500/10 to-transparent',
    border: 'hover:border-violet-400/40',
  },
];

export default function Home() {
  const { trackEvent } = useAnalytics();

  return (
    <Layout>
      <Hero />

      {/* Navigation Preview Cards */}
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
              Explore
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              What I Do
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PREVIEW_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={card.href}
                    onClick={() => trackEvent('card_clicked', { card: card.label })}
                    className={`group block p-8 rounded-2xl border border-white/10 bg-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${card.border} ${card.featured ? 'ring-1 ring-primary/20' : ''}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} pointer-events-none`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.featured ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground group-hover:text-foreground'} transition-colors`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${card.featured ? 'text-primary border-primary/30 bg-primary/10' : 'text-muted-foreground border-white/10'}`}>
                          {card.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {card.description}
                      </p>
                      <div className={`flex items-center gap-2 text-sm font-medium ${card.featured ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`}>
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
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

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layout } from '@/components/layout/Layout';
import { useAiDadContent } from '@/hooks/use-content';
import { useSectionTracking, useAnalytics } from '@/hooks/use-analytics';
import * as Icons from 'lucide-react';
import { type LucideProps, Brain, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type LucideIconName = keyof typeof Icons;

function getIcon(name: string) {
  const key = name as LucideIconName;
  const IconComponent = (key in Icons ? Icons[key] : Icons.Code) as React.ComponentType<LucideProps>;
  return <IconComponent className="w-6 h-6 text-primary" />;
}

export default function AiDad() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { leadership } = useAiDadContent();
  const { trackEvent } = useAnalytics();
  useSectionTracking('aidad_page', inView);

  const metrics = leadership.keyMetrics;
  const strategyTitle = leadership.strategyTitle || 'Enterprise AI Strategy: The Three Buckets';
  const quote = leadership.quote;
  const pillars = leadership.aiPillars;
  const philosophy = leadership.leadershipPhilosophy;

  return (
    <Layout>
      {/* Page Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(45,212,191,1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Tech Leadership
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6">
              The <span className="text-gradient-primary">Professional</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed mb-8">
              Product leadership that treats AI as a business enabler — not a science experiment.
              ROI-first strategy. Enterprise-grade execution. Zero tolerance for tech theater.
            </p>
            <Button
              size="lg"
              onClick={() => {
                trackEvent('cta_clicked', { button: 'meet_digital_twin_aidad' });
                const chatBtn = document.querySelector('[data-testid="button-chat-toggle"]') as HTMLButtonElement | null;
                chatBtn?.click();
              }}
            >
              <Brain className="w-4 h-4 mr-2" />
              Ask My Digital Twin
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 border-y border-white/5 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
          >
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-card text-center group hover:border-primary/30 transition-colors"
              >
                <div className="text-3xl font-display font-extrabold text-gradient-primary mb-1">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-white mb-2">{metric.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Pillars — The Three Buckets */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              Framework
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              {strategyTitle}
            </h2>
            <p className="text-lg text-muted-foreground">
              Enterprise AI strategy built on a foundation that ties every technical decision
              back to measurable business outcomes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title ?? i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  {getIcon(pillar.icon)}
                </div>
                <div className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
                  Bucket {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Enterprise AI Framework visual */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16"
          >
            <img
              src={leadership.frameworkImageUrl || `${import.meta.env.BASE_URL}images/enterprise-ai-framework.png`}
              alt="Enterprise AI Strategy: Use Case Framework — Architectural Deployment"
              className="w-full rounded-2xl border border-white/10 opacity-90 hover:opacity-100 transition-opacity duration-500 shadow-2xl shadow-black/40"
            />
          </motion.div>
        </div>
      </section>

      {/* Leadership Philosophy */}
      {philosophy.length > 0 && (
        <section className="py-20 bg-secondary/20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Principles
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Leadership Philosophy
              </h2>
            </motion.div>

            <div className="space-y-4">
              {philosophy.map((principle, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-card hover:border-primary/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">{principle}</p>
                </motion.div>
              ))}
            </div>

            {/* Product Philosophy visual */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-12"
            >
              <img
                src={leadership.philosophyImageUrl || `${import.meta.env.BASE_URL}images/product-philosophy.png`}
                alt="Product Philosophy: Outcome-Driven Development"
                className="w-full rounded-2xl border border-white/10 opacity-90 hover:opacity-100 transition-opacity duration-500 shadow-2xl shadow-black/40"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Quote */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-card p-12 rounded-3xl border border-white/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <blockquote className="text-2xl md:text-3xl font-display font-medium leading-relaxed text-foreground mb-6">
              "{quote}"
            </blockquote>
            <p className="text-muted-foreground">
              — Sarit Sethi, Professional &amp; Product Leader
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

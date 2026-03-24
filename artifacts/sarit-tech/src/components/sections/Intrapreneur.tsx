import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '@/hooks/use-content';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

export function Intrapreneur() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { pillars, articles, isLoading } = useContent();

  const getIcon = (name: string) => {
    const IconComponent = (Icons as any)[name] || Icons.Code;
    return <IconComponent className="w-6 h-6 text-primary" />;
  };

  return (
    <section id="intrapreneur" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.h2 
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="text-4xl md:text-5xl font-display font-bold mb-6"
          >
            The Intrapreneur
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Enterprise AI Strategy built on four core pillars. Driving innovation from within by aligning emerging tech with corporate realities.
          </motion.p>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                {getIcon(pillar.icon)}
              </div>
              <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Substack Feed Preview */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-bold">Recent Writing</h3>
            <a 
              href="https://substack.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Substack <Icons.ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeletons
              Array.from({length: 3}).map((_, i) => (
                <div key={i} className="h-[200px] rounded-2xl bg-white/5 animate-pulse" />
              ))
            ) : (
              articles.map((article, i) => (
                <motion.a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  key={article.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
                  className="block p-6 rounded-2xl bg-secondary/50 border border-white/5 hover:border-primary/30 hover:bg-secondary transition-all group"
                >
                  <span className="text-xs text-primary font-medium mb-3 block">{article.date}</span>
                  <h4 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
                </motion.a>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

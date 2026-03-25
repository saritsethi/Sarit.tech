import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '@/hooks/use-content';
import * as Icons from 'lucide-react';
import { type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionTracking } from '@/hooks/use-analytics';

type LucideIconName = keyof typeof Icons;

export function Intrapreneur() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { pillars } = useContent();
  useSectionTracking('intrapreneur', inView);

  const getIcon = (name: string) => {
    const key = name as LucideIconName;
    const IconComponent = (key in Icons ? Icons[key] : Icons.Code) as React.ComponentType<LucideProps>;
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

      </div>
    </section>
  );
}

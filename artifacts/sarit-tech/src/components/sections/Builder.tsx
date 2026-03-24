import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '@/hooks/use-content';
import { ArrowUpRight, Github, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSectionTracking } from '@/hooks/use-analytics';

export function Builder() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  useSectionTracking('builder', inView);
  const { ref: articlesRef, inView: articlesInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { projects, articles } = useContent();

  return (
    <section id="builder" className="py-32 relative bg-secondary/20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header + Projects */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">The Builder</h2>
            <p className="text-lg text-muted-foreground">
              Prototyping the future. The best product leaders stay hands-on. Here are selected
              systems and architectures I've built.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button variant="outline" className="border-white/10">
              <Github className="w-4 h-4 mr-2" />
              View GitHub
            </Button>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative flex flex-col justify-between p-8 rounded-3xl bg-card border border-white/10 hover:border-primary/50 overflow-hidden transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="font-display font-bold text-xl text-primary">{i + 1}</span>
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-white/70 border border-white/5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Substack RSS Articles */}
        <motion.div
          ref={articlesRef}
          initial={{ opacity: 0, y: 30 }}
          animate={articlesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-widest">From the Blog</span>
              </div>
              <h3 className="text-3xl font-display font-bold">Latest Writing</h3>
            </div>
            <a
              href="https://saritsethi.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              View all on Substack
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <motion.a
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={articlesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                className="group flex flex-col p-6 rounded-2xl bg-card border border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="text-xs text-muted-foreground mb-3">{article.date}</span>
                <h4 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.excerpt}</p>
                <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read on Substack
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

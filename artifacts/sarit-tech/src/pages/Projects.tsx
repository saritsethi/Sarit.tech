import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layout } from '@/components/layout/Layout';
import { useContent } from '@/hooks/use-content';
import { useSectionTracking } from '@/hooks/use-analytics';
import { ArrowUpRight, Github, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Projects() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { projects } = useContent();
  useSectionTracking('projects_page', inView);

  return (
    <Layout>
      {/* Page Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
                Portfolio
              </p>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6">
                The Builder
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
                The best product leaders stay hands-on. Here are selected systems and
                architectures I've built — from AI coaching to enterprise RAG.
              </p>
            </div>
            <a
              href="https://github.com/saritsethi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button variant="outline" className="border-white/10 hover:border-primary/50">
                <Github className="w-4 h-4 mr-2" />
                View GitHub
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-secondary/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div ref={ref} className="grid lg:grid-cols-3 gap-8">
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
                      <span className="font-display font-bold text-xl text-primary">
                        {i + 1}
                      </span>
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

          {/* Stealth project teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 p-6 rounded-2xl border border-dashed border-white/10 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Sarth(A)i — In Stealth
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                A next-generation AI assistant platform. Roadmap coming soon.
              </p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
              Coming Soon
            </span>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

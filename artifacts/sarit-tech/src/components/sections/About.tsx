import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '@/hooks/use-content';

export function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { timeline } = useContent();

  return (
    <section id="about" className="py-32 relative bg-secondary/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start"
        >
          {/* Narrative / Portrait side */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">The AI Dad</h2>
              <div className="w-20 h-1 bg-primary rounded-full mb-8" />
            </div>
            
            <div className="prose prose-invert prose-lg text-muted-foreground font-light leading-relaxed">
              <p>
                My journey spans from navigating the complexities of construction tech in Toronto to driving Enterprise AI strategy in Chicago. 
                I'm passionate about building systems that make people's lives easier and businesses more efficient.
              </p>
              <p>
                As a product leader, I sit at the intersection of deeply technical architecture and high-level executive strategy. 
                I don't just advocate for AI—I architect realistic, scalable, and ethical pathways for its adoption in legacy industries.
              </p>
            </div>

            <div className="relative mt-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass-card inline-block">
              <img 
                src={`${import.meta.env.BASE_URL}images/sarit-portrait.png`} 
                alt="Sarit Sethi" 
                className="w-full max-w-[400px] h-auto object-cover opacity-90 mix-blend-luminosity hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Timeline side */}
          <div className="relative">
            <h3 className="text-2xl font-display font-bold mb-10 text-white">Career Progression</h3>
            
            <div className="absolute left-[15px] top-[80px] bottom-0 w-[2px] bg-white/10" />
            
            <div className="space-y-12 relative z-10">
              {timeline.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 + (i * 0.1) }}
                  className="flex gap-8 relative"
                >
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center flex-shrink-0 z-10 shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="pt-1">
                    <span className="text-sm font-semibold text-primary tracking-wider uppercase">{item.year}</span>
                    <h4 className="text-xl font-bold text-white mt-1">{item.title}</h4>
                    <span className="text-sm text-white/60 font-medium block mb-3">{item.company}</span>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

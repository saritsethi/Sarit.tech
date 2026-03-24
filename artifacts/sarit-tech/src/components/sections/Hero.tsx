import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/hooks/use-analytics';
import { ArrowRight, Bot } from 'lucide-react';

export function Hero() {
  const { trackEvent } = useAnalytics();

  const handleChatOpen = () => {
    trackEvent('cta_clicked', { button: 'meet_digital_twin_hero' });
    // Find the chat toggle button by testid and click it if chat isn't open
    const chatBtn = document.querySelector('[data-testid="button-chat-toggle"]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background with Grid */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-grid.png`}
          alt=""
          className="w-full h-full object-cover opacity-20 mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI Product Leader
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight leading-[1.1]">
            Building <span className="text-gradient-primary">ROI-First</span> <br className="hidden md:block" />
            AI Solutions
          </h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Bridging the gap between construction tech execution and enterprise AI strategy. I build systems that solve real problems, not just cool tech demos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <a 
              href="#contact" 
              onClick={() => trackEvent('cta_clicked', { button: 'lets_connect_hero' })}
            >
              <Button size="lg" className="w-full sm:w-auto group">
                Let's Connect
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto group border-white/10 bg-white/5"
              onClick={handleChatOpen}
            >
              <Bot className="mr-2 w-4 h-4 text-primary group-hover:animate-bounce" />
              Meet My Digital Twin
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs uppercase tracking-widest font-semibold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent" />
      </motion.div>
    </section>
  );
}

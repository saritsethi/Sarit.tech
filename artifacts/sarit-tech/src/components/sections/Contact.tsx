import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAnalytics, useSectionTracking } from '@/hooks/use-analytics';
import { Calendar, Linkedin, Twitter, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { trackEvent } = useAnalytics();
  useSectionTracking('contact', inView);

  const handleBooking = () => {
    trackEvent('cta_clicked', { button: 'book_calendar_contact' });
    window.open('https://calendar.app.google/PTXjuRKDb97Qyp3B6', '_blank');
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="glass-card p-12 md:p-20 rounded-[3rem] border border-white/10"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Let's Build the Future.</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
            Currently open to AI leadership opportunities, fractional advisory roles, and strategic consulting. Let's discuss how we can drive ROI through intelligent systems.
          </p>

          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg h-16 px-10 rounded-2xl group"
            onClick={handleBooking}
          >
            <Calendar className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            Book a Strategy Call
          </Button>

          <div className="mt-16 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Linkedin />} label="LinkedIn" />
              <SocialLink href="#" icon={<Twitter />} label="Twitter" />
              <SocialLink href="#" icon={<Github />} label="GitHub" />
              <SocialLink href="#" icon={<Mail />} label="Email" />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sarit Sethi. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const { trackEvent } = useAnalytics();
  return (
    <a 
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onClick={() => trackEvent('social_clicked', { network: label })}
      className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-110"
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </a>
  )
}

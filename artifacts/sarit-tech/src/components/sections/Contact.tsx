import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'wouter';
import { useAnalytics, useSectionTracking } from '@/hooks/use-analytics';
import { useContent } from '@/hooks/use-content';
import { Calendar, Linkedin, Github, Mail, FileDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { trackEvent } = useAnalytics();
  const { settings } = useContent();
  useSectionTracking('contact', inView);

  const handleBooking = () => {
    trackEvent('cta_clicked', { button: 'book_calendar_contact' });
    window.open(settings.calendarBookingUrl, '_blank');
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
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
            Currently open to AI leadership opportunities, fractional advisory roles, and strategic
            consulting. Let's discuss how we can drive ROI through intelligent systems.
          </p>

          <Button
            size="lg"
            className="w-full sm:w-auto text-lg h-16 px-10 rounded-2xl group"
            onClick={handleBooking}
          >
            <Calendar className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            Book a Strategy Call
          </Button>

          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Social icons with labels */}
              <div className="flex items-center gap-3">
                <SocialLink
                  href={settings.social.linkedin}
                  icon={<Linkedin />}
                  label="LinkedIn"
                  hoverColor="hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-400"
                  trackEvent={trackEvent}
                />
                <SocialLink
                  href={settings.social.github}
                  icon={<Github />}
                  label="GitHub"
                  hoverColor="hover:bg-violet-500/20 hover:border-violet-400/50 hover:text-violet-400"
                  trackEvent={trackEvent}
                />
                <SocialLink
                  href={settings.social.email}
                  icon={<Mail />}
                  label="Email"
                  hoverColor="hover:bg-green-500/20 hover:border-green-400/50 hover:text-green-400"
                  trackEvent={trackEvent}
                />
                <a
                  href={`${import.meta.env.BASE_URL}Sarit_Sethi_Resume.pdf`}
                  download="Sarit_Sethi_Resume.pdf"
                  aria-label="Download Resume"
                  onClick={() => trackEvent('resume_downloaded', {})}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-muted-foreground hover:bg-teal-500/20 hover:border-teal-400/50 hover:text-teal-400 transition-all duration-200 hover:scale-105">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Resume</span>
                </a>
              </div>

              {/* Right side: copyright + all channels link */}
              <div className="flex flex-col items-center md:items-end gap-2">
                <Link
                  href="/contact"
                  onClick={() => trackEvent('cta_clicked', { button: 'all_channels_footer' })}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors group"
                >
                  View all channels
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Sarit Sethi. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface SocialLinkProps {
  href: string;
  icon: React.ReactElement;
  label: string;
  hoverColor: string;
  trackEvent: (event: string, props: Record<string, unknown>) => void;
}

function SocialLink({ href, icon, label, hoverColor, trackEvent }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onClick={() => trackEvent('social_clicked', { network: label })}
      className="group flex flex-col items-center gap-2"
    >
      <div className={`w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-muted-foreground ${hoverColor} transition-all duration-200 hover:scale-105`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </a>
  );
}

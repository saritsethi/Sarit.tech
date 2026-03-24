import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/hooks/use-analytics';

const NAV_LINKS = [
  { name: 'About', href: '#about' },
  { name: 'Strategy', href: '#intrapreneur' },
  { name: 'Projects', href: '#builder' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (name: string) => {
    trackEvent('nav_clicked', { link: name });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled ? "py-3 glass shadow-lg shadow-black/20" : "py-6 bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <a 
            href="#hero" 
            className="flex items-center gap-2 group"
            onClick={() => handleNavClick('Home')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">sarit<span className="text-primary">.tech</span></span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleNavClick(link.name)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a href="#contact" onClick={() => handleNavClick('Contact CTA')}>
              <Button size="sm" variant="outline" className="border-white/10 hover:border-primary/50">
                Let's Connect
              </Button>
            </a>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 pt-24 px-6 pb-6 bg-background/95 backdrop-blur-xl md:hidden flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 text-center mt-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => handleNavClick(link.name)}
                  className="text-2xl font-display font-medium text-foreground py-2 border-b border-white/5"
                >
                  {link.name}
                </a>
              ))}
              <a href="#contact" onClick={() => handleNavClick('Contact CTA')} className="mt-4">
                <Button size="lg" className="w-full">Let's Connect</Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

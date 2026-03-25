import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from './Navbar';
import { Contact } from '@/components/sections/Contact';

interface LayoutProps {
  children: React.ReactNode;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Contact />
    </div>
  );
}

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Intrapreneur } from '@/components/sections/Intrapreneur';
import { Builder } from '@/components/sections/Builder';
import { Contact } from '@/components/sections/Contact';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <About />
        <Intrapreneur />
        <Builder />
        <Contact />
      </main>

      <ChatWidget />
    </div>
  );
}

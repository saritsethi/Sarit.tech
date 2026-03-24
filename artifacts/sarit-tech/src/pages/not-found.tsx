import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-display font-extrabold text-primary mb-6">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="inline-block">
          <Button size="lg">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}

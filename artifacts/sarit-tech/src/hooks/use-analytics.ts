import { useEffect, useCallback } from 'react';
import posthog from 'posthog-js';

// Initialize PostHog once
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_PLACEHOLDER';
const POSTHOG_HOST = 'https://us.i.posthog.com';

if (typeof window !== 'undefined' && POSTHOG_KEY !== 'phc_PLACEHOLDER') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We'll do this manually
    autocapture: false,
  });
}

export function useAnalytics() {
  const trackPageView = useCallback((path: string) => {
    if (POSTHOG_KEY !== 'phc_PLACEHOLDER') {
      posthog.capture('$pageview', { $current_url: path });
    } else {
      console.log(`[Analytics Mock] Pageview: ${path}`);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY !== 'phc_PLACEHOLDER') {
      posthog.capture(eventName, properties);
    } else {
      console.log(`[Analytics Mock] Event: ${eventName}`, properties);
    }
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);

  return { trackPageView, trackEvent };
}

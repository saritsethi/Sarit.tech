import { useEffect, useCallback } from 'react';
import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_PLACEHOLDER';
const POSTHOG_HOST = 'https://us.i.posthog.com';
const IS_REAL_KEY = POSTHOG_KEY !== 'phc_PLACEHOLDER';

if (typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    autocapture: false,
    opt_out_capturing_by_default: !IS_REAL_KEY,
    disable_session_recording: !IS_REAL_KEY,
    advanced_disable_decide: !IS_REAL_KEY,
  });
}

function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (IS_REAL_KEY) {
    posthog.capture(event, properties);
  } else {
    console.log(`[Analytics Mock] Event: ${event}`, properties ?? {});
  }
}

export function useAnalytics() {
  const trackPageView = useCallback((path: string) => {
    if (IS_REAL_KEY) {
      posthog.capture('$pageview', { $current_url: path });
    } else {
      console.log(`[Analytics Mock] Pageview: ${path}`);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    captureEvent(eventName, properties);
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);

  return { trackPageView, trackEvent };
}

export function useSectionTracking(sectionId: string, inView: boolean) {
  useEffect(() => {
    if (inView) {
      captureEvent('section_viewed', { section: sectionId });
    }
  }, [sectionId, inView]);
}

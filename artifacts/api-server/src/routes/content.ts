import { Router } from "express";
import { createClient } from "@sanity/client";

const router = Router();

const PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || "";
const DATASET = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const TOKEN = process.env.VITE_SANITY_API_TOKEN || process.env.SANITY_API_TOKEN || "";

const sanityReady = PROJECT_ID !== "" && PROJECT_ID !== "placeholder";

const sanityClient = sanityReady
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      useCdn: false,
      apiVersion: "2024-01-01",
      token: TOKEN,
    })
  : null;

async function querySanity<T>(query: string, fallback: T): Promise<T> {
  if (!sanityClient) return fallback;
  try {
    const result = await sanityClient.fetch<T>(query);
    return result && (Array.isArray(result) ? result.length > 0 : true)
      ? result
      : fallback;
  } catch {
    return fallback;
  }
}

router.get("/content/settings", async (_req, res) => {
  const raw = await querySanity<Record<string, unknown> | null>(
    `*[_type == "siteSettings"][0]{
      heroHeadline, heroSubheadline, heroBadgeText,
      aboutNarrative, profileImageUrl,
      calendarBookingUrl, linkedinUrl, twitterUrl, githubUrl, emailAddress,
      substackUrl
    }`,
    null,
  );
  res.json({ data: raw, ready: sanityReady });
});

router.get("/content/timeline", async (_req, res) => {
  const data = await querySanity(
    `*[_type == "timeline"] | order(order asc)`,
    null,
  );
  res.json({ data, ready: sanityReady });
});

router.get("/content/pillars", async (_req, res) => {
  const data = await querySanity(
    `*[_type == "strategyPillar"] | order(order asc)`,
    null,
  );
  res.json({ data, ready: sanityReady });
});

router.get("/content/projects", async (_req, res) => {
  const data = await querySanity(
    `*[_type == "project"] | order(order asc)`,
    null,
  );
  res.json({ data, ready: sanityReady });
});

export default router;

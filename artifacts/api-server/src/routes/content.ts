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

function sanityImageUrl(assetRef: string | undefined): string | null {
  if (!assetRef || !PROJECT_ID || !DATASET) return null;
  const [, id, dimensions, format] = assetRef.split("-");
  if (!id || !dimensions || !format) return null;
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
}

function sanityFileUrl(assetRef: string | undefined): string | null {
  if (!assetRef || !PROJECT_ID || !DATASET) return null;
  const parts = assetRef.split("-");
  if (parts.length < 3) return null;
  const ext = parts[parts.length - 1];
  const id = parts.slice(1, parts.length - 1).join("-");
  return `https://cdn.sanity.io/files/${PROJECT_ID}/${DATASET}/${id}.${ext}`;
}

function blockContentToText(
  blocks?: Array<{ children?: Array<{ text?: string }> }>,
): string[] {
  if (!blocks || blocks.length === 0) return [];
  return blocks
    .map((block) =>
      (block.children ?? [])
        .map((child) => child.text ?? "")
        .join(""),
    )
    .filter(Boolean);
}

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

router.get("/content/home", async (_req, res) => {
  const raw = await querySanity<Record<string, unknown> | null>(
    `*[_type == "home"][0]{
      heroHeadline,
      heroSubtext,
      primaryCTA,
      "heroImageRef": heroImage.asset._ref,
      "heroImageHotspot": heroImage.hotspot,
      "heroBackgroundImageRef": heroBackgroundImage.asset._ref
    }`,
    null,
  );

  if (!raw) {
    return res.json({ data: null, ready: sanityReady });
  }

  const data = {
    heroHeadline: raw.heroHeadline,
    heroSubtext: raw.heroSubtext,
    primaryCTA: raw.primaryCTA,
    heroImageUrl: sanityImageUrl(raw.heroImageRef as string | undefined),
    heroImageHotspot: raw.heroImageHotspot ?? null,
    heroBackgroundImageUrl: sanityImageUrl(raw.heroBackgroundImageRef as string | undefined),
  };

  res.json({ data, ready: sanityReady });
});

router.get("/content/about", async (_req, res) => {
  const raw = await querySanity<Record<string, unknown> | null>(
    `*[_type == "about"][0]{
      "portraitRef": portrait.asset._ref,
      "portraitHotspot": portrait.hotspot,
      "explorerImageRef": explorerImage.asset._ref,
      "bikingImageRef": bikingImage.asset._ref,
      "bookCoverImageRef": bookCoverImage.asset._ref,
      narrative,
      cricketStats
    }`,
    null,
  );

  if (!raw) {
    return res.json({ data: null, ready: sanityReady });
  }

  const narrative = blockContentToText(
    raw.narrative as Array<{ children?: Array<{ text?: string }> }> | undefined,
  );

  const data = {
    portraitUrl: sanityImageUrl(raw.portraitRef as string | undefined),
    portraitHotspot: raw.portraitHotspot ?? null,
    explorerImageUrl: sanityImageUrl(raw.explorerImageRef as string | undefined),
    bikingImageUrl: sanityImageUrl(raw.bikingImageRef as string | undefined),
    bookCoverImageUrl: sanityImageUrl(raw.bookCoverImageRef as string | undefined),
    narrative,
    cricketStats: raw.cricketStats ?? [],
  };

  res.json({ data, ready: sanityReady });
});

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
  const raw = await querySanity<Array<Record<string, unknown>> | null>(
    `*[_type == "project"] | order(order asc){
      _id,
      title,
      "slug": slug.current,
      "thumbnailRef": thumbnail.asset._ref,
      "thumbnailHotspot": thumbnail.hotspot,
      videoUrl,
      "videoAssetRef": video.asset._ref,
      description,
      technologies,
      tech,
      status,
      link,
      order
    }`,
    null,
  );

  if (!raw) {
    return res.json({ data: null, ready: sanityReady });
  }

  const data = raw.map((p) => {
    const videoAssetUrl = sanityFileUrl(p.videoAssetRef as string | undefined);
    const videoUrl = videoAssetUrl ?? (p.videoUrl as string | null) ?? null;
    return {
      id: p._id as string,
      title: p.title as string,
      slug: p.slug as string | null,
      thumbnailUrl: sanityImageUrl(p.thumbnailRef as string | undefined),
      thumbnailHotspot: p.thumbnailHotspot ?? null,
      videoUrl,
      description: blockContentToText(
        p.description as Array<{ children?: Array<{ text?: string }> }> | undefined,
      ).join("\n\n") || (p.descriptionText as string | null) || "",
      tech: (p.technologies as string[] | null) ??
            (p.tech as string[] | null) ?? [],
      status: (p.status as string | null) ?? "active",
      link: (p.link as string | null) ?? "#",
      order: p.order as number | null,
    };
  });

  res.json({ data, ready: sanityReady });
});

router.get("/content/leadership", async (_req, res) => {
  const raw = await querySanity<Record<string, unknown> | null>(
    `*[_type == "leadership"][0]{
      strategyTitle,
      aiPillars,
      "frameworkPDFUrl": frameworkPDF.asset._ref,
      "frameworkImageRef": frameworkImage.asset._ref,
      "philosophyImageRef": philosophyImage.asset._ref,
      missionStatement,
      leadershipPhilosophy,
      keyMetrics,
      quote
    }`,
    null,
  );

  if (!raw) {
    return res.json({ data: null, ready: sanityReady });
  }

  const data = {
    ...raw,
    frameworkPDFUrl: sanityFileUrl(raw.frameworkPDFUrl as string | undefined),
    frameworkImageUrl: sanityImageUrl(raw.frameworkImageRef as string | undefined),
    philosophyImageUrl: sanityImageUrl(raw.philosophyImageRef as string | undefined),
  };

  res.json({ data, ready: sanityReady });
});

export default router;

import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SUBSTACK_RSS_URL = "https://substack.com/@saritsethi/feed";

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
}

function extractText(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i"));
  if (cdataMatch) return cdataMatch[1].trim();
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 10)) {
    const title = stripHtml(extractText(itemXml, "title"));
    const link = extractText(itemXml, "link") || extractText(itemXml, "guid");
    const pubDate = extractText(itemXml, "pubDate");
    const rawDescription = extractText(itemXml, "description");
    const description = stripHtml(rawDescription).slice(0, 300) + (rawDescription.length > 300 ? "…" : "");
    const guid = extractText(itemXml, "guid") || link;

    if (title && link) {
      items.push({ title, link, pubDate, description, guid });
    }
  }

  return items;
}

router.get("/rss/substack", async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(SUBSTACK_RSS_URL, {
    signal: controller.signal,
    headers: { "User-Agent": "sarit.tech RSS reader/1.0" },
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    res.status(502).json({ error: "Failed to fetch RSS feed", items: [] });
    return;
  }

  const xml = await response.text();
  const items = parseRssItems(xml);
  res.json({ items });
});

export default router;

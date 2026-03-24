# Sanity CMS — sarit.tech

## Quick Start

1. **Create a Sanity project** at [sanity.io](https://sanity.io)
2. Install the Sanity CLI: `npm install -g @sanity/cli`
3. Copy your Project ID and set the env vars in Replit:
   - `VITE_SANITY_PROJECT_ID` — your project ID
   - `VITE_SANITY_DATASET` — usually `production`
   - `VITE_SANITY_API_TOKEN` — a read token from sanity.io/manage

4. Deploy schemas to your Sanity project:
   ```bash
   cd sanity
   npm install
   npx sanity deploy
   ```

## Schema Overview

| Schema | Section | Description |
|--------|---------|-------------|
| `timeline` | About | Career milestones displayed in the career timeline |
| `strategyPillar` | Intrapreneur | Strategy pillars (ROI-First, Cross-Functional, etc.) |
| `project` | Builder | Featured projects with tech stack and links |
| `siteSettings` | Global | Hero copy, bio, social links, booking URL |

## Fallback Behavior

When `VITE_SANITY_PROJECT_ID` is set to `placeholder` (the default), the site
automatically uses the static fallback data defined in
`artifacts/sarit-tech/src/hooks/use-content.ts`. No errors are thrown.
Set real credentials to serve live CMS content.

## Substack RSS

Articles in the Builder section are fetched live from your Substack at:
```
/api/rss/substack
```
The `substackUrl` field in **Site Settings** can be used to configure the URL
(requires backend update to read from Sanity instead of the hardcoded default).

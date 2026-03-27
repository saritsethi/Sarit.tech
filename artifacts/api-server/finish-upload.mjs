import { createClient } from "@sanity/client";
import { createReadStream, statSync } from "fs";
import { resolve, extname } from "path";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  useCdn: false, apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
});

const IMG = "../../artifacts/sarit-tech/public/images";
const PUB = "../../artifacts/sarit-tech/public";
const VID = "../../artifacts/sarit-tech/public/videos";

async function upload(type, filepath, filename, mime) {
  const size = (statSync(filepath).size / 1024).toFixed(0);
  console.log(`  Uploading ${filename} (${size}KB)...`);
  const asset = await client.assets.upload(type, createReadStream(filepath), { filename, contentType: mime });
  console.log(`  ✓ ${filename} → ${asset._id}`);
  return asset._id;
}

// Check what's already in Sanity
const existing = await client.fetch('*[_type in ["sanity.imageAsset","sanity.fileAsset"]]{_id,originalFilename}');
console.log(`\nExisting assets in Sanity (${existing.length}):`);
const existingNames = {};
for (const a of existing) {
  console.log(`  ${a._id} — ${a.originalFilename}`);
  existingNames[a.originalFilename] = a._id;
}

// Upload anything missing
async function ensureImage(filename, dir) {
  if (existingNames[filename]) { console.log(`  ⏭  ${filename} already uploaded`); return existingNames[filename]; }
  const ext = extname(filename).slice(1);
  const mime = { jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png" }[ext] || "image/jpeg";
  return upload("image", resolve(dir, filename), filename, mime);
}
async function ensureFile(filename, dir, mime) {
  if (existingNames[filename]) { console.log(`  ⏭  ${filename} already uploaded`); return existingNames[filename]; }
  return upload("file", resolve(dir, filename), filename, mime);
}

console.log("\n=== ENSURING ALL ASSETS UPLOADED ===");
const [portraitId, marinaId, bikingId, bookCoverId, frameworkId, philosophyId, heroGridId, ogImageId] = await Promise.all([
  ensureImage("sarit-portrait.png",          IMG),
  ensureImage("explorer-marina.jpg",         IMG),
  ensureImage("family-biking.jpg",           IMG),
  ensureImage("from-our-verandah.png",       IMG),
  ensureImage("enterprise-ai-framework.png", IMG),
  ensureImage("product-philosophy.png",      IMG),
  ensureImage("hero-grid.png",               IMG),
  ensureImage("opengraph.jpg",               PUB),
]);
const videoId = await ensureFile("sarthai-demo.mp4", VID, "video/mp4");

console.log("\n=== PATCHING SANITY DOCUMENTS ===");
const ref = (id) => ({ _type:"image", asset:{_type:"reference",_ref:id} });
const fileRef = (id) => ({ _type:"file", asset:{_type:"reference",_ref:id} });

await Promise.all([
  client.patch("singleton-about").set({
    portrait: ref(portraitId), explorerImage: ref(marinaId),
    bikingImage: ref(bikingId), bookCoverImage: ref(bookCoverId),
  }).commit().then(() => console.log("  ✓ about")),

  client.patch("singleton-home").set({
    heroImage: ref(portraitId), heroBackgroundImage: ref(heroGridId),
  }).commit().then(() => console.log("  ✓ home")),

  client.patch("singleton-leadership").set({
    frameworkImage: ref(frameworkId), philosophyImage: ref(philosophyId),
  }).commit().then(() => console.log("  ✓ leadership")),

  client.patch("singleton-siteSettings").set({
    ogImage: ref(ogImageId),
  }).commit().then(() => console.log("  ✓ siteSettings")),

  client.patch("akK9tLbFbEeX2MBVaoS3HO").set({
    video: fileRef(videoId),
  }).commit().then(() => console.log("  ✓ project: sarthai video")),
]);

// Print final CDN URLs
const PI = process.env.SANITY_PROJECT_ID, DS = "production";
const imgUrl = (ref) => { const [,id,dim,fmt]=ref.split("-"); return `https://cdn.sanity.io/images/${PI}/${DS}/${id}-${dim}.${fmt}`; };
const fileUrl = (ref) => { const parts=ref.split("-"); const ext=parts[parts.length-1]; const id=parts.slice(1,-1).join("-"); return `https://cdn.sanity.io/files/${PI}/${DS}/${id}.${ext}`; };

console.log("\n=== SANITY CDN URLs ===");
console.log(`portrait:    ${imgUrl(portraitId)}`);
console.log(`marina:      ${imgUrl(marinaId)}`);
console.log(`biking:      ${imgUrl(bikingId)}`);
console.log(`bookCover:   ${imgUrl(bookCoverId)}`);
console.log(`framework:   ${imgUrl(frameworkId)}`);
console.log(`philosophy:  ${imgUrl(philosophyId)}`);
console.log(`heroGrid:    ${imgUrl(heroGridId)}`);
console.log(`ogImage:     ${imgUrl(ogImageId)}`);
console.log(`video:       ${fileUrl(videoId)}`);
console.log("\n✓ All media in Sanity.");

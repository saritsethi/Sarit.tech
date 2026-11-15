/**
 * Google Drive document reader — fetches and extracts text from the sarit.tech_RAG folder.
 * Uses the Google Drive API v3 via a service account (GOOGLE_SERVICE_ACCOUNT_JSON).
 * The service account needs Viewer access to the RAG folder.
 */

import { google } from "googleapis";

// pdf-parse@1.x is CJS-only — load it dynamically so it works in both the
// esbuild bundle (where it is external) and Vercel's serverless bundle.
type PdfParseResult = { text: string };
type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

export const RAG_FOLDER_ID = "1Bh3OLBNodn8WGjjQLC9HyY1jRo8EYmzE";

export interface DriveDocument {
  id: string;
  name: string;
  mimeType: string;
  text: string;
}

type DriveClient = ReturnType<typeof google.drive>;

let driveClient: DriveClient | null = null;

/** Lazily create the Drive client so a missing service account doesn't break app boot. */
function getDrive(): DriveClient {
  if (driveClient) return driveClient;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must be set to a Google service-account JSON key with Viewer access to the RAG Drive folder.",
    );
  }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(raw) as { client_email: string; private_key: string };
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must contain client_email and private_key.",
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  driveClient = google.drive({ version: "v3", auth });
  return driveClient;
}

type DriveFileMeta = { id: string; name: string; mimeType: string };

let pdfParseFn: PdfParseFn | null = null;

async function loadPdfParse(): Promise<PdfParseFn> {
  if (pdfParseFn) return pdfParseFn;
  const mod = (await import("pdf-parse")) as unknown as
    | PdfParseFn
    | { default: PdfParseFn };
  const fn = typeof mod === "function" ? mod : mod.default;
  if (typeof fn !== "function") {
    throw new Error("pdf-parse module did not export a function");
  }
  pdfParseFn = fn;
  return fn;
}

/** List all files in a folder, recursing into subfolders */
async function listFilesInFolder(folderId: string): Promise<DriveFileMeta[]> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType)",
    pageSize: 100,
  });
  const items: DriveFileMeta[] = (res.data.files ?? [])
    .map((f) => ({ id: f.id ?? "", name: f.name ?? "", mimeType: f.mimeType ?? "" }))
    .filter((f) => f.id !== "");

  const results: DriveFileMeta[] = [];
  for (const item of items) {
    if (item.mimeType === "application/vnd.google-apps.folder") {
      console.log(`[RAG] Recursing into subfolder: ${item.name}`);
      const children = await listFilesInFolder(item.id);
      results.push(...children);
    } else {
      results.push(item);
    }
  }
  return results;
}

/** List all files in the RAG folder (including subfolders) */
export async function listRagFiles(): Promise<DriveFileMeta[]> {
  return listFilesInFolder(RAG_FOLDER_ID);
}

/** Export a Google Doc as plain text */
async function exportGoogleDoc(fileId: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.export(
    { fileId, mimeType: "text/plain" },
    { responseType: "text" },
  );
  const data: unknown = res.data;
  return typeof data === "string" ? data : "";
}

/** Download a PDF and extract its text */
async function extractPdfText(fileId: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  const data: unknown = res.data;
  const buffer = Buffer.from(data as ArrayBuffer);
  const parse = await loadPdfParse();
  const parsed = await parse(buffer);
  return parsed.text;
}

/** Fetch and extract text from all documents in the RAG folder */
export async function fetchRagDocuments(): Promise<DriveDocument[]> {
  const files = await listRagFiles();
  const docs: DriveDocument[] = [];

  for (const file of files) {
    try {
      let text = "";

      if (file.mimeType === "application/vnd.google-apps.document") {
        text = await exportGoogleDoc(file.id);
      } else if (file.mimeType === "application/pdf") {
        text = await extractPdfText(file.id);
      } else {
        console.log(`[RAG] Skipping unsupported type: ${file.mimeType} — ${file.name}`);
        continue;
      }

      text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

      if (text.length > 50) {
        docs.push({ id: file.id, name: file.name, mimeType: file.mimeType, text });
        console.log(`[RAG] Loaded: ${file.name} (${text.length} chars)`);
      }
    } catch (err) {
      console.error(`[RAG] Failed to load ${file.name}:`, err);
    }
  }

  return docs;
}

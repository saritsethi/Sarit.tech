/**
 * Google Drive document reader — fetches and extracts text from the sarit.tech_RAG folder.
 * Uses the Replit Connectors SDK (google-drive connection) for authenticated access.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";

// pdf-parse is CJS-only — use globalThis.require (set up by the esbuild banner)
// to avoid ESM default-export resolution errors at runtime.
type PdfParseResult = { text: string };
type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfParse: PdfParseFn = (globalThis as any).require("pdf-parse");

export const RAG_FOLDER_ID = "1Bh3OLBNodn8WGjjQLC9HyY1jRo8EYmzE";

export interface DriveDocument {
  id: string;
  name: string;
  mimeType: string;
  text: string;
}

function getConnectors(): ReplitConnectors {
  return new ReplitConnectors();
}

/** List all files in the RAG folder */
export async function listRagFiles(): Promise<
  Array<{ id: string; name: string; mimeType: string }>
> {
  const connectors = getConnectors();
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files?q=%27${RAG_FOLDER_ID}%27+in+parents+and+trashed%3Dfalse&fields=files(id,name,mimeType)&pageSize=50`,
    { method: "GET" },
  );
  const data = (await response.json()) as {
    files: Array<{ id: string; name: string; mimeType: string }>;
  };
  return data.files ?? [];
}

/** Export a Google Doc as plain text */
async function exportGoogleDoc(fileId: string): Promise<string> {
  const connectors = getConnectors();
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files/${fileId}/export?mimeType=text%2Fplain`,
    { method: "GET" },
  );
  return response.text();
}

/** Download a PDF and extract its text */
async function extractPdfText(fileId: string): Promise<string> {
  const connectors = getConnectors();
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files/${fileId}?alt=media`,
    { method: "GET" },
  );
  const buffer = Buffer.from(await response.arrayBuffer());
  const parsed = await pdfParse(buffer);
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

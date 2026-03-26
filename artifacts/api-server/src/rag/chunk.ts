/**
 * Text chunker — splits documents into overlapping chunks for embedding.
 * Target: ~400 words per chunk, ~50-word overlap.
 */

export interface TextChunk {
  text: string;
  index: number;
}

const CHUNK_WORDS = 400;
const OVERLAP_WORDS = 50;

export function chunkText(text: string): TextChunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_WORDS, words.length);
    const chunkWords = words.slice(start, end);
    const chunkText = chunkWords.join(" ").trim();

    if (chunkText.length > 20) {
      chunks.push({ text: chunkText, index });
      index++;
    }

    if (end >= words.length) break;
    start = end - OVERLAP_WORDS;
  }

  return chunks;
}

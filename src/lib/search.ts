export interface SearchDoc {
  path: string;
  title: string;
  description: string;
  headings: string[];
  excerpt: string;
}

/**
 * Pencocokan: SEMUA token query harus merupakan substring (case-insensitive)
 * dari gabungan title + headings + description + excerpt (AND antar-token).
 * Peringkat berdasarkan jumlah kecocokan berbobot:
 * title x4, headings x2, description x1, excerpt x1. Ikat (tie) memakai
 * urutan indeks asli (urutan nav). Mengembalikan maksimal `limit` hasil.
 */
export function search(docs: SearchDoc[], query: string, limit = 8): SearchDoc[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return docs.slice(0, limit);

  const scored: { doc: SearchDoc; score: number; index: number }[] = [];

  docs.forEach((doc, index) => {
    const title = doc.title.toLowerCase();
    const headings = doc.headings.join(' ').toLowerCase();
    const description = doc.description.toLowerCase();
    const excerpt = doc.excerpt.toLowerCase();
    const all = `${title} ${headings} ${description} ${excerpt}`;

    let score = 0;
    let matched = true;
    for (const token of tokens) {
      if (!all.includes(token)) {
        matched = false;
        break;
      }
      if (title.includes(token)) score += 4;
      if (headings.includes(token)) score += 2;
      if (description.includes(token)) score += 1;
      if (excerpt.includes(token)) score += 1;
    }

    if (matched) scored.push({ doc, score, index });
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, limit).map((s) => s.doc);
}

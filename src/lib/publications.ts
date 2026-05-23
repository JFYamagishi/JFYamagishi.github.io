import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

type BibEntry = {
  entryType: string;
  key: string;
  fields: Record<string, string>;
};

export type Publication = {
  id: string;
  year: number;
  type: string;
  selected: boolean;
  title: string;
  authors: string;
  venue: string;
  links?: Record<string, string>;
  summary: { en: string; ja: string };
};

type PublicationMeta = {
  type?: string;
  selected?: boolean;
  venue?: string;
  links?: Record<string, string>;
  summary?: { en?: string; ja?: string };
};

function readDataFile(filename: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/data', filename), 'utf8');
}

function findMatchingBrace(input: string, openIndex: number): number {
  let depth = 0;
  let escaped = false;

  for (let i = openIndex; i < input.length; i += 1) {
    const char = input[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) return i;
  }

  return -1;
}

function parseBibFields(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let i = 0;

  while (i < body.length) {
    while (i < body.length && /[\s,]/.test(body[i])) i += 1;

    const nameStart = i;
    while (i < body.length && /[A-Za-z0-9_:-]/.test(body[i])) i += 1;
    const name = body.slice(nameStart, i).trim().toLowerCase();

    if (!name) {
      i += 1;
      continue;
    }

    while (i < body.length && /\s/.test(body[i])) i += 1;
    if (body[i] !== '=') continue;
    i += 1;
    while (i < body.length && /\s/.test(body[i])) i += 1;

    let value = '';

    if (body[i] === '{') {
      const end = findMatchingBrace(body, i);
      if (end === -1) break;
      value = body.slice(i + 1, end);
      i = end + 1;
    } else if (body[i] === '"') {
      i += 1;
      const valueStart = i;
      let escaped = false;
      while (i < body.length) {
        if (escaped) {
          escaped = false;
        } else if (body[i] === '\\') {
          escaped = true;
        } else if (body[i] === '"') {
          break;
        }
        i += 1;
      }
      value = body.slice(valueStart, i);
      i += 1;
    } else {
      const valueStart = i;
      while (i < body.length && body[i] !== ',') i += 1;
      value = body.slice(valueStart, i);
    }

    fields[name] = cleanBibValue(value);
  }

  return fields;
}

function parseBibtex(input: string): BibEntry[] {
  const entries: BibEntry[] = [];
  let at = input.indexOf('@');

  while (at !== -1) {
    let i = at + 1;
    while (i < input.length && /[A-Za-z]/.test(input[i])) i += 1;
    const entryType = input.slice(at + 1, i).toLowerCase();

    while (i < input.length && /\s/.test(input[i])) i += 1;
    if (input[i] !== '{') {
      at = input.indexOf('@', i);
      continue;
    }

    const end = findMatchingBrace(input, i);
    if (end === -1) break;

    const inner = input.slice(i + 1, end);
    const comma = inner.indexOf(',');
    if (comma !== -1) {
      const key = inner.slice(0, comma).trim();
      const body = inner.slice(comma + 1);
      entries.push({ entryType, key, fields: parseBibFields(body) });
    }

    at = input.indexOf('@', end + 1);
  }

  return entries;
}

function cleanBibValue(value: string): string {
  return value
    .replace(/\\&/g, '&')
    .replace(/[{}]/g, '')
    .replace(/--/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatOneAuthor(author: string): string {
  const parts = author.split(',').map((part) => part.trim());
  if (parts.length >= 2) {
    return `${parts.slice(1).join(' ')} ${parts[0]}`.trim();
  }
  return author.trim();
}

function formatAuthors(authorField: string): string {
  const authors = authorField.split(/\s+and\s+/i).map(formatOneAuthor).filter(Boolean);
  if (authors.length <= 2) return authors.join(' and ');
  return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
}

function inferVenue(fields: Record<string, string>): string {
  return fields.journal || fields.booktitle || fields.note || fields.publisher || '';
}

function inferType(entry: BibEntry): string {
  if (entry.entryType === 'misc') return 'preprint';
  if (entry.entryType === 'incollection') return 'review article';
  return 'peer-reviewed paper';
}

function inferLinks(fields: Record<string, string>): Record<string, string> | undefined {
  const links: Record<string, string> = {};

  if (fields.url) links.paper = fields.url;
  if (fields.doi) links.doi = `https://doi.org/${fields.doi}`;

  return Object.keys(links).length > 0 ? links : undefined;
}

export function getPublications(): Publication[] {
  const bib = parseBibtex(readDataFile('publications.bib'));
  const meta = YAML.parse(readDataFile('publication-meta.yaml')) as Record<string, PublicationMeta>;

  return bib
    .map((entry) => {
      const itemMeta = meta[entry.key] ?? {};
      const fields = entry.fields;

      const publication: Publication = {
        id: entry.key,
        year: Number(fields.year ?? 0),
        type: itemMeta.type ?? inferType(entry),
        selected: itemMeta.selected ?? false,
        title: fields.title ?? entry.key,
        authors: formatAuthors(fields.author ?? ''),
        venue: itemMeta.venue ?? inferVenue(fields),
        links: itemMeta.links ?? inferLinks(fields),
        summary: {
          en: itemMeta.summary?.en ?? '',
          ja: itemMeta.summary?.ja ?? '',
        },
      };

      return publication;
    })
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

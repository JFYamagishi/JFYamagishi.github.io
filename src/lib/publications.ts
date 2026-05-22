import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

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

export function getPublications(): Publication[] {
  const file = path.join(process.cwd(), 'src/data/publications.yaml');
  const raw = fs.readFileSync(file, 'utf8');
  const pubs = YAML.parse(raw) as Publication[];
  return pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

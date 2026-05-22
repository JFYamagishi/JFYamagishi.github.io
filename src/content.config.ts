import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lang: z.enum(['en', 'ja']),
    date: z.string().optional(),
    status: z.enum(['seed', 'growing', 'evergreen']).default('seed'),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    translationKey: z.string().optional()
  })
});

export const collections = { notes };

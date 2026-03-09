import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Kim Branzell'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const tools = defineCollection({
  loader: glob({ base: './src/content/tools', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    href: z.string().optional(),
    status: z.enum(['live', 'planned']).default('live'),
    featured: z.boolean().default(false),
    badge: z.string().optional(),
  }),
});

const recipes = defineCollection({
  loader: glob({ base: './src/content/recipes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    method: z.enum(['pour-over', 'aeropress', 'french-press']),
    difficulty: z.enum(['Enkel', 'Medel', 'Avancerad']),
    brewTime: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, tools, recipes };
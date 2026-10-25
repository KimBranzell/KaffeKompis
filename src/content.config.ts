import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { brewPlanSchema } from './lib/recipes/schema.js';

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
    brewTime: z.string().optional(),
    brew: brewPlanSchema.optional(),
    featured: z.boolean().default(false),
  }).refine(data => !!data.brew || !!data.brewTime, { message: 'Receptet behöver ett bryggschema eller en bryggtid.' }),
});

export const collections = { blog, tools, recipes };
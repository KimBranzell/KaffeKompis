import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { brewPlanSchema, batchRecipeSchema } from './lib/recipes/schema.js';

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
    method: z.enum(['pour-over', 'aeropress', 'french-press', 'electric-filter']),
    difficulty: z.enum(['Enkel', 'Medel', 'Avancerad']),
    brewTime: z.string().optional(),
    brew: brewPlanSchema.optional(),
    batch: batchRecipeSchema.optional(),
    featured: z.boolean().default(false),
  }).refine(data => !!data.brew || !!data.brewTime, { message: 'Receptet behöver ett bryggschema eller en bryggtid.' })
    .superRefine((data, ctx) => {
      if (data.method === 'electric-filter' ? !data.batch || !!data.brew : !!data.batch) {
        ctx.addIssue({ code: 'custom', path: ['batch'], message: 'Elbryggare behöver batchrecept; manuella metoder använder bryggschemat.' });
      }
      if (data.brew && data.brew.steps.at(-1)?.kind !== (data.method === 'pour-over' ? 'wait' : 'press')) {
        ctx.addIssue({ code: 'custom', path: ['brew', 'steps'], message: 'Avsluta handbryggning med avrinning och immersionsrecept med pressning.' });
      }
    }),
});

export const collections = { blog, tools, recipes };

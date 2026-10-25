import { z } from 'astro/zod';

export const brewPlanSchema = z.object({
  version: z.number().int().positive(),
  coffeeGrams: z.number().positive(),
  ratio: z.number().positive(),
  temperatureC: z.number().min(60).max(100),
  grind: z.string().min(1),
  minDoseGrams: z.number().positive(),
  maxDoseGrams: z.number().positive(),
  maxWaterGrams: z.number().positive(),
  targetTime: z.object({ minSeconds: z.number().int().positive(), maxSeconds: z.number().int().positive() }),
  taste: z.string().min(1),
  yieldNote: z.string().min(1),
  equipment: z.array(z.string().min(1)).min(1),
  preparation: z.array(z.string().min(1)).min(1),
  steps: z.array(z.object({
    kind: z.enum(['pour', 'wait']),
    atSeconds: z.number().int().nonnegative(),
    title: z.string().min(1),
    instruction: z.string().min(1),
    waterGrams: z.number().positive().optional(),
  })).min(2),
  relatedGuides: z.array(z.string()).default([]),
  sources: z.array(z.object({ title: z.string().min(1), url: z.url(), note: z.string().min(1) })).min(1),
  reviewedOn: z.iso.date(),
}).superRefine((plan, ctx) => {
  const issue = (message, path) => ctx.addIssue({ code: 'custom', message, path });
  if (plan.minDoseGrams > plan.coffeeGrams || plan.coffeeGrams > plan.maxDoseGrams) issue('Grunddosen måste ligga inom dosintervallet.', ['coffeeGrams']);
  if (plan.maxDoseGrams * plan.ratio > plan.maxWaterGrams) issue('Dosintervallet överskrider receptets maximala vattenmängd.', ['maxDoseGrams']);
  if (plan.targetTime.minSeconds > plan.targetTime.maxSeconds) issue('Bryggtidens intervall är omvänt.', ['targetTime']);
  let water = 0;
  plan.steps.forEach((step, index) => {
    if ((index === 0 && step.atSeconds !== 0) || (index > 0 && step.atSeconds <= plan.steps[index - 1].atSeconds)) issue('Stegen måste börja vid noll och följa stigande tider.', ['steps', index, 'atSeconds']);
    if ((step.kind === 'pour') !== (step.waterGrams !== undefined)) issue('Endast hällningar ska ha en vattenmängd.', ['steps', index, 'waterGrams']);
    water += step.waterGrams ?? 0;
  });
  if (Math.abs(water - plan.coffeeGrams * plan.ratio) > 0.01) issue('Hällningarna måste tillsammans motsvara receptets vattenmängd.', ['steps']);
  if (plan.steps.at(-1).kind !== 'wait' || plan.steps.at(-1).atSeconds >= plan.targetTime.minSeconds) issue('Avsluta med ett väntesteg före förväntad sluttid.', ['steps']);
});

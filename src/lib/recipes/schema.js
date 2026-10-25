import { z } from 'astro/zod';
import { validCoffeeMeasureFactor } from './batch.js';

const recipeDetails = {
  version: z.number().int().positive(),
  brewer: z.string().min(1),
  grind: z.string().min(1),
  taste: z.string().min(1),
  yieldNote: z.string().min(1),
  equipment: z.array(z.string().min(1)).min(1),
  preparation: z.array(z.string().min(1)).min(1),
  relatedGuides: z.array(z.string()).default([]),
  sources: z.array(z.object({ title: z.string().min(1), url: z.url(), note: z.string().min(1) })).min(1),
  reviewedOn: z.iso.date(),
};

export const batchRecipeSchema = z.object({
  ...recipeDetails,
  waterMl: z.number().int().positive(),
  gramsPerLitre: z.number().int().min(50).max(75),
  gramsPerScoop: z.number().refine(value => validCoffeeMeasureFactor(value, 'scoop'), 'Ange 1–20 g per kaffemått, med högst två decimaler.'),
  gramsPerDl: z.number().refine(value => validCoffeeMeasureFactor(value, 'dl'), 'Ange 10–80 g per dl malet kaffe, med högst två decimaler.'),
  minWaterMl: z.number().int().min(250).max(2000),
  maxWaterMl: z.number().int().min(250).max(2000),
  capacityMl: z.number().int().positive(),
  steps: z.array(z.object({ title: z.string().min(1), instruction: z.string().min(1) })).min(2),
}).superRefine((plan, ctx) => {
  if (plan.minWaterMl > plan.waterMl || plan.waterMl > plan.capacityMl || plan.capacityMl > plan.maxWaterMl) {
    ctx.addIssue({ code: 'custom', path: ['waterMl'], message: 'Grundmängd och kapacitet måste rymmas inom receptets vattenintervall.' });
  }
});

export const brewPlanSchema = z.object({
  ...recipeDetails,
  coffeeGrams: z.number().positive(),
  waterGrams: z.number().positive(),
  dosePresets: z.array(z.number().positive()).min(1).max(5),
  temperatureC: z.number().min(60).max(100),
  minDoseGrams: z.number().positive(),
  maxDoseGrams: z.number().positive(),
  maxWaterGrams: z.number().positive(),
  targetTime: z.object({ minSeconds: z.number().int().positive(), maxSeconds: z.number().int().positive() }),
  steps: z.array(z.object({
    kind: z.enum(['pour', 'wait', 'stir', 'steep', 'press']),
    atSeconds: z.number().int().nonnegative(),
    title: z.string().min(1),
    instruction: z.string().min(1),
    waterGrams: z.number().positive().optional(),
  })).min(2),
}).superRefine((plan, ctx) => {
  const issue = (message, path) => ctx.addIssue({ code: 'custom', message, path });
  if (plan.minDoseGrams > plan.coffeeGrams || plan.coffeeGrams > plan.maxDoseGrams) issue('Grunddosen måste ligga inom dosintervallet.', ['coffeeGrams']);
  if (plan.maxDoseGrams * plan.waterGrams / plan.coffeeGrams > plan.maxWaterGrams + 1e-8) issue('Dosintervallet överskrider receptets maximala vattenmängd.', ['maxDoseGrams']);
  for (const [index, dose] of plan.dosePresets.entries()) {
    if (dose < plan.minDoseGrams || dose > plan.maxDoseGrams || Math.abs(dose * 10 - Math.round(dose * 10)) > 1e-8) issue('Förvalet måste ligga inom dosintervallet och ha högst en decimal.', ['dosePresets', index]);
  }
  if (plan.targetTime.minSeconds > plan.targetTime.maxSeconds) issue('Bryggtidens intervall är omvänt.', ['targetTime']);
  let water = 0;
  plan.steps.forEach((step, index) => {
    if ((index === 0 && step.atSeconds !== 0) || (index > 0 && step.atSeconds <= plan.steps[index - 1].atSeconds)) issue('Stegen måste börja vid noll och följa stigande tider.', ['steps', index, 'atSeconds']);
    if ((step.kind === 'pour') !== (step.waterGrams !== undefined)) issue('Endast hällningar ska ha en vattenmängd.', ['steps', index, 'waterGrams']);
    water += step.waterGrams ?? 0;
  });
  if (plan.steps[0]?.kind !== 'pour') issue('Börja med en hällning när timern startar.', ['steps', 0]);
  if (Math.abs(water - plan.waterGrams) > 0.01) issue('Hällningarna måste tillsammans motsvara receptets vattenmängd.', ['steps']);
  if (!['wait', 'press'].includes(plan.steps.at(-1)?.kind) || plan.steps.at(-1).atSeconds >= plan.targetTime.minSeconds) issue('Avsluta med avrinning eller pressning före förväntad sluttid.', ['steps']);
});

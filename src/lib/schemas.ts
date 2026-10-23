import { z } from 'astro/zod';

export const localized = z.object({ de: z.string().min(1), en: z.string().min(1) });

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const BRANCHES = ['sag', 'viada', 'redhat'] as const;

export const roleSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  title: localized,
  start: yearMonth,
  end: yearMonth.nullable(),
  location: localized.optional(),
  branch: z.enum(BRANCHES),
  summary: localized,
  diff: z.array(z.object({ type: z.enum(['add', 'remove']), de: z.string().min(1), en: z.string().min(1) })),
  tech: z.array(z.string()),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  title: localized,
  location: localized,
  summary: localized,
  skills: z.array(z.string().min(1)).min(1),
  links: z.object({ linkedin: z.string().url(), github: z.string().url() }),
  portrait: z.string().optional(),
});

export const SECTION_IDS = ['start', 'profile', 'career', 'projects', 'offduty', 'contact'] as const;

export const sectionSchema = z.object({
  id: z.enum(SECTION_IDS),
  label: localized,
  headline: localized,
  intro: localized.optional(),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  order: z.number().int(),
  name: z.string().min(1),
  summary: localized,
  url: z.string().url().optional(),
  repo: z.string().url().optional(),
  tags: z.array(z.string()),
});

export const offdutySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  title: localized,
  text: localized,
});

export type Role = z.infer<typeof roleSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SectionContent = z.infer<typeof sectionSchema>;
export type Project = z.infer<typeof projectSchema>;
export type OffdutyItem = z.infer<typeof offdutySchema>;

import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { offdutySchema, profileSchema, projectSchema, roleSchema, sectionSchema } from './lib/schemas';

export const collections = {
  profile: defineCollection({ loader: file('src/content/profile.yaml'), schema: profileSchema }),
  sections: defineCollection({ loader: file('src/content/sections.yaml'), schema: sectionSchema }),
  roles: defineCollection({ loader: glob({ pattern: '*.yaml', base: 'src/content/roles' }), schema: roleSchema }),
  projects: defineCollection({ loader: glob({ pattern: '*.yaml', base: 'src/content/projects' }), schema: projectSchema }),
  offduty: defineCollection({ loader: file('src/content/offduty.yaml'), schema: offdutySchema }),
};

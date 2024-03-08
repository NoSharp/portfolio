import { defineCollection } from 'astro:content';
import { BlogFrontMatterSchema } from '@lib/blogFrontMatter.ts';

const blog = defineCollection({
  schema: BlogFrontMatterSchema,
});

export const collections = { 
  'blog': blog
};
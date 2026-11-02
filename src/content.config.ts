import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string().default('笔记'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

/** 项目：卡门线那一章的条目，每条都有自己的详情页 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.string().default('进行中'),
    progress: z.number().min(0).max(100).default(0),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** 仓库、演示站等外部链接 */
    links: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

/** 日常：同步轨道那一章的条目，同样有详情页 */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    category: z.string().default('日常'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, projects, notes };

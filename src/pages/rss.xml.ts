import type { APIRoute } from 'astro';
import { buildRss } from '../lib/rss';

export const GET: APIRoute = ({ site }) =>
  buildRss('zh', site ?? new URL('https://hunter-stuart.github.io'));

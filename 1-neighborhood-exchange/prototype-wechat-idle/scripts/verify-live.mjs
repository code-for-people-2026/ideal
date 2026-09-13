import { chromium } from '@playwright/test';
import { parseArgs } from 'node:util';
import { checkAccess } from './check-access.mjs';
const { values } = parseArgs({ options: { url: { type: 'string', default: 'https://xianzhi.vercel.codeforpeople.cn' } } });
const origin = new URL(values.url).origin;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const extraHTTPHeaders = {};
  if (process.env.IDLE_DEPLOYMENT_BYPASS && origin.endsWith('.vercel.app')) extraHTTPHeaders['x-vercel-protection-bypass'] = process.env.IDLE_DEPLOYMENT_BYPASS;
  console.log(JSON.stringify(await checkAccess(browser, origin, { extraHTTPHeaders }), null, 2));
} finally { await browser.close(); }

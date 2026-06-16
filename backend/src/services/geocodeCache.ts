import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(__dirname, '..', '..', 'data');
const cacheFile = path.join(dataDir, 'geocode_cache.json');

type CacheEntry = {
  results: Array<{ lat: number; lon: number; display_name: string }>;
  ts: number;
};

const cache = new Map<string, CacheEntry>();

async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

async function loadCache() {
  try {
    const raw = await fs.readFile(cacheFile, 'utf-8');
    const obj = JSON.parse(raw) as Record<string, CacheEntry>;
    for (const k of Object.keys(obj)) cache.set(k, obj[k]);
  } catch {
    // no cache yet
  }
}

async function persistCache() {
  await ensureDir();
  const obj: Record<string, CacheEntry> = {};
  for (const [k, v] of cache.entries()) obj[k] = v;
  await fs.writeFile(cacheFile, JSON.stringify(obj, null, 2), 'utf-8');
}

export async function initCache() {
  await ensureDir();
  await loadCache();
}

export function getCached(query: string): CacheEntry | null {
  const key = query.trim().toLowerCase();
  return cache.get(key) ?? null;
}

export async function setCached(query: string, results: Array<{ lat: number; lon: number; display_name: string }>) {
  const key = query.trim().toLowerCase();
  cache.set(key, { results, ts: Date.now() });
  await persistCache();
}

export async function clearCache() {
  cache.clear();
  await persistCache();
}

export type { CacheEntry };

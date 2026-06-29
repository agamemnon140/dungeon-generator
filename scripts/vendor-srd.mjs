// Vendors a combat-essential subset of monsters + magic items.
//   node scripts/vendor-srd.mjs
//
// Monsters: the full openly-licensed Open5e bestiary (https://api.open5e.com/v1/monsters/),
//   which aggregates the WotC SRD plus Tome of Beasts, Creature Codex, Black Flag SRD, etc.
//   (OGL 1.0a / CC-BY-4.0 / ORC — see ATTRIBUTION.md). ~3200 creatures.
// Magic items: the SRD 5.1 set from 5e-bits/5e-database (pinned by commit SHA).
//
// Output: src/data/srd/{monsters.json, magic-items.json, meta.json}.

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OPEN5E_MONSTERS = 'https://api.open5e.com/v1/monsters/?limit=500';
const BITS_REPO = '5e-bits/5e-database';
const MAGIC_ITEMS_PATH = 'src/2014/en/5e-SRD-Magic-Items.json';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(scriptDir, '../src/data/srd');

const CR_XP = {
  0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
  1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900,
  9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
  16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000,
  23: 50000, 24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000,
  29: 135000, 30: 155000,
};

const ua = { 'User-Agent': 'dungeon-generator-vendor' };

function parseCr(value) {
  if (typeof value === 'number') return value;
  const t = String(value ?? '').trim();
  if (t === '1/8') return 0.125;
  if (t === '1/4') return 0.25;
  if (t === '1/2') return 0.5;
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function normalizeType(t) {
  const s = String(t ?? 'unknown').toLowerCase();
  return s.includes('swarm') ? 'swarm' : s;
}

function speedStr(speed) {
  if (typeof speed === 'string') return speed;
  if (!speed || typeof speed !== 'object') return '';
  return Object.entries(speed)
    .filter(([k]) => k !== 'hover')
    .map(([k, v]) => {
      const val = typeof v === 'number' ? `${v} ft.` : String(v);
      return k === 'walk' ? val : `${k} ${val}`;
    })
    .join(', ');
}

function acValue(ac) {
  if (Array.isArray(ac)) return ac[0]?.value ?? 10;
  if (typeof ac === 'number') return ac;
  return 10;
}

const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

function trimActions(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((a) => a && a.name && typeof a.desc === 'string')
    .slice(0, 6)
    .map((a) => ({ name: a.name, desc: clip(a.desc.replace(/[_*]/g, '').replace(/\s+/g, ' ').trim(), 220) }));
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function trimMonster(m) {
  const cr = parseCr(m.challenge_rating);
  return {
    index: m.slug,
    name: m.name,
    type: normalizeType(m.type),
    subtype: m.subtype ? m.subtype : null,
    size: m.size ? cap(String(m.size)) : 'Medium',
    cr,
    xp: typeof m.xp === 'number' ? m.xp : (CR_XP[cr] ?? 0),
    ac: acValue(m.armor_class),
    hp: typeof m.hit_points === 'number' ? m.hit_points : 0,
    hitDice: m.hit_dice || '',
    speed: speedStr(m.speed),
    actions: trimActions(m.actions),
    source: m.document__title || m.document__slug || '',
    _slug: m.document__slug || '',
  };
}

/** Keep one monster per name, preferring the WotC SRD, then other SRDs, then the rest. */
function dedupeByName(monsters) {
  const rank = (slug) => (slug === 'wotc-srd' ? 0 : slug.includes('srd') ? 1 : 2);
  const byName = new Map();
  for (const m of monsters) {
    const key = m.name.toLowerCase();
    const cur = byName.get(key);
    if (!cur || rank(m._slug) < rank(cur._slug)) byName.set(key, m);
  }
  return [...byName.values()].map(({ _slug, ...rest }) => rest);
}

async function fetchAllMonsters() {
  const all = [];
  let url = OPEN5E_MONSTERS;
  while (url) {
    const res = await fetch(url, { headers: ua });
    if (!res.ok) throw new Error(`Open5e ${res.status} fetching monsters`);
    const page = await res.json();
    all.push(...page.results);
    console.log(`  monsters ${all.length}/${page.count}`);
    url = page.next;
  }
  return all;
}

async function fetchMagicItems() {
  const shaRes = await fetch(`https://api.github.com/repos/${BITS_REPO}/commits/main`, {
    headers: { ...ua, Accept: 'application/vnd.github+json' },
  });
  const sha = (await shaRes.json()).sha;
  const res = await fetch(`https://raw.githubusercontent.com/${BITS_REPO}/${sha}/${MAGIC_ITEMS_PATH}`, { headers: ua });
  if (!res.ok) throw new Error(`Magic items ${res.status}`);
  const raw = await res.json();
  const items = raw
    .map((it) => ({
      index: it.index,
      name: it.name,
      rarity: it.rarity && typeof it.rarity === 'object' ? (it.rarity.name ?? 'Varies') : 'Varies',
    }))
    .filter((it) => it.index && it.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  return { items, sha };
}

async function main() {
  const fetched = (await fetchAllMonsters()).map(trimMonster).filter((m) => m.index && m.name && m.xp > 0);
  const monsters = dedupeByName(fetched).sort((a, b) => a.cr - b.cr || a.name.localeCompare(b.name));
  console.log(`  deduped ${fetched.length} -> ${monsters.length} by name`);

  const { items: magicItems, sha } = await fetchMagicItems();

  const sources = [...new Set(monsters.map((m) => m.source).filter(Boolean))].sort();

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'monsters.json'), JSON.stringify(monsters), 'utf8');
  await writeFile(path.join(outDir, 'magic-items.json'), JSON.stringify(magicItems), 'utf8');
  await writeFile(
    path.join(outDir, 'meta.json'),
    JSON.stringify(
      {
        monsters: { source: 'Open5e v1 /monsters', count: monsters.length, documents: sources },
        magicItems: { source: `${BITS_REPO}/${MAGIC_ITEMS_PATH}`, sha, count: magicItems.length },
        licenses: 'OGL 1.0a / CC-BY-4.0 / ORC — see ATTRIBUTION.md',
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`Wrote ${monsters.length} monsters (${sources.length} sources) + ${magicItems.length} magic items`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Vendors a combat-essential subset of SRD 5.1 monsters from the 5e-bits/5e-database
// project (the dataset behind dnd5eapi.co). The `2014/` files correspond to SRD 5.1.
//
//   node scripts/vendor-srd.mjs            # pins to the current main commit
//   SRD_SHA=<sha> node scripts/vendor-srd.mjs
//
// Output: src/data/srd/monsters.json + src/data/srd/meta.json (both committed).

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = '5e-bits/5e-database';
const MONSTERS_PATH = 'src/2014/en/5e-SRD-Monsters.json';
const MAGIC_ITEMS_PATH = 'src/2014/en/5e-SRD-Magic-Items.json';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(scriptDir, '../src/data/srd');

// Fallback CR→XP (DMG) in case a record is missing `xp`.
const CR_XP = {
  0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
  1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900,
  9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
  16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000,
  23: 50000, 24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000,
  29: 135000, 30: 155000,
};

async function resolveSha() {
  if (process.env.SRD_SHA) return process.env.SRD_SHA;
  const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
    headers: { 'User-Agent': 'dungeon-generator-vendor', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} resolving main sha`);
  const json = await res.json();
  return json.sha;
}

function acValue(ac) {
  if (Array.isArray(ac)) return ac[0]?.value ?? 10;
  if (typeof ac === 'number') return ac;
  return 10;
}

function speedStr(speed) {
  if (!speed || typeof speed !== 'object') return '';
  return Object.entries(speed)
    .map(([k, v]) => (k === 'walk' ? String(v) : `${k} ${v}`))
    .join(', ');
}

function trimActions(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((a) => a && a.name && typeof a.desc === 'string')
    .map((a) => ({ name: a.name, desc: a.desc.replace(/\s+/g, ' ').trim() }));
}

function trimMonster(m) {
  const cr = typeof m.challenge_rating === 'number' ? m.challenge_rating : 0;
  return {
    index: m.index,
    name: m.name,
    type: String(m.type ?? 'unknown').toLowerCase(),
    subtype: m.subtype ?? null,
    size: m.size ?? 'Medium',
    cr,
    xp: typeof m.xp === 'number' ? m.xp : (CR_XP[cr] ?? 0),
    ac: acValue(m.armor_class),
    hp: typeof m.hit_points === 'number' ? m.hit_points : 0,
    hitDice: m.hit_dice ?? '',
    speed: speedStr(m.speed),
    actions: trimActions(m.actions),
  };
}

async function fetchJson(sha, filePath) {
  const url = `https://raw.githubusercontent.com/${REPO}/${sha}/${filePath}`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url, { headers: { 'User-Agent': 'dungeon-generator-vendor' } });
  if (!res.ok) throw new Error(`Fetch ${res.status} for ${filePath}`);
  return res.json();
}

function trimMagicItem(it) {
  const rarity = it.rarity && typeof it.rarity === 'object' ? (it.rarity.name ?? 'Varies') : 'Varies';
  return { index: it.index, name: it.name, rarity };
}

async function main() {
  const sha = await resolveSha();

  const monsters = (await fetchJson(sha, MONSTERS_PATH))
    .map(trimMonster)
    .filter((m) => m.index && m.name)
    .sort((a, b) => a.cr - b.cr || a.name.localeCompare(b.name));

  const magicItems = (await fetchJson(sha, MAGIC_ITEMS_PATH))
    .map(trimMagicItem)
    .filter((it) => it.index && it.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'monsters.json'), JSON.stringify(monsters), 'utf8');
  await writeFile(path.join(outDir, 'magic-items.json'), JSON.stringify(magicItems), 'utf8');
  await writeFile(
    path.join(outDir, 'meta.json'),
    JSON.stringify(
      {
        source: REPO,
        sha,
        monsters: monsters.length,
        magicItems: magicItems.length,
        license: 'CC-BY-4.0 (SRD 5.1)',
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`Wrote ${monsters.length} monsters + ${magicItems.length} magic items (sha ${sha.slice(0, 10)})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

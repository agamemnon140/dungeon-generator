import type { Environment } from '../domain/inputs';

/** Environment-flavored vocabulary for naming rooms. Expanded by narrative grammars later. */

export const ROOM_ADJECTIVES = [
  'Crumbling',
  'Shadowed',
  'Silent',
  'Forgotten',
  'Echoing',
  'Sunken',
  'Cracked',
  'Hollow',
  'Whispering',
  'Ruined',
  'Gloomy',
  'Ancient',
];

export const NOUNS_BY_ENV: Record<Environment, string[]> = {
  cave: ['Cavern', 'Grotto', 'Hollow', 'Fissure', 'Burrow', 'Gallery'],
  crypt: ['Vault', 'Ossuary', 'Catacomb', 'Sepulcher', 'Reliquary', 'Tomb'],
  'ruined-castle': ['Hall', 'Barracks', 'Battlement', 'Keep', 'Solar', 'Armory'],
  sewer: ['Cistern', 'Drain', 'Sluice', 'Channel', 'Outflow', 'Junction'],
  temple: ['Sanctum', 'Nave', 'Shrine', 'Cloister', 'Altar Room', 'Vestry'],
  mine: ['Shaft', 'Drift', 'Stope', 'Adit', 'Cart Bay', 'Dig'],
  dungeon: ['Cell Block', 'Oubliette', 'Guardroom', 'Torture Hall', 'Pit', 'Corridor'],
  'forest-ruins': ['Glade Ruin', 'Overgrown Hall', 'Root Chamber', 'Mossy Court', 'Thicket', 'Henge'],
  frozen: ['Ice Cavern', 'Frost Hall', 'Glacier Vault', 'Rimecrypt', 'Snowmelt Pool', 'Crevasse'],
  volcanic: ['Magma Vent', 'Ashen Hall', 'Obsidian Gallery', 'Lava Bridge', 'Cinder Pit', 'Forge'],
  'desert-tomb': ['Burial Hall', 'Sand-Choked Vault', 'Pharaoh Chamber', 'Hypostyle', 'Reliquary', 'Antechamber'],
  'sunken-ruins': ['Flooded Hall', 'Coral Vault', 'Drowned Shrine', 'Tidal Cavern', 'Kelp Gallery', 'Abyssal Step'],
  'astral-plane': ['Drifting Isle', 'Silver Span', 'Voidcourt', 'Thought Vault', 'Star Bridge', 'Echo Chamber'],
  airship: ['Gun Deck', 'Cargo Hold', 'Helm Cabin', 'Rigging Walk', 'Ballast Bay', 'Crow Deck'],
};

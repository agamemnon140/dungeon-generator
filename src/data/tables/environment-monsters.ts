import type { Environment } from '../../domain/inputs';
import type { MonsterType } from '../srd';

/**
 * Hand-curated mapping from environment to thematically-appropriate SRD monster
 * types. `primary` is the first choice; `secondary` is folded in by the encounter
 * builder's graceful degradation when the primary pool is too thin (notably for
 * niche planes like astral/airship/sunken).
 */
export interface EnvironmentMonsters {
  primary: MonsterType[];
  secondary: MonsterType[];
}

export const ENVIRONMENT_MONSTERS: Record<Environment, EnvironmentMonsters> = {
  cave: { primary: ['beast', 'ooze', 'monstrosity'], secondary: ['giant', 'dragon', 'aberration'] },
  crypt: { primary: ['undead', 'aberration'], secondary: ['fiend', 'construct'] },
  'ruined-castle': {
    primary: ['humanoid', 'undead'],
    secondary: ['construct', 'monstrosity', 'beast'],
  },
  sewer: { primary: ['beast', 'ooze', 'swarm'], secondary: ['aberration', 'humanoid', 'monstrosity'] },
  temple: { primary: ['celestial', 'fiend', 'humanoid'], secondary: ['construct', 'undead'] },
  mine: { primary: ['giant', 'construct', 'humanoid'], secondary: ['elemental', 'beast', 'monstrosity'] },
  dungeon: { primary: ['humanoid', 'undead'], secondary: ['beast', 'construct', 'monstrosity'] },
  'forest-ruins': { primary: ['fey', 'beast', 'plant'], secondary: ['monstrosity', 'humanoid'] },
  frozen: { primary: ['beast', 'elemental', 'giant'], secondary: ['undead', 'dragon', 'monstrosity'] },
  volcanic: { primary: ['elemental', 'fiend', 'dragon'], secondary: ['giant', 'beast', 'construct'] },
  'desert-tomb': { primary: ['undead', 'construct'], secondary: ['aberration', 'monstrosity', 'humanoid'] },
  'sunken-ruins': {
    primary: ['beast', 'aberration', 'elemental'],
    secondary: ['monstrosity', 'humanoid', 'ooze'],
  },
  'astral-plane': {
    primary: ['aberration', 'celestial', 'fiend'],
    secondary: ['construct', 'undead', 'elemental'],
  },
  airship: { primary: ['elemental', 'monstrosity', 'giant'], secondary: ['aberration', 'construct', 'beast'] },
};

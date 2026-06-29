import type { Environment } from '../../domain/inputs';

/** Atmospheric descriptions for flavor rooms, one bank per environment. */
export const FLAVOR_BY_ENVIRONMENT: Record<Environment, string[]> = {
  cave: ['Dripping stalactites and the distant echo of running water.', 'Phosphorescent fungus throws a sickly glow across the rock.'],
  crypt: ['Niches line the walls, their occupants long since crumbled.', 'Dust hangs in the air, undisturbed for centuries until now.'],
  'ruined-castle': ['Collapsed masonry and the tattered banners of a forgotten house.', 'Wind moans through arrow-slits in the broken wall.'],
  sewer: ['Brackish water sluices past ankle-deep over slick stone.', 'The stench is a physical thing here, thick and green.'],
  temple: ['Faded frescoes depict a rite no living priest remembers.', 'A cold draft carries the ghost of old incense.'],
  mine: ['Abandoned tools rust where they were dropped in a hurry.', 'Rotted timbers groan overhead, threatening to give.'],
  dungeon: ['Rusted manacles still hang from the weeping walls.', 'A single scratched tally marks days no one finished counting.'],
  'forest-ruins': ['Roots have split the flagstones; the forest is reclaiming this place.', 'Birdsong stops abruptly at the threshold of the next room.'],
  frozen: ['Frost ferns climb the walls and breath plumes in the air.', 'Something is frozen mid-motion within the blue ice.'],
  volcanic: ['Heat shimmers above cracked stone veined with dull red light.', 'The air tastes of sulfur and the floor is warm underfoot.'],
  'desert-tomb': ['Fine sand has drifted into dunes against the painted walls.', 'Hieroglyphs promise ruin to those who disturb the dead.'],
  'sunken-ruins': ['Water laps at carved steps that descend into the dark.', 'Coral has overgrown the statues, softening their faces.'],
  'astral-plane': ['The floor seems to drift; stars wheel slowly beneath your feet.', 'Distance lies here — the far wall is closer than it should be.'],
  airship: ['Rigging creaks and the deck sways under a high, thin wind.', 'Through a gap in the planks, clouds scud past far below.'],
};

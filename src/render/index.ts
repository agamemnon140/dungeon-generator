import { createElement } from 'react';
import type { DungeonRenderer } from './DungeonRenderer';
import { SvgDiagramRenderer } from './svg/SvgDiagramRenderer';
import { TileGridRenderer } from './tile/TileGridRenderer';

export const nodeLinkRenderer: DungeonRenderer = {
  id: 'node-link',
  label: 'Diagram',
  render: (props) => createElement(SvgDiagramRenderer, props),
};

export const tileGridRenderer: DungeonRenderer = {
  id: 'tile-grid',
  label: 'Battlemap',
  render: (props) => createElement(TileGridRenderer, props),
};

/** Registry of available renderers — both consume the same DungeonGraph. */
export const RENDERERS: Record<string, DungeonRenderer> = {
  [nodeLinkRenderer.id]: nodeLinkRenderer,
  [tileGridRenderer.id]: tileGridRenderer,
};

export const RENDERER_LIST: DungeonRenderer[] = [nodeLinkRenderer, tileGridRenderer];
export const DEFAULT_RENDERER_ID = nodeLinkRenderer.id;

export type { DungeonRenderer, DungeonRendererProps } from './DungeonRenderer';

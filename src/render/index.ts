import { createElement } from 'react';
import type { DungeonRenderer } from './DungeonRenderer';
import { SvgDiagramRenderer } from './svg/SvgDiagramRenderer';

export const nodeLinkRenderer: DungeonRenderer = {
  id: 'node-link',
  label: 'Node Diagram',
  render: (props) => createElement(SvgDiagramRenderer, props),
};

/** Registry of available renderers. A tile/battlemap renderer plugs in here later. */
export const RENDERERS: Record<string, DungeonRenderer> = {
  [nodeLinkRenderer.id]: nodeLinkRenderer,
};

export const DEFAULT_RENDERER_ID = nodeLinkRenderer.id;

export type { DungeonRenderer, DungeonRendererProps } from './DungeonRenderer';

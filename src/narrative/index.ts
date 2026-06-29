import { TemplateNarrativeGenerator } from './TemplateNarrativeGenerator';
import type { NarrativeGenerator } from './NarrativeGenerator';

export * from './tracery';
export * from './NarrativeGenerator';
export { TemplateNarrativeGenerator };

/** The narrative generator used by the pipeline. Swap here for an LLM impl later. */
export const defaultNarrativeGenerator: NarrativeGenerator = new TemplateNarrativeGenerator();

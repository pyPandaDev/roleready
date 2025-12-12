// Resume Builder Module Exports
// Main entry point for all resume builder components

// Types
export * from './types';

// Constants
export {
    PAGE_WIDTH_INCHES,
    PAGE_HEIGHT_INCHES,
    PAGE_PADDING_INCHES,
    USABLE_HEIGHT_INCHES,
    DPI,
    PAGE_WIDTH_PX,
    PAGE_HEIGHT_PX,
    USABLE_HEIGHT_PX,
    printStyles,
    emptyResume,
    sampleResume,
    sectionIcons,
    defaultSectionOrder
} from './constants';

// Templates
export { Templates } from './templates';
export type { TemplateKey } from './templates';
export {
    TemplateStandard,
    TemplateHarvard,
    TemplateModern,
    TemplateCompact,
    TemplateProfessional,
    TemplateTechnical,
    SectionRenderer
} from './templates';

// Components
export { PagedResumeRenderer } from './PagedResumeRenderer';
export { AutoResizeTextarea } from './helpers/AutoResizeTextarea';

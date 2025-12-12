// Template exports and map
import { TemplateStandard } from './TemplateStandard';
import { TemplateHarvard } from './TemplateHarvard';
import { TemplateModern } from './TemplateModern';
import { TemplateCompact } from './TemplateCompact';
import { TemplateProfessional } from './TemplateProfessional';
import { TemplateTechnical } from './TemplateTechnical';
import { SectionRenderer } from './SectionRenderer';

// Template Map
export const Templates = {
    standard: TemplateStandard,
    harvard: TemplateHarvard,
    modern: TemplateModern,
    compact: TemplateCompact,
    professional: TemplateProfessional,
    technical: TemplateTechnical
};

export type TemplateKey = keyof typeof Templates;

// Re-export all templates
export {
    TemplateStandard,
    TemplateHarvard,
    TemplateModern,
    TemplateCompact,
    TemplateProfessional,
    TemplateTechnical,
    SectionRenderer
};

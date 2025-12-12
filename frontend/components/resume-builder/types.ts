import { ResumeProfile } from '../../types';

// Section type for resume sections
export type SectionType = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'volunteering' | 'awards';

// Font type options
export type FontType = 'sans' | 'serif' | 'mono';

// Template props interface
export interface TemplateProps {
    data: ResumeProfile;
    order: SectionType[];
    font: FontType;
    scale: number;
}

// Content block for pagination
export interface ContentBlock {
    id: string;
    type: 'header' | 'summary' | 'section-title' | 'item';
    section?: SectionType;
    content: React.ReactNode;
    height?: number;
}

// Resume builder component props
export interface ResumeBuilderProps {
    setView: (view: 'landing' | 'home' | 'analyze' | 'builder') => void;
    initialData?: string;
}

// Paged resume renderer props
export interface PagedResumeRendererProps {
    data: ResumeProfile;
    order: SectionType[];
    font: FontType;
    template: string;
}

import React from 'react';
import { ResumeProfile } from '../../../types';
import { SectionType } from '../types';

interface SectionRendererProps {
    section: SectionType;
    data: ResumeProfile;
    children?: React.ReactNode;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, data, children }) => {
    const isEmpty = (
        (section === 'experience' && data.experience.length === 0) ||
        (section === 'education' && data.education.length === 0) ||
        (section === 'skills' && data.skills.length === 0) ||
        (section === 'projects' && data.projects.length === 0) ||
        (section === 'certifications' && data.certifications.length === 0) ||
        (section === 'languages' && data.languages.length === 0) ||
        (section === 'volunteering' && data.volunteering.length === 0) ||
        (section === 'awards' && data.awards.length === 0)
    );

    if (section === 'personal' || isEmpty) return null;
    return <>{children}</>;
};

export default SectionRenderer;

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { ResumeProfile } from '../../types';
import { SectionType, FontType, ContentBlock } from './types';
import { USABLE_HEIGHT_PX } from './constants';

interface PagedResumeRendererProps {
    data: ResumeProfile;
    order: SectionType[];
    font: FontType;
    template: string;
}

// This component renders content blocks and measures them, then distributes across pages
export const PagedResumeRenderer: React.FC<PagedResumeRendererProps> = ({ data, order, font, template }) => {
    const measureRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<ContentBlock[][]>([[]]);
    const [measured, setMeasured] = useState(false);

    // Generate all content blocks
    const contentBlocks = useMemo((): ContentBlock[] => {
        const blocks: ContentBlock[] = [];

        // Header block
        blocks.push({
            id: 'header',
            type: 'header',
            content: (
                <div className="border-b border-slate-900 pb-3 mb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-tight mb-1.5">{data.personal.fullName}</h1>
                    <div className="flex flex-wrap gap-x-3 text-sm text-slate-700">
                        {data.personal.location && <span>{data.personal.location}</span>}
                        {data.personal.phone && <span>• {data.personal.phone}</span>}
                        {data.personal.email && <span>• {data.personal.email}</span>}
                        {data.personal.linkedin && <span>• {data.personal.linkedin}</span>}
                    </div>
                </div>
            )
        });

        // Summary block
        if (data.personal.summary) {
            blocks.push({
                id: 'summary',
                type: 'summary',
                content: (
                    <div className="mb-4">
                        <h2 className="text-xs font-bold uppercase border-b border-slate-300 mb-1.5 tracking-wider">Professional Summary</h2>
                        <p className="text-justify leading-relaxed">{data.personal.summary}</p>
                    </div>
                )
            });
        }

        // Section blocks
        order.forEach(section => {
            const sectionData = data[section];
            if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) return;
            if (section === 'personal') return;

            // Section title
            blocks.push({
                id: `${section}-title`,
                type: 'section-title',
                section,
                content: (
                    <div className="mb-2">
                        <h2 className="text-xs font-bold uppercase border-b border-slate-300 tracking-wider capitalize">{section}</h2>
                    </div>
                )
            });

            // Section items
            if (section === 'experience') {
                data.experience.forEach((exp, i) => {
                    blocks.push({
                        id: `exp-${exp.id || i}`,
                        type: 'item',
                        section,
                        content: (
                            <div className="mb-3">
                                <div className="flex justify-between font-bold">
                                    <span>{exp.company}</span>
                                    <span className="text-xs">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                                </div>
                                <div className="flex justify-between italic mb-0.5 text-xs text-slate-700">
                                    <span>{exp.role}</span>
                                    <span>{exp.location}</span>
                                </div>
                                <p className="whitespace-pre-line text-justify pl-1">{exp.description}</p>
                            </div>
                        )
                    });
                });
            }

            if (section === 'education') {
                data.education.forEach((edu, i) => {
                    blocks.push({
                        id: `edu-${edu.id || i}`,
                        type: 'item',
                        section,
                        content: (
                            <div className="mb-2 flex justify-between">
                                <div>
                                    <span className="font-bold block">{edu.institution}</span>
                                    <span className="text-sm italic">{edu.degree}</span>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="block font-bold">{edu.location}</span>
                                    <span>{edu.startDate} – {edu.endDate}</span>
                                </div>
                            </div>
                        )
                    });
                });
            }

            if (section === 'skills') {
                blocks.push({
                    id: 'skills-all',
                    type: 'item',
                    section,
                    content: (
                        <div className="text-sm mb-2">
                            {data.skills.map(skill => (
                                <div key={skill.id} className="flex mb-1">
                                    <span className="font-bold w-32 shrink-0 text-xs uppercase pt-0.5">{skill.category}:</span>
                                    <span>{skill.items}</span>
                                </div>
                            ))}
                        </div>
                    )
                });
            }

            if (section === 'projects') {
                data.projects.forEach((proj, i) => {
                    blocks.push({
                        id: `proj-${proj.id || i}`,
                        type: 'item',
                        section,
                        content: (
                            <div className="mb-2">
                                <div className="font-bold">{proj.name}</div>
                                <p className="text-xs italic mb-0.5 text-slate-600">{proj.technologies}</p>
                                <p className="text-justify">{proj.description}</p>
                            </div>
                        )
                    });
                });
            }

            if (section === 'certifications') {
                data.certifications.forEach((cert, i) => {
                    blocks.push({
                        id: `cert-${cert.id || i}`,
                        type: 'item',
                        section,
                        content: (
                            <div className="flex justify-between mb-1">
                                <span className="font-bold">{cert.name} <span className="font-normal text-slate-600">| {cert.issuer}</span></span>
                                <span className="text-sm">{cert.date}</span>
                            </div>
                        )
                    });
                });
            }

            if (section === 'languages') {
                data.languages.forEach((lang, i) => {
                    blocks.push({
                        id: `lang-${lang.id || i}`,
                        type: 'item',
                        section,
                        content: (
                            <div className="flex justify-between mb-1">
                                <span>{lang.language}</span>
                                <span className="text-slate-600">{lang.proficiency}</span>
                            </div>
                        )
                    });
                });
            }

            if (section === 'awards') {
                data.awards.forEach((aw, i) => {
                    blocks.push({
                        id: `award-${aw.id || i}`,
                        type: 'item',
                        section,
                        content: (
                            <div className="mb-1">
                                <div className="flex justify-between">
                                    <span className="font-bold">{aw.title} <span className="font-normal">| {aw.issuer}</span></span>
                                    <span className="text-sm">{aw.date}</span>
                                </div>
                            </div>
                        )
                    });
                });
            }
        });

        return blocks;
    }, [data, order]);

    // Measure and paginate
    useEffect(() => {
        if (!measureRef.current || contentBlocks.length === 0) return;

        // Use RAF for reliable measurement after paint
        const rafId = requestAnimationFrame(() => {
            const container = measureRef.current;
            if (!container) return;

            const blockElements = container.querySelectorAll('.measure-block');

            const measuredBlocks: ContentBlock[] = contentBlocks.map((block, i) => ({
                ...block,
                height: blockElements[i]?.getBoundingClientRect().height || 0
            }));

            // Distribute blocks across pages
            const newPages: ContentBlock[][] = [];
            let currentPage: ContentBlock[] = [];
            let currentHeight = 0;
            const maxHeight = USABLE_HEIGHT_PX; // 960px

            measuredBlocks.forEach(block => {
                const blockHeight = block.height || 0;
                if (currentHeight + blockHeight > maxHeight && currentPage.length > 0) {
                    newPages.push(currentPage);
                    currentPage = [];
                    currentHeight = 0;
                }
                currentPage.push(block);
                currentHeight += blockHeight;
            });

            if (currentPage.length > 0) {
                newPages.push(currentPage);
            }

            setPages(newPages.length > 0 ? newPages : [[]]);
            setMeasured(true);
        });

        return () => cancelAnimationFrame(rafId);
    }, [contentBlocks]);

    const fontClass = font === 'serif' ? 'font-serif' : 'font-sans';

    return (
        <>
            {/* Hidden measurement container */}
            <div
                ref={measureRef}
                className={cn("fixed left-[-9999px] top-0 bg-white text-slate-900 text-[10.5pt] leading-snug", fontClass)}
                style={{ width: '7.5in', padding: '0.5in' }}
            >
                {contentBlocks.map((block, i) => (
                    <div key={block.id} className="measure-block">
                        {block.content}
                    </div>
                ))}
            </div>

            {/* Rendered pages */}
            <div className="resume-pages-container">
                {pages.map((pageBlocks, pageIndex) => (
                    <div key={pageIndex} className="resume-page">
                        <div className={cn("resume-page-content text-slate-900 text-[10.5pt] leading-snug", fontClass)}>
                            {pageBlocks.map(block => (
                                <div key={block.id} className="resume-content-block">
                                    {block.content}
                                </div>
                            ))}
                        </div>
                        {pages.length > 1 && (
                            <div className="page-number-indicator">
                                Page {pageIndex + 1} of {pages.length}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default PagedResumeRenderer;

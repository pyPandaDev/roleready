import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TemplateProps } from '../types';
import { SectionRenderer } from './SectionRenderer';

export const TemplateStandard: React.FC<TemplateProps> = ({ data, order, font }) => (
    <div className={cn("p-8 w-[8.5in] min-h-[11in] bg-white text-slate-900 text-[10.5pt] leading-snug", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <div className="border-b border-slate-900 pb-3 mb-4">
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-1.5">{data.personal.fullName}</h1>
            <div className="flex flex-wrap gap-x-3 text-sm text-slate-700">
                {data.personal.location && <span>{data.personal.location}</span>}
                {data.personal.phone && <span>• {data.personal.phone}</span>}
                {data.personal.email && <span>• {data.personal.email}</span>}
                {data.personal.linkedin && <span>• {data.personal.linkedin}</span>}
            </div>
        </div>

        {data.personal.summary && (
            <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-xs font-bold uppercase border-b border-slate-300 mb-1.5 tracking-wider">Professional Summary</h2>
                <p className="text-justify leading-relaxed">{data.personal.summary}</p>
            </div>
        )}

        {order.map(section => (
            <React.Fragment key={section}>
                <SectionRenderer section={section} data={data}>
                    <div className="mb-4" style={{ pageBreakInside: 'avoid' }}>
                        <h2 className="text-xs font-bold uppercase border-b border-slate-300 mb-2 tracking-wider">{section}</h2>

                        {section === 'experience' && data.experience.map(exp => (
                            <div key={exp.id} className="mb-3 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
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
                        ))}

                        {section === 'education' && data.education.map(edu => (
                            <div key={edu.id} className="mb-2 last:mb-0 flex justify-between" style={{ pageBreakInside: 'avoid' }}>
                                <div>
                                    <span className="font-bold block">{edu.institution}</span>
                                    <span className="text-sm italic">{edu.degree}</span>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="block font-bold">{edu.location}</span>
                                    <span>{edu.startDate} – {edu.endDate}</span>
                                </div>
                            </div>
                        ))}

                        {section === 'skills' && (
                            <div className="text-sm">
                                {data.skills.map(skill => (
                                    <div key={skill.id} className="flex mb-1 last:mb-0">
                                        <span className="font-bold w-32 shrink-0 text-xs uppercase pt-0.5">{skill.category}:</span>
                                        <span>{skill.items}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {section === 'projects' && data.projects.map(proj => (
                            <div key={proj.id} className="mb-2 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
                                <div className="flex justify-between items-center font-bold">
                                    <span className="flex items-center gap-2">
                                        {proj.name}
                                        {proj.link && (
                                            <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                <LinkIcon className="w-3 h-3" />
                                            </a>
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs italic mb-0.5 text-slate-600">{proj.technologies}</p>
                                <p className="text-justify">{proj.description}</p>
                            </div>
                        ))}

                        {section === 'certifications' && data.certifications.map(cert => (
                            <div key={cert.id} className="flex justify-between items-center mb-1 last:mb-0">
                                <span className="font-bold">{cert.name} <span className="font-normal text-slate-600">| {cert.issuer}</span></span>
                                <span className="text-sm">{cert.date}</span>
                            </div>
                        ))}

                        {section === 'languages' && data.languages.map(lang => (
                            <div key={lang.id} className="flex justify-between mb-1">
                                <span>{lang.language}</span>
                                <span className="text-slate-600">{lang.proficiency}</span>
                            </div>
                        ))}

                        {section === 'awards' && data.awards.map(aw => (
                            <div key={aw.id} className="mb-1 last:mb-0">
                                <div className="flex justify-between">
                                    <span className="font-bold">{aw.title} <span className="font-normal">| {aw.issuer}</span></span>
                                    <span className="text-sm">{aw.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionRenderer>
            </React.Fragment>
        ))}
    </div>
);

export default TemplateStandard;

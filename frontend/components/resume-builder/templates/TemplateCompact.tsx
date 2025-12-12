import React from 'react';
import { cn } from '../../../lib/utils';
import { TemplateProps } from '../types';
import { SectionRenderer } from './SectionRenderer';

export const TemplateCompact: React.FC<TemplateProps> = ({ data, order, font }) => (
    <div className={cn("p-6 w-[8.5in] min-h-[11in] bg-white text-black text-[9pt] leading-tight", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <div className="text-center mb-3 pb-2 border-b border-black"><h1 className="text-xl font-bold uppercase tracking-wide">{data.personal.fullName}</h1><div className="text-[8pt] mt-1 flex flex-wrap justify-center gap-x-2">{data.personal.location && <span>{data.personal.location}</span>}{data.personal.phone && <span>| {data.personal.phone}</span>}{data.personal.email && <span>| {data.personal.email}</span>}{data.personal.linkedin && <span>| {data.personal.linkedin}</span>}</div></div>
        {data.personal.summary && (<div className="mb-2" style={{ pageBreakInside: 'avoid' }}><p className="text-[9pt] text-justify">{data.personal.summary}</p></div>)}
        {order.map(section => (<React.Fragment key={section}><SectionRenderer section={section} data={data}><div className="mb-2" style={{ pageBreakInside: 'avoid' }}><h2 className="text-[10pt] font-bold uppercase border-b border-gray-400 mb-1 pb-0.5">{section}</h2>
            {section === 'experience' && data.experience.map(exp => (<div key={exp.id} className="mb-2" style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between font-bold text-[9pt]"><span>{exp.role} | {exp.company}</span><span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span></div><ul className="list-disc ml-4 text-[8pt] space-y-0">{exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}</ul></div>))}
            {section === 'education' && data.education.map(edu => (<div key={edu.id} className="flex justify-between text-[9pt]"><span><strong>{edu.degree}</strong> - {edu.institution}</span><span>{edu.endDate}</span></div>))}
            {section === 'skills' && (<div className="text-[9pt]">{data.skills.map(s => (<div key={s.id}><strong>{s.category}:</strong> {s.items}</div>))}</div>)}
            {section === 'projects' && data.projects.map(proj => (<div key={proj.id} className="mb-1 text-[9pt]" style={{ pageBreakInside: 'avoid' }}><strong>{proj.name}</strong> ({proj.technologies}) - {proj.description}</div>))}
            {section === 'certifications' && data.certifications.map(c => (<div key={c.id} className="text-[9pt]">{c.name} - {c.issuer} ({c.date})</div>))}
            {section === 'languages' && data.languages.map(l => (<span key={l.id} className="mr-3 text-[9pt]">{l.language}: {l.proficiency}</span>))}
        </div></SectionRenderer></React.Fragment>))}
    </div>
);

export default TemplateCompact;

import React from 'react';
import { cn } from '../../../lib/utils';
import { TemplateProps } from '../types';
import { SectionRenderer } from './SectionRenderer';

export const TemplateProfessional: React.FC<TemplateProps> = ({ data, order, font }) => (
    <div className={cn("p-10 w-[8.5in] min-h-[11in] bg-white text-gray-900 text-[10pt]", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 mb-1">{data.personal.fullName}</h1><div className="text-sm text-gray-600 flex flex-wrap gap-x-4">{data.personal.email && <span>{data.personal.email}</span>}{data.personal.phone && <span>{data.personal.phone}</span>}{data.personal.location && <span>{data.personal.location}</span>}{data.personal.linkedin && <span>{data.personal.linkedin}</span>}</div></div>
        {data.personal.summary && (<div className="mb-5" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold uppercase text-sm tracking-wide text-gray-700 mb-2 border-b pb-1">Summary</h2><p className="text-justify leading-relaxed">{data.personal.summary}</p></div>)}
        {order.map(section => (<React.Fragment key={section}><SectionRenderer section={section} data={data}><div className="mb-5" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold uppercase text-sm tracking-wide text-gray-700 mb-2 border-b pb-1">{section}</h2>
            {section === 'experience' && data.experience.map(exp => (<div key={exp.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between"><div><div className="font-bold">{exp.role}</div><div className="text-gray-600">{exp.company}, {exp.location}</div></div><div className="text-sm text-gray-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div></div><ul className="list-disc ml-4 mt-1 text-gray-700 space-y-0.5">{exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}</ul></div>))}
            {section === 'education' && data.education.map(edu => (<div key={edu.id} className="mb-2 flex justify-between"><div><div className="font-bold">{edu.degree}</div><div className="text-gray-600">{edu.institution}</div></div><div className="text-sm text-gray-500">{edu.endDate}</div></div>))}
            {section === 'skills' && data.skills.map(s => (<div key={s.id} className="mb-1"><strong>{s.category}:</strong> {s.items}</div>))}
            {section === 'projects' && data.projects.map(proj => (<div key={proj.id} className="mb-2" style={{ pageBreakInside: 'avoid' }}><div className="font-bold">{proj.name} <span className="font-normal text-gray-500">({proj.technologies})</span></div><p className="text-gray-700">{proj.description}</p></div>))}
            {section === 'certifications' && data.certifications.map(c => (<div key={c.id} className="mb-1"><strong>{c.name}</strong> - {c.issuer} ({c.date})</div>))}
            {section === 'languages' && data.languages.map(l => (<div key={l.id} className="flex justify-between mb-0.5"><span>{l.language}</span><span className="text-gray-500">{l.proficiency}</span></div>))}
        </div></SectionRenderer></React.Fragment>))}
    </div>
);

export default TemplateProfessional;

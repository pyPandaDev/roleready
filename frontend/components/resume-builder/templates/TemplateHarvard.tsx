import React from 'react';
import { TemplateProps } from '../types';
import { SectionRenderer } from './SectionRenderer';

export const TemplateHarvard: React.FC<TemplateProps> = ({ data, order }) => (
    <div className="p-10 w-[8.5in] min-h-[11in] bg-white text-black font-serif text-[10pt] leading-tight">
        <div className="text-center mb-4">
            <h1 className="text-2xl font-bold uppercase mb-1">{data.personal.fullName}</h1>
            <p className="text-sm">{data.personal.location} • {data.personal.phone} • {data.personal.email} • {data.personal.linkedin}</p>
        </div>
        {data.personal.summary && (<div className="mb-3" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold border-b border-black mb-1.5 text-sm">SUMMARY</h2><p className="leading-snug">{data.personal.summary}</p></div>)}
        {order.map(section => (<React.Fragment key={section}><SectionRenderer section={section} data={data}><div className="mb-3" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold border-b border-black mb-2 text-sm uppercase">{section}</h2>
            {section === 'education' && data.education.map(edu => (<div key={edu.id} className="mb-2" style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between font-bold"><span>{edu.institution}</span><span>{edu.location}</span></div><div className="flex justify-between italic"><span>{edu.degree}</span><span>{edu.startDate} – {edu.endDate}</span></div></div>))}
            {section === 'experience' && data.experience.map(exp => (<div key={exp.id} className="mb-3" style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between font-bold"><span>{exp.company}</span><span>{exp.location}</span></div><div className="flex justify-between italic mb-1"><span>{exp.role}</span><span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span></div><ul className="list-disc ml-4 space-y-0.5">{exp.description.split('\n').map((line, i) => line.trim() && <li key={i} className="pl-1">{line.replace(/^- /, '')}</li>)}</ul></div>))}
            {section === 'skills' && (<div className="pl-0">{data.skills.map(s => (<div key={s.id} className="mb-0.5"><span className="font-bold">{s.category}:</span> {s.items}</div>))}</div>)}
            {section === 'projects' && data.projects.map(proj => (<div key={proj.id} className="mb-2" style={{ pageBreakInside: 'avoid' }}><span className="font-bold inline">{proj.name}</span><span className="text-xs italic ml-2">({proj.technologies})</span><p className="pl-0 mt-0.5">{proj.description}</p></div>))}
            {section === 'certifications' && data.certifications.map(c => (<div key={c.id} className="mb-0.5">{c.name} - {c.issuer} ({c.date})</div>))}
            {section === 'languages' && data.languages.map(l => (<div key={l.id} className="flex justify-between mb-0.5"><span>{l.language}</span><span>{l.proficiency}</span></div>))}
        </div></SectionRenderer></React.Fragment>))}
    </div>
);

export default TemplateHarvard;

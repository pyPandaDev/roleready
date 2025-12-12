import React from 'react';
import { TemplateProps } from '../types';
import { SectionRenderer } from './SectionRenderer';

export const TemplateTechnical: React.FC<TemplateProps> = ({ data, order }) => (
    <div className="p-8 w-[8.5in] min-h-[11in] bg-white text-black text-[10pt] font-mono">
        <div className="mb-4 border-b-2 border-black pb-3"><h1 className="text-2xl font-bold">{data.personal.fullName}</h1><div className="text-sm mt-1 flex flex-wrap gap-x-3 text-gray-700">{data.personal.email && <span>📧 {data.personal.email}</span>}{data.personal.phone && <span>📱 {data.personal.phone}</span>}{data.personal.location && <span>📍 {data.personal.location}</span>}{data.personal.linkedin && <span>🔗 {data.personal.linkedin}</span>}</div></div>
        {data.skills.length > 0 && (<div className="mb-4" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold uppercase text-sm mb-2 bg-gray-100 px-2 py-1">Technical Skills</h2>{data.skills.map(s => (<div key={s.id} className="mb-1"><strong>{s.category}:</strong> {s.items}</div>))}</div>)}
        {data.personal.summary && (<div className="mb-4" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold uppercase text-sm mb-2 bg-gray-100 px-2 py-1">Profile</h2><p className="text-justify">{data.personal.summary}</p></div>)}
        {order.filter(s => s !== 'skills').map(section => (<React.Fragment key={section}><SectionRenderer section={section} data={data}><div className="mb-4" style={{ pageBreakInside: 'avoid' }}><h2 className="font-bold uppercase text-sm mb-2 bg-gray-100 px-2 py-1">{section}</h2>
            {section === 'experience' && data.experience.map(exp => (<div key={exp.id} className="mb-3" style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between font-bold"><span>{exp.role}</span><span className="text-sm">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span></div><div className="text-gray-600 text-sm">{exp.company} | {exp.location}</div><ul className="list-disc ml-4 mt-1">{exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}</ul></div>))}
            {section === 'projects' && data.projects.map(proj => (<div key={proj.id} className="mb-2" style={{ pageBreakInside: 'avoid' }}><div className="font-bold">{proj.name}</div><div className="text-sm text-gray-600">Tech: {proj.technologies}</div><p>{proj.description}</p></div>))}
            {section === 'education' && data.education.map(edu => (<div key={edu.id} className="flex justify-between"><span><strong>{edu.degree}</strong> - {edu.institution}</span><span>{edu.endDate}</span></div>))}
            {section === 'certifications' && data.certifications.map(c => (<div key={c.id}><strong>{c.name}</strong> - {c.issuer} ({c.date})</div>))}
        </div></SectionRenderer></React.Fragment>))}
    </div>
);

export default TemplateTechnical;

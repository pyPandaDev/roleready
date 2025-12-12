import React from 'react';
import { cn } from '../../../lib/utils';
import { TemplateProps } from '../types';
import { SectionRenderer } from './SectionRenderer';

export const TemplateModern: React.FC<TemplateProps> = ({ data, order, font }) => (
    <div className={cn("p-8 w-[8.5in] min-h-[11in] bg-white text-slate-800 text-[10pt]", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
            <div><h1 className="text-4xl font-black mb-1 tracking-tighter uppercase">{data.personal.fullName}</h1><p className="text-base text-slate-500 font-bold">{data.experience[0]?.role || 'Professional'}</p></div>
            <div className="text-right text-xs space-y-0.5"><div>{data.personal.email}</div><div>{data.personal.phone}</div><div>{data.personal.location}</div><div>{data.personal.linkedin}</div></div>
        </div>
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
                {data.personal.summary && (<div className="mb-5" style={{ pageBreakInside: 'avoid' }}><h3 className="font-black text-xs uppercase tracking-widest mb-2 text-slate-400">Profile</h3><p className="leading-snug text-justify">{data.personal.summary}</p></div>)}
                {order.filter(s => ['experience', 'projects', 'volunteering', 'awards'].includes(s)).map(section => (<React.Fragment key={section}><SectionRenderer section={section} data={data}><div className="mb-5" style={{ pageBreakInside: 'avoid' }}><h3 className="font-black text-xs uppercase tracking-widest mb-3 text-slate-400 border-b border-slate-100 pb-1">{section}</h3>
                    {section === 'experience' && data.experience.map(exp => (<div key={exp.id} className="mb-4" style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between items-baseline mb-0.5"><h4 className="font-bold text-sm text-slate-900">{exp.role}</h4><span className="text-[10px] font-bold text-slate-400">{exp.startDate} — {exp.endDate}</span></div><div className="text-xs font-bold text-teal-700 mb-1">{exp.company}</div><p className="text-[10pt] leading-snug text-slate-700 whitespace-pre-line">{exp.description}</p></div>))}
                    {section === 'projects' && data.projects.map(proj => (<div key={proj.id} className="mb-3" style={{ pageBreakInside: 'avoid' }}><h4 className="font-bold text-slate-900">{proj.name}</h4><p className="text-[9pt] text-slate-500 mb-1 font-mono">{proj.technologies}</p><p className="leading-snug text-slate-700">{proj.description}</p></div>))}
                    {section === 'awards' && data.awards.map(aw => (<div key={aw.id} className="mb-2"><div className="flex justify-between text-sm"><span className="font-bold">{aw.title}</span><span className="text-xs text-slate-400">{aw.date}</span></div><div className="text-xs text-teal-700">{aw.issuer}</div></div>))}
                </div></SectionRenderer></React.Fragment>))}
            </div>
            <div className="col-span-4 border-l border-slate-100 pl-4">
                {order.filter(s => !['experience', 'projects', 'personal', 'volunteering', 'awards'].includes(s)).map(section => (<React.Fragment key={section}><SectionRenderer section={section} data={data}><div className="mb-6" style={{ pageBreakInside: 'avoid' }}><h3 className="font-black text-[10px] uppercase tracking-widest mb-3 text-slate-400 border-b border-slate-100 pb-1">{section}</h3>
                    {section === 'education' && data.education.map(edu => (<div key={edu.id} className="mb-3"><div className="font-bold text-slate-900 leading-tight">{edu.institution}</div><div className="text-xs text-slate-600 mb-0.5">{edu.degree}</div><div className="text-[10px] text-slate-400">{edu.startDate} - {edu.endDate}</div></div>))}
                    {section === 'skills' && data.skills.map(s => (<div key={s.id} className="mb-3"><div className="font-bold text-xs text-slate-900 mb-0.5 uppercase">{s.category}</div><div className="text-[10pt] text-slate-600 leading-tight">{s.items}</div></div>))}
                    {section === 'certifications' && data.certifications.map(c => (<div key={c.id} className="mb-2"><div className="font-bold text-xs leading-tight">{c.name}</div><div className="text-[10px] text-slate-500">{c.issuer} • {c.date}</div></div>))}
                    {section === 'languages' && data.languages.map(l => (<div key={l.id} className="flex justify-between text-xs mb-1 border-b border-slate-50 pb-1"><span className="font-medium">{l.language}</span><span className="text-slate-500">{l.proficiency}</span></div>))}
                </div></SectionRenderer></React.Fragment>))}
            </div>
        </div>
    </div>
);

export default TemplateModern;

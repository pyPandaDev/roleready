import React from 'react';
import {
    User, Briefcase, GraduationCap, Code2, FolderGit2,
    Award, Globe, Heart, Trophy
} from 'lucide-react';
import { ResumeProfile } from '../../types';
import { SectionType } from './types';

// Page dimensions (Letter size)
export const PAGE_WIDTH_INCHES = 8.5;
export const PAGE_HEIGHT_INCHES = 11;
export const PAGE_PADDING_INCHES = 0.5;
export const USABLE_HEIGHT_INCHES = PAGE_HEIGHT_INCHES - (2 * PAGE_PADDING_INCHES);

// Convert inches to pixels (96 DPI standard)
export const DPI = 96;
export const PAGE_WIDTH_PX = PAGE_WIDTH_INCHES * DPI; // 816px
export const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * DPI; // 1056px
export const USABLE_HEIGHT_PX = USABLE_HEIGHT_INCHES * DPI; // 960px

// Print and Page Styles
export const printStyles = `
@media print {
    @page {
        size: 8.5in 11in;
        margin: 0;
    }
    
    body * {
        visibility: hidden;
    }
    
    .resume-pages-container, .resume-pages-container * {
        visibility: visible;
    }
    
    .resume-pages-container {
        position: absolute;
        left: 0;
        top: 0;
    }
    
    .resume-page {
        page-break-after: always;
        box-shadow: none !important;
        margin: 0 !important;
    }
    
    .resume-page:last-child {
        page-break-after: auto;
    }
    
    .page-number-indicator {
        display: none !important;
    }
}

/* Page container - vertical stack of pages */
.resume-pages-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
}

/* Individual page - fixed dimensions */
.resume-page {
    width: 8.5in;
    height: 11in;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
}

/* Page content area with padding */
.resume-page-content {
    padding: 0.5in;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

/* Page number badge */
.page-number-indicator {
    position: absolute;
    bottom: 8px;
    right: 12px;
    background: #1e293b;
    color: white;
    padding: 4px 12px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    opacity: 0.7;
}

/* Content block - each section that can be moved between pages */
.resume-content-block {
    margin-bottom: 12px;
}

.resume-content-block:last-child {
    margin-bottom: 0;
}
`;

// Empty resume template
export const emptyResume: ResumeProfile = {
    personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    volunteering: [],
    awards: []
};

// Sample resume data for auto-loading
export const sampleResume: ResumeProfile = {
    personal: {
        fullName: "Alex Rivera",
        email: "alex.rivera@example.com",
        phone: "+1 (555) 012-3456",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexrivera",
        github: "github.com/alexrivera",
        website: "alexrivera.dev",
        summary: "Senior Full Stack Engineer with 6+ years of experience building scalable web applications. Expert in React, Node.js, and cloud infrastructure. Led engineering teams of up to 8 developers, delivered products serving 2M+ users."
    },
    experience: [
        {
            id: "exp1",
            company: "TechCorp Inc.",
            role: "Senior Software Engineer",
            location: "San Francisco, CA",
            startDate: "Jan 2022",
            endDate: "Present",
            current: true,
            description: "- Led development of microservices architecture serving 2M+ daily users\n- Reduced API response times by 60% through optimization\n- Mentored team of 5 junior developers"
        },
        {
            id: "exp2",
            company: "StartupXYZ",
            role: "Full Stack Developer",
            location: "Remote",
            startDate: "Mar 2019",
            endDate: "Dec 2021",
            current: false,
            description: "- Built React-based dashboard used by 500+ enterprise clients\n- Implemented CI/CD pipeline reducing deployment time by 80%\n- Integrated payment processing handling $2M+ monthly transactions"
        }
    ],
    education: [
        {
            id: "edu1",
            institution: "University of California, Berkeley",
            degree: "B.S. Computer Science",
            location: "Berkeley, CA",
            startDate: "2015",
            endDate: "2019",
            current: false
        }
    ],
    skills: [
        { id: "sk1", category: "Languages", items: "JavaScript, TypeScript, Python, Go, SQL" },
        { id: "sk2", category: "Frontend", items: "React, Next.js, Vue.js, TailwindCSS, HTML/CSS" },
        { id: "sk3", category: "Backend", items: "Node.js, Express, FastAPI, PostgreSQL, MongoDB" },
        { id: "sk4", category: "DevOps", items: "AWS, Docker, Kubernetes, GitHub Actions, Terraform" }
    ],
    projects: [
        {
            id: "proj1",
            name: "OpenSource CLI Tool",
            description: "Command-line tool for automating development workflows. 2,000+ GitHub stars.",
            technologies: "Go, Cobra, REST APIs",
            link: "github.com/alexrivera/cli-tool"
        }
    ],
    certifications: [
        { id: "cert1", name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023", link: "" }
    ],
    languages: [
        { id: "lang1", language: "English", proficiency: "Native" },
        { id: "lang2", language: "Spanish", proficiency: "Professional" }
    ],
    volunteering: [],
    awards: []
};

// Section Icons map
export const sectionIcons: Record<SectionType, React.ReactNode> = {
    personal: <User className="w-4 h-4" />,
    experience: <Briefcase className="w-4 h-4" />,
    education: <GraduationCap className="w-4 h-4" />,
    skills: <Code2 className="w-4 h-4" />,
    projects: <FolderGit2 className="w-4 h-4" />,
    certifications: <Award className="w-4 h-4" />,
    languages: <Globe className="w-4 h-4" />,
    volunteering: <Heart className="w-4 h-4" />,
    awards: <Trophy className="w-4 h-4" />
};

// Default section order
export const defaultSectionOrder: SectionType[] = [
    'experience', 'education', 'projects', 'skills', 'certifications'
];

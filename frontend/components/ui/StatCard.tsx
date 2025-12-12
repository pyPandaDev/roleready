import React from 'react';

interface StatCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // kept for compatibility but unused
    colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const StatCard: React.FC<StatCardProps> = ({ children, className, colSpan }) => {
    // Use custom CSS classes from _dashboard.css that are guaranteed to work
    const colSpanClasses: Record<number, string> = {
        1: 'lg-col-span-1',
        2: 'lg-col-span-2',
        3: 'lg-col-span-3',
        4: 'lg-col-span-4',
        5: 'lg-col-span-5',
        6: 'lg-col-span-6',
        7: 'lg-col-span-7',
        8: 'lg-col-span-8',
        9: 'lg-col-span-9',
        10: 'lg-col-span-10',
        11: 'lg-col-span-11',
        12: 'lg-col-span-12',
    };

    const colSpanClass = colSpan ? colSpanClasses[colSpan] : '';
    const combinedClasses = `stat-card ${colSpanClass} ${className || ''}`;

    return (
        <div className={combinedClasses}>
            {children}
        </div>
    );
};

export default StatCard;

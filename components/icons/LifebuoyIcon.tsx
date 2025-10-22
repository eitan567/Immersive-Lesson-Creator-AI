import React from 'react';

const LifebuoyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l4.24 4.24" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.83 9.17l4.24-4.24" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.17 14.83l-4.24 4.24" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 19.07l-4.24-4.24" />
    </svg>
);

export default LifebuoyIcon;

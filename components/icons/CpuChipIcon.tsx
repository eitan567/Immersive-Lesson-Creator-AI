import React from 'react';

const CpuChipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5m-15-12.75h12.75c1.24 0 2.25 1.01 2.25 2.25v12.75c0 1.24-1.01 2.25-2.25 2.25H6.75c-1.24 0-2.25-1.01-2.25-2.25V5.25c0-1.24 1.01-2.25 2.25-2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75h-7.5c-.414 0-.75.336-.75.75v7.5c0 .414.336.75.75.75h7.5c.414 0 .75-.336.75-.75v-7.5c0-.414-.336-.75-.75-.75z" />
    </svg>
);

export default CpuChipIcon;

import React from 'react';

const WindowSmallIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="8" width="8" height="8" rx="1"></rect>
  </svg>
);

export default WindowSmallIcon;

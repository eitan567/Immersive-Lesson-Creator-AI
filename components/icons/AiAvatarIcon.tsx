import React from 'react';

const AiAvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15 11.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 14.5C10.5 14.5 10 16.5 12 16.5C14 16.5 13.5 14.5 13.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 20.5H7C5.89543 20.5 5 19.6046 5 18.5V9.5C5 8.39543 5.89543 7.5 7 7.5H17C18.1046 7.5 19 8.39543 19 9.5V18.5C19 19.6046 18.1046 20.5 17 20.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 7.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 4.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default AiAvatarIcon;
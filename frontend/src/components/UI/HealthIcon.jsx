import React from 'react';

const HealthIcon = ({ size = 32, color = "#10b981", className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="30" fill={color} />
      <rect x="30" y="16" width="4" height="12" fill="white" rx="1" />
      <rect x="26" y="20" width="12" height="4" fill="white" rx="1" />
      <path 
        d="M32 48 C28 44, 20 40, 20 34 C20 30, 24 28, 28 30 C30 31, 32 33, 32 33 C32 33, 34 31, 36 30 C40 28, 44 30, 44 34 C44 40, 36 44, 32 48 Z" 
        fill="#ef4444"
      />
    </svg>
  );
};

export default HealthIcon;

'use client';

interface BagietyLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function BagietyLoader({ size = 'medium', className = '' }: BagietyLoaderProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer bagel/bagiety circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#F59E0B"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="20 10"
          />

          {/* Inner hole */}
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="white"
            stroke="#D97706"
            strokeWidth="2"
          />

          {/* Sesame seeds effect */}
          <circle cx="50" cy="15" r="2" fill="#92400E" />
          <circle cx="70" cy="30" r="2" fill="#92400E" />
          <circle cx="80" cy="55" r="2" fill="#92400E" />
          <circle cx="65" cy="75" r="2" fill="#92400E" />
          <circle cx="35" cy="80" r="2" fill="#92400E" />
          <circle cx="20" cy="60" r="2" fill="#92400E" />
          <circle cx="25" cy="30" r="2" fill="#92400E" />
        </svg>
      </div>
    </div>
  );
}

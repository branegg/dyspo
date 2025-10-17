'use client';

import Image from 'next/image';

interface BagietyLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function BagietyLoader({ size = 'medium', className = '' }: BagietyLoaderProps) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64
  };

  const pixelSize = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin">
        <Image
          src="/bagiety-circle.png"
          alt="Loading..."
          width={pixelSize}
          height={pixelSize}
          priority
        />
      </div>
    </div>
  );
}

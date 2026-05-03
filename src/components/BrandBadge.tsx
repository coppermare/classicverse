'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BrandBadgeProps {
  mark: string;
  logoSrc?: string;
  logoAlt: string;
  className: string;
}

export default function BrandBadge({ mark, logoSrc, logoAlt, className }: BrandBadgeProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <span className={className}>
      {logoSrc && !logoFailed ? (
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={64}
          height={64}
          unoptimized
          className="cv-brand-logo"
          draggable={false}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        mark
      )}
    </span>
  );
}

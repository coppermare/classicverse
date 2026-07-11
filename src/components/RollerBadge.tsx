'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';

interface RollerBadgeProps {
  mark: string;
  logoSrc?: string;
  logoAlt: string;
  icon?: ReactNode;
  className: string;
}

export default function RollerBadge({ mark, logoSrc, logoAlt, icon, className }: RollerBadgeProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (icon) {
    return <span className="inline-flex items-center justify-center">{icon}</span>;
  }

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

import React from 'react';
import type { Logo } from '../../types';
import { getLogoPositionClasses, getLogoSizeClasses } from '../../lib/page-renderer-helpers';

export const LogoComponent: React.FC<{ logo: Logo }> = ({ logo }) => (
  <div className={`absolute flex ${getLogoPositionClasses(logo.position)} p-4 ${getLogoSizeClasses(logo.size)}`}>
    <img src={logo.src} alt="Logo" className="object-contain w-full h-full" />
  </div>
);
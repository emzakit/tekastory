import type { LogoPosition, LogoSize } from '../types';

export const getLogoPositionClasses = (position: LogoPosition): string => {
  const map: Record<LogoPosition, string> = {
    'top-left': 'top-4 left-4 items-start justify-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-start justify-center',
    'top-right': 'top-4 right-4 items-start justify-end',
    'center-left': 'top-1/2 -translate-y-1/2 left-4 items-center justify-start',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center',
    'center-right': 'top-1/2 -translate-y-1/2 right-4 items-center justify-end',
    'bottom-left': 'bottom-4 left-4 items-end justify-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-end justify-center',
    'bottom-right': 'bottom-4 right-4 items-end justify-end',
  };
  return map[position];
};

export const getLogoSizeClasses = (size: LogoSize): string => {
  const map: Record<LogoSize, string> = {
    'S': 'max-w-[8.33%] max-h-[15%]',
    'M': 'max-w-[16.67%] max-h-[30%]',
    'L': 'max-w-[25%] max-h-[45%]',
    'XL': 'max-w-[33.33%] max-h-[60%]'
  };
  return map[size];
};
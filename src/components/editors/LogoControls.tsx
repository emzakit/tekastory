
import React from 'react';
import type { Logo, LogoPosition, LogoSize } from '../../types';
import { LOGO_POSITIONS, LOGO_SIZES } from '../../constants';
import { content } from '../../config/content';

/**
 * A reusable component that provides UI controls for setting a logo's position and size.
 * It's used within the main Title & End Page Editor for both the title and end page logos.
 * @param {object} props - The component props.
 * @param {Logo} props.logo - The logo object to be controlled.
 * @param {(logo: Logo) => void} props.onUpdate - Callback function to update the logo state in the parent.
 * @param {string} props.title - The title to display for this set of controls (e.g., "Title Page Logo").
 * @param {boolean} [props.disabled] - If true, all controls are disabled.
 * @param {boolean} [props.sizeDisabled] - If true, only the size controls are disabled.
 */
export const LogoControls: React.FC<{
  logo: Logo;
  onUpdate: (logo: Logo) => void;
  title: string;
  disabled?: boolean;
  sizeDisabled?: boolean;
}> = ({ logo, onUpdate, title, disabled, sizeDisabled }) => {
  /**
   * A generic function to update a specific property of the logo (position or size).
   * @param prop The key of the logo property to update.
   * @param value The new value.
   */
  const updateProp = <K extends keyof Omit<Logo, 'src' | 'assetKey'>>(prop: K, value: Logo[K]) => {
    onUpdate({ ...logo, [prop]: value });
  };

  const disabledClasses = disabled ? 'opacity-[var(--opacity-disabled)] pointer-events-none' : '';

  return (
    <div className={`space-y-4 p-4 border border-[var(--color-border)] rounded-lg ${disabledClasses}`}>
      <p className="font-semibold text-[var(--color-text)]">{title}</p>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-medium)] mb-1">{content.labels.position}</label>
        <select value={logo.position} onChange={e => updateProp('position', e.target.value as LogoPosition)} className="w-full bg-[var(--color-background)] border border-[var(--color-border-muted)] rounded-md p-2 text-sm text-[var(--color-text)] focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)]">
          {Object.entries(LOGO_POSITIONS).map(([key, value]) => <option key={key} value={key}>{value as React.ReactNode}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-medium)] mb-1">{content.labels.size}</label>
        <div className="flex gap-2">
          {Object.keys(LOGO_SIZES).map(size => (
            <button
              key={size}
              onClick={() => updateProp('size', size as LogoSize)}
              className={`px-3 py-1 text-xs rounded transition-colors ${logo.size === size ? 'bg-[var(--color-primary)] text-[var(--color-text-light)]' : 'bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:bg-[var(--color-border-muted)]'} disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed`}
              disabled={sizeDisabled}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoControls;

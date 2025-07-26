
import React, { useRef } from 'react';
import type { Logo as LogoType } from '../../types';
import { LOGO_POSITIONS, LOGO_SIZES } from '../../constants';
import type { LogoPosition, LogoSize } from '../../types';
import { addAsset } from '../../lib/asset-service';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { content } from '../../config/content';

/**
 * @deprecated This component is no longer used. Its functionality has been replaced by
 * the `LogoControls.tsx` component and the shared file upload logic in `TitlePageEditor.tsx`.
 * It is kept in the codebase to avoid breaking changes in the file manifest but should
 * be considered dead code.
 *
 * It was originally a self-contained editor for a single logo instance.
 */
const LogoEditor: React.FC<{ logo: LogoType | null; onUpdate: (logo: LogoType | null) => void; }> = ({ logo, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Handles the file selection for uploading a new logo. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const assetKey = addAsset(file);
      const src = URL.createObjectURL(file);
      // Calls the parent's update function with a new logo object.
      onUpdate({
        src,
        assetKey,
        position: logo?.position || 'top-right',
        size: logo?.size || 'M',
      });
    }
  };

  /**
   * A generic function to update a specific property of the logo (e.g., position, size).
   * @param prop The key of the logo property to update.
   * @param value The new value for the property.
   */
  const updateProp = <K extends keyof Omit<LogoType, 'src' | 'assetKey'>>(prop: K, value: LogoType[K]) => {
    if (logo) {
      onUpdate({ ...logo, [prop]: value });
    }
  };
  
  /** Removes the logo by calling the update function with `null`. */
  const removeLogo = () => {
    if(logo?.src?.startsWith('blob:')) URL.revokeObjectURL(logo.src);
    onUpdate(null);
  }

  // If there's no logo, show a simple "Add Logo" button.
  if (!logo) {
    return (
      <>
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
          <Icon name="Plus" /> {content.buttons.addLogo}
        </Button>
        <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </>
    );
  }

  // If a logo exists, show the full editor controls.
  return (
    <div className="space-y-4 p-4 border border-[var(--color-border)] rounded-lg">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[var(--color-text)]">{content.labels.logoSettings}</p>
        <Button onClick={removeLogo} variant="danger" className="p-1 h-auto">
          <Icon name="X" className="w-4 h-4" />
        </Button>
      </div>
      <div className="w-full h-24 bg-[var(--color-surface-hover)] rounded-md flex items-center justify-center">
         <img src={logo.src} alt="logo preview" className="max-w-full max-h-full" />
      </div>
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
            <button key={size} onClick={() => updateProp('size', size as LogoSize)} className={`px-3 py-1 text-xs rounded ${logo.size === size ? 'bg-[var(--color-primary)] text-[var(--color-text-light)]' : 'bg-[var(--color-surface-hover)] text-[var(--color-text)]'}`}>{size}</button>
        ))}
        </div>
      </div>
    </div>
  );
};

export default LogoEditor;

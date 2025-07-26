import React, { useRef } from 'react';
import { addAsset } from '../../lib/asset-service';
import Icon from './Icon';
import { content } from '../../config/content';

const ImageUpload: React.FC<{
  onUpload: (src: string, assetKey: string) => void;
  currentImage: string;
  children: React.ReactNode;
  borderStyle?: 'dashed' | 'solid';
}> = ({ onUpload, currentImage, children, borderStyle = 'dashed' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const assetKey = addAsset(file);
      const src = URL.createObjectURL(file);
      onUpload(src, assetKey);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isSolid = borderStyle === 'solid';
  const borderRadiusClass = isSolid ? 'rounded-none' : 'rounded';

  const dynamicClasses = `border-2 ${borderRadiusClass} ${
    isSolid
    ? 'border-solid border-[var(--color-panel-border)] hover:border-[var(--color-panel-border-hover)] hover:text-[var(--color-accent)]' 
    : 'border-dashed border-[var(--color-border-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
  }`;

  return (
    <div
      className={`relative group w-full h-full bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)] cursor-pointer transition-colors ${dynamicClasses}`}
      onClick={handleClick}
    >
      <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* Background Image Layer */}
      {currentImage && (
        <div
          className={`absolute inset-0 z-0 bg-contain bg-center bg-no-repeat`}
          style={{ backgroundImage: `url(${currentImage})`, backgroundColor: 'var(--color-surface-muted)' }}
        ></div>
      )}

      {/* Placeholder Content Layer */}
      <div className="relative z-10 text-center p-4">
        {!currentImage && children}
      </div>

      {/* Hover Overlay Layer */}
      {currentImage && (
        <div className={`absolute inset-0 z-20 bg-[var(--color-primary-overlay)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${borderRadiusClass}`}>
           <Icon name="UploadCloud" className="w-8 h-8 text-[var(--color-text-light)]"/>
           <span className="ml-2 text-[var(--color-text-light)]">{content.imageUpload.changeImage}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
import React, { useRef } from 'react';
import { useStore } from '../../store/project-store';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Icon from '../ui/Icon';
import { content } from '../../config/content';
import { TitlePagePreview, EndPagePreview } from '../preview/Previews';
import { addAsset, getAssetFile } from '../../lib/asset-service';
import LogoControls from './LogoControls';

/**
 * A major component that serves as the editor for both the title page and the end page.
 * It provides controls for project-wide settings (like the project title for saving),
 * shared assets (background and logo), and the specific text and layout properties
 * for the title and end pages.
 */
const TitleAndEndPageEditor: React.FC = () => {
  // Select all necessary state and actions from the Zustand store.
  const { projectTitle, titlePage, endPage, logoSizesLinked, setProjectTitle, setField, setSharedBackgroundImage, removeSharedBackgroundImage, setSharedLogo, removeSharedLogo, updateTitlePageLogo, updateEndPageLogo, toggleLogoSizesLinked } = useStore(state => ({
    projectTitle: state.projectTitle,
    titlePage: state.titlePage,
    endPage: state.endPage,
    logoSizesLinked: state.logoSizesLinked,
    setProjectTitle: state.setProjectTitle,
    setField: state.setTitlePageField, // Note: This is specifically for the title page fields.
    setSharedBackgroundImage: state.setSharedBackgroundImage,
    removeSharedBackgroundImage: state.removeSharedBackgroundImage,
    setSharedLogo: state.setSharedLogo,
    removeSharedLogo: state.removeSharedLogo,
    updateTitlePageLogo: state.updateTitlePageLogo,
    updateEndPageLogo: state.updateEndPageLogo,
    toggleLogoSizesLinked: state.toggleLogoSizesLinked,
  }));

  // Refs for the hidden file input elements.
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  /** Handles the selection of a new shared background image. */
  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const assetKey = addAsset(file);
      const src = URL.createObjectURL(file);
      setSharedBackgroundImage(src, assetKey);
    }
  };

  /** Handles the selection of a new shared logo image. */
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const assetKey = addAsset(file);
        const src = URL.createObjectURL(file);
        setSharedLogo({ src, assetKey });
      }
  };

  // Determine if the logo controls should be disabled (i.e., if no logo is present).
  const isLogoControlsDisabled = !titlePage.logo;

  // Get the file names for display, showing a default name if a default asset is used.
  const bgFile = getAssetFile(titlePage.backgroundImageAssetKey);
  const bgFileName = titlePage.backgroundImageAssetKey === 'default-background' 
    ? content.labels.defaultBackgroundName 
    : (bgFile?.name || '...');

  const logoFile = titlePage.logo ? getAssetFile(titlePage.logo.assetKey) : undefined;
  const logoFileName = titlePage.logo 
    ? (titlePage.logo.assetKey === 'default-logo' 
        ? content.labels.defaultLogoName 
        : (logoFile?.name || '...')) 
    : '';

  return (
    <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-border)] pb-2 text-[var(--color-text)]">Title & End Page Editor</h2>
      
      {/* Hidden file inputs are triggered by button clicks. */}
      <input type="file" accept="image/png, image/jpeg, image/webp" ref={bgFileInputRef} onChange={handleBgFileChange} className="hidden" />
      <input type="file" accept="image/png, image/jpeg, image/webp" ref={logoFileInputRef} onChange={handleLogoFileChange} className="hidden" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: All editor controls */}
        <div className="space-y-6 lg:col-span-2">
          <Input 
            label={
              <div className="flex items-center gap-1.5">
                <span>{content.labels.projectTitle}</span>
                <div className="group relative flex items-center">
                    <Icon name="Info" className="w-4 h-4 text-[var(--color-text-subtle)] cursor-help" />
                    <span className="pointer-events-none absolute bottom-full mb-2 w-max max-w-xs scale-0 transform rounded bg-[var(--color-tooltip-bg)] p-2 text-xs text-[var(--color-text-light)] transition-all group-hover:scale-100 origin-bottom z-30 left-1/2 -translate-x-1/2">
                        This title is used for the project's filename when saving or exporting.
                    </span>
                </div>
              </div>
            }
            value={projectTitle} 
            onChange={e => setProjectTitle(e.target.value)} 
          />
          <div className="pt-6 border-t border-[var(--color-border)] space-y-6">
            <Input label={content.labels.header} value={titlePage.header} onChange={e => setField('header', e.target.value)} placeholder="Client Name" />
            <TextArea label={content.labels.subHeader} value={titlePage.subHeader} onChange={e => setField('subHeader', e.target.value)} rows={2} placeholder={"Project Title\nStoryboard"}/>
          </div>
          
          {/* Controls for changing/removing shared background and logo files. */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <button onClick={() => bgFileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-accent)] transition-colors">
                    <Icon name="UploadCloud" className="w-5 h-5" />
                    <span>{content.buttons.changeBackground}</span>
                  </button>
                  {titlePage.backgroundImageAssetKey !== 'default-background' && (
                    <button onClick={removeSharedBackgroundImage} title="Remove background" className="text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] transition-colors p-1 rounded-full">
                        <Icon name="Trash2" className="w-4 h-4" />
                    </button>
                  )}
              </div>
              <div className="flex items-center gap-2 p-2 bg-[var(--color-surface-muted)] rounded-md border border-[var(--color-border-muted)] text-sm h-12 w-full">
                <Icon name="ImageIcon" className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" />
                <span className="text-[var(--color-text-medium)] truncate" title={bgFileName}>{bgFileName}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                 <button onClick={() => logoFileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-accent)] transition-colors">
                    <Icon name="UploadCloud" className="w-5 h-5" />
                    <span>{content.buttons.changeLogo}</span>
                  </button>
                  {titlePage.logo && titlePage.logo.assetKey !== 'default-logo' && (
                    <button onClick={removeSharedLogo} title="Remove logo" className="text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] transition-colors p-1 rounded-full">
                        <Icon name="Trash2" className="w-4 h-4" />
                    </button>
                  )}
              </div>
              <div className="h-12 w-full">
                {titlePage.logo?.src ? (
                  <div className="flex items-center gap-2 p-2 bg-[var(--color-surface-muted)] rounded-md border border-[var(--color-border-muted)] text-sm h-full">
                    <Icon name="ImageIcon" className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" />
                    <span className="text-[var(--color-text-medium)] truncate" title={logoFileName}>{logoFileName}</span>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border-muted)] text-center text-[var(--color-text-subtle)]">
                    <div className="flex items-center gap-2">
                      <Icon name="Award" className="w-5 h-5" />
                      <p className="text-sm">No Logo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Controls for logo placement and size, for both title and end pages. */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
             <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-text-medium)] select-none">
                  {content.labels.customizeLogoPlacement}
                </p>
                {/* Checkbox to link/unlink logo sizes */}
                <div className={`flex items-center gap-2 ${isLogoControlsDisabled ? 'opacity-[var(--opacity-disabled)]' : ''}`}>
                  <input
                    id="link-logo-sizes"
                    type="checkbox"
                    checked={logoSizesLinked}
                    onChange={(e) => toggleLogoSizesLinked(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border-muted)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    disabled={isLogoControlsDisabled}
                  />
                  <label htmlFor="link-logo-sizes" className="text-sm font-medium text-[var(--color-text-medium)] select-none flex items-center gap-1.5">
                    <span>{content.labels.linkLogoSizes}</span>
                    <div className="group relative flex items-center">
                        <Icon name="Info" className="w-4 h-4 text-[var(--color-text-subtle)] cursor-help" />
                        <span className="pointer-events-none absolute bottom-full mb-2 w-max max-w-xs scale-0 transform rounded bg-[var(--color-tooltip-bg)] p-2 text-xs text-[var(--color-text-light)] transition-all group-hover:scale-100 origin-bottom z-30 left-1/2 -translate-x-1/2">
                            When linked, changing the logo size on the title page will also change it on the end page.
                        </span>
                    </div>
                  </label>
                </div>
             </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LogoControls 
                  logo={titlePage.logo || { src: '', assetKey: '', position: 'top-right', size: 'M' }} 
                  onUpdate={updateTitlePageLogo} 
                  title="Title Page Logo"
                  disabled={isLogoControlsDisabled}
                />
                <LogoControls 
                  logo={endPage.logo || { src: '', assetKey: '', position: 'bottom-center', size: 'M' }} 
                  onUpdate={updateEndPageLogo} 
                  title="End Page Logo" 
                  disabled={isLogoControlsDisabled}
                  sizeDisabled={logoSizesLinked} // The size control is disabled if sizes are linked.
                />
            </div>
          </div>
        </div>
        
        {/* Right Column: Live previews of the title and end pages */}
        <div className="space-y-6 sticky top-24">
           <div>
              <h3 className="text-xl font-bold mb-2 pb-2 text-[var(--color-text)]">Title Page Preview</h3>
              <TitlePagePreview page={titlePage} />
           </div>
           <div>
              <h3 className="text-xl font-bold mb-2 pb-2 text-[var(--color-text)]">End Page Preview</h3>
              <EndPagePreview page={endPage} titlePage={titlePage} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default TitleAndEndPageEditor;
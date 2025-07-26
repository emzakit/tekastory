
import React from 'react';
import { useStore } from '../../store/project-store';
import Input from '../ui/Input';
import ImageUpload from '../ui/ImageUpload';
import Icon from '../ui/Icon';
import LogoEditor from './LogoEditor';
import { content } from '../../config/content';
import { EndPagePreview } from '../preview/Previews';

/**
 * @deprecated This component is no longer used in the main application layout.
 * Its functionality has been merged into the `TitlePageEditor.tsx` component
 * for a more integrated user experience. It is kept in the codebase to avoid
 * breaking changes in the file manifest but should be considered dead code.
 * 
 * It was originally designed to provide separate controls for the end page.
 */
const EndPageEditor: React.FC = () => {
  // Select state and actions related to the end page from the store.
  const { page, titlePage, setField, setLogo, setBg, setEndPageMirror } = useStore(state => ({
    page: state.endPage,
    titlePage: state.titlePage,
    setField: state.setEndPageField,
    setLogo: state.updateEndPageLogo,
    setBg: state.setEndPageBackgroundImage,
    setEndPageMirror: state.setEndPageMirror,
  }));

  return (
    <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b border-[var(--color-border)] pb-2 text-[var(--color-text)]">End Page</h2>
        <div className="space-y-6">
           {/* Controls for the centered text on the end page. */}
           <div className="flex items-center gap-4">
             <Input label={content.labels.centeredText} value={page.text} onChange={e => setField('text', e.target.value)} disabled={!page.showText} />
             <div className="flex flex-col items-center pt-5">
                <label className="text-xs font-medium text-[var(--color-text-medium)] mb-1">{content.labels.show}</label>
                <input type="checkbox" checked={page.showText} onChange={e => setField('showText', e.target.checked)} className="h-5 w-5 rounded bg-[var(--color-surface-hover)] border-[var(--color-border-muted)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
             </div>
           </div>

           {/* Checkbox to toggle mirroring the title page's background and logo. */}
           <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)]">
             <input
               id="mirror-end-page"
               type="checkbox"
               checked={page.mirrorTitlePage}
               onChange={(e) => setEndPageMirror(e.target.checked)}
               className="h-4 w-4 rounded border-[var(--color-border-muted)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
             />
             <label htmlFor="mirror-end-page" className="text-sm font-medium text-[var(--color-text-medium)] select-none">
               {content.labels.mirrorTitlePage}
             </label>
           </div>
           
           {/* Container for the end page's unique controls. These are disabled when mirroring is on. */}
           <div className={`transition-opacity duration-300 ${page.mirrorTitlePage ? 'opacity-[var(--opacity-disabled)] pointer-events-none' : 'opacity-[var(--opacity-full)]'}`}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-[var(--color-text-medium)] mb-2">{content.labels.logo}</label>
                 <LogoEditor logo={page.logo} onUpdate={setLogo} />
               </div>
               <div>
                <label className="block text-sm font-medium text-[var(--color-text-medium)] mb-2">{content.labels.backgroundImage}</label>
                <div className="aspect-video">
                  <ImageUpload onUpload={setBg} currentImage={page.backgroundImage}>
                    <Icon name="ImageIcon" className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">{content.imageUpload.prompt}</p>
                  </ImageUpload>
                </div>
              </div>
             </div>
           </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2 text-[var(--color-text)]">Preview</h3>
        <EndPagePreview page={page} titlePage={titlePage} />
      </div>
    </div>
  );
};

export default EndPageEditor;

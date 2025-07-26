
import React from 'react';
import type { TitlePage, EndPage } from '../../types';
import { LogoComponent } from '../common/LogoComponent';

/**
 * A component that renders a live preview of the title page.
 * @param {object} props - The component props.
 * @param {TitlePage} props.page - The title page data object to render.
 */
export const TitlePagePreview: React.FC<{ page: TitlePage }> = ({ page }) => (
  <div className="w-full bg-[var(--color-background)] rounded-lg shadow-lg overflow-hidden aspect-[4/3] relative text-[var(--color-text-light)] font-oswald">
    {page.backgroundImage ? (
      <div 
        className="w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${page.backgroundImage})`}}
      >
        {/* Semi-transparent overlay to ensure text is readable over any background. */}
        <div className="absolute inset-0 bg-[rgba(var(--rgb-overlay-base),var(--opacity-overlay))] flex flex-col justify-center items-start p-6">
          <h1 className="text-2xl font-bold mb-1 break-words uppercase">{page.header}</h1>
          <p className="text-lg text-[var(--color-border)] break-words uppercase font-light whitespace-pre-wrap">{page.subHeader}</p>
        </div>
      </div>
    ) : (
      // Fallback view when no background image is set.
      <div className="absolute inset-0 bg-[var(--color-surface-hover)] flex flex-col justify-center items-start p-6 text-[var(--color-text)]">
         <h1 className="text-2xl font-bold mb-1 break-words uppercase">{page.header}</h1>
         <p className="text-lg text-[var(--color-text-muted)] break-words uppercase font-light whitespace-pre-wrap">{page.subHeader}</p>
      </div>
    )}
    {page.logo && <LogoComponent logo={page.logo} />}
  </div>
);

/**
 * A component that renders a live preview of the end page.
 * @param {object} props - The component props.
 * @param {EndPage} props.page - The end page data object.
 * @param {TitlePage} props.titlePage - The title page data, needed for the layout mirroring trick.
 */
export const EndPagePreview: React.FC<{ page: EndPage; titlePage: TitlePage }> = ({ page, titlePage }) => (
  <div className="w-full bg-[var(--color-background)] rounded-lg shadow-lg overflow-hidden aspect-[4/3] relative text-[var(--color-text-light)] font-oswald">
    {page.backgroundImage ? (
      <div 
        className="w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${page.backgroundImage})`}}
      >
        <div className="absolute inset-0 bg-[rgba(var(--rgb-overlay-base),var(--opacity-overlay))] flex flex-col justify-center items-start p-6">
          {/* 
            A clever layout trick: The title page's text is rendered here but made invisible.
            This ensures that the end page preview has the same height and text-wrapping
            behavior as the title page preview, which is visually pleasing and consistent,
            especially when logos are positioned at the bottom. The actual end page content
            (like "The End") is not shown in this preview, but the logo positioning is accurate.
          */}
          <div className="opacity-[var(--opacity-none)]" aria-hidden="true">
              <h1 className="text-2xl font-bold mb-1 break-words uppercase">{titlePage.header}</h1>
              <p className="text-lg text-[var(--color-border)] break-words uppercase font-light whitespace-pre-wrap">{titlePage.subHeader}</p>
          </div>
        </div>
      </div>
    ) : (
      <div className="absolute inset-0 bg-[var(--color-surface-hover)] flex flex-col justify-center items-start p-6 text-[var(--color-text)]">
        {/* The same layout trick for the no-background state. */}
        <div className="opacity-[var(--opacity-none)]" aria-hidden="true">
          <h1 className="text-2xl font-bold mb-1 break-words uppercase">{titlePage.header}</h1>
          <p className="text-lg text-[var(--color-text-muted)] break-words uppercase font-light whitespace-pre-wrap">{titlePage.subHeader}</p>
        </div>
      </div>
    )}
    {/* The end page's actual logo is rendered, so its position can be previewed correctly. */}
    {page.logo && <LogoComponent logo={page.logo} />}
  </div>
);


import React from 'react';
import { useStore } from '../../store/project-store';
import type { Panel, TitlePage, EndPage, Logo, LogoSize, LogoPosition } from '../../types';
import { content } from '../../config/content';
import { theme } from '../../config/theme';

// NOTE: This entire component is no longer used for PDF generation as of the vector PDF refactor.
// The new process builds the PDF directly in `src/lib/pdf-service.ts` and does not
// render anything to the DOM. This file remains as dead code to prevent file manifest issues.

const getPDFLogoPositionStyles = (position: LogoPosition): React.CSSProperties => {
    const base: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        padding: '1rem',
        boxSizing: 'border-box',
    };
    const positionMap: Record<LogoPosition, React.CSSProperties> = {
        'top-left': { top: 0, left: 0, alignItems: 'flex-start', justifyContent: 'flex-start' },
        'top-center': { top: 0, left: '50%', transform: 'translateX(-50%)', alignItems: 'flex-start', justifyContent: 'center' },
        'top-right': { top: 0, right: 0, alignItems: 'flex-start', justifyContent: 'flex-end' },
        'center-left': { top: '50%', left: 0, transform: 'translateY(-50%)', alignItems: 'center', justifyContent: 'flex-start' },
        'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', alignItems: 'center', justifyContent: 'center' },
        'center-right': { top: '50%', right: 0, transform: 'translateY(-50%)', alignItems: 'center', justifyContent: 'flex-end' },
        'bottom-left': { bottom: 0, left: 0, alignItems: 'flex-end', justifyContent: 'flex-start' },
        'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)', alignItems: 'flex-end', justifyContent: 'center' },
        'bottom-right': { bottom: 0, right: 0, alignItems: 'flex-end', justifyContent: 'flex-end' },
    };
    return { ...base, ...positionMap[position] };
};

const getPDFLogoSizeStyles = (size: LogoSize): React.CSSProperties => {
  const map: Record<LogoSize, React.CSSProperties> = {
    'S': { maxWidth: '85px', maxHeight: '115px' },
    'M': { maxWidth: '171px', maxHeight: '230px' },
    'L': { maxWidth: '256px', maxHeight: '346px' },
    'XL': { maxWidth: '341px', maxHeight: '461px' },
  };
  return map[size];
};

const PDFLogoComponent: React.FC<{ logo: Logo }> = ({ logo }) => (
  <div style={getPDFLogoPositionStyles(logo.position)}>
    <img src={logo.src} alt="Logo" style={{ ...getPDFLogoSizeStyles(logo.size), objectFit: 'contain' }} />
  </div>
);

const PDFTitlePage: React.FC<{ page: TitlePage }> = ({ page }) => (
  <div
    id="pdf-title-page"
    style={{
        width: '1024px',
        height: '768px',
        backgroundColor: theme.colors.background,
        color: theme.colors.textLight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        padding: '5rem', // 80px
        fontFamily: 'Oswald, sans-serif',
        backgroundImage: `url(${page.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxSizing: 'border-box'
    }}
  >
    <div style={{ position: 'absolute', inset: 0, backgroundColor: theme.colors.overlayBase, opacity: parseFloat(theme.opacity.overlay) }}></div>
    <div style={{ position: 'relative', zIndex: 10 }}>
      <h1 style={{ fontSize: '3.75rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase' }}>{page.header}</h1>
      <p style={{ fontSize: '1.875rem', color: theme.colors.border, textTransform: 'uppercase', fontWeight: 300, whiteSpace: 'pre-wrap' }}>{page.subHeader}</p>
    </div>
    {page.logo && <PDFLogoComponent logo={page.logo} />}
  </div>
);

const PDFEndPage: React.FC<{ page: EndPage }> = ({ page }) => (
    <div
      id="pdf-end-page"
      style={{
          width: '1024px',
          height: '768px',
          backgroundColor: theme.colors.background,
          color: theme.colors.textLight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          textAlign: 'center',
          fontFamily: 'Oswald, sans-serif',
          backgroundImage: `url(${page.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxSizing: 'border-box'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: theme.colors.overlayBase, opacity: parseFloat(theme.opacity.overlay) }}></div>
        {page.showText && page.text && (
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '3.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {page.text}
            </h1>
          </div>
        )}
      {page.logo && <PDFLogoComponent logo={page.logo} />}
    </div>
);

const PDFPanel: React.FC<{ panel: Panel; index: number }> = ({ panel, index }) => {
  const formatScriptForPdf = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[[\s\S]*?\])/g);
    return (
        <>
            {parts.filter(p => p).map((part, i) => {
                if (part.startsWith('[') && part.endsWith(']')) {
                    return <span key={i} style={{ color: theme.colors.primary }}>{part}</span>;
                }
                return part;
            })}
        </>
    );
  };

  const truncatedScript = panel.script.split('\n').slice(0, 6).join('\n');

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        fontFamily: theme.font.body,
        color: theme.colors.text,
        boxSizing: 'border-box',
    }}>
        <div style={{
            color: theme.colors.textMuted,
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            marginBottom: '0.75rem',
        }}>
            {String(index + 1).padStart(2, '0')}
        </div>

        <div style={{
            width: '100%',
            aspectRatio: '16 / 9',
            border: `1px solid ${theme.colors.panelBorder}`,
            backgroundColor: theme.colors.surfaceMuted,
            backgroundImage: panel.image ? `url(${panel.image})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            marginBottom: '0.5rem',
        }}></div>
        
        <label style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.colors.textMedium,
            marginBottom: '0.5rem',
        }}>
            {content.labels.script}
        </label>
        <div style={{
            border: `1px solid ${theme.colors.borderMuted}`,
            borderRadius: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.8rem',
            lineHeight: '1.25',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
            flexGrow: 1,
            color: theme.colors.text,
            backgroundColor: theme.colors.background,
            display: 'flex',
            alignItems: 'center',
        }}>
            <div style={{width: '100%'}}>
              {formatScriptForPdf(truncatedScript)}
            </div>
        </div>
    </div>
  );
};

const PDFPanelPage: React.FC<{ panels: Panel[]; chunkIndex: number }> = ({ panels, chunkIndex }) => (
    <div id={`pdf-panel-chunk-${chunkIndex}`} style={{
        width: '1024px',
        height: '768px',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: '2rem',
        boxSizing: 'border-box'
    }}>
        <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '1.5rem'
        }}>
          {panels.map((panel, index) => (
              <PDFPanel key={panel.id} panel={panel} index={chunkIndex * 6 + index} />
          ))}
          {/* Fill remaining grid cells to maintain layout if panels are less than 6 */}
          {Array.from({ length: 6 - panels.length }).map((_, i) => <div key={`filler-${i}`}></div>)}
        </div>
    </div>
);


export const PDFRenderer: React.FC = () => {
  return <></>; // This component is no longer used and renders nothing.
};
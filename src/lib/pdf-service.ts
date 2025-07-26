/**
 * @file Orchestrates the generation of the final PDF output.
 * This service uses `jsPDF` to construct a multi-page document representing the storyboard.
 * It includes a title page, multiple panel pages (6 panels per page), and an end page.
 * It handles all the drawing logic by calling helper functions.
 */
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { useStore } from '../store/project-store';
import { theme } from '../config/theme';
import type { Panel, TitlePage, EndPage } from '../types';
import { drawLogo, registerFonts, loadImage, convertFileToBase64, hexToRgb } from './pdf-helpers';
import { drawPanelTemplate } from './panel-template';
import { logError } from './log';
import { getAssetFile } from './asset-service';

// Standard landscape A4-like dimensions in pixels for a 1024px wide canvas.
const PDF_WIDTH = 1024;
const PDF_HEIGHT = 768;
const PAGE_MARGIN = 40;

/**
 * Draws the title page of the PDF.
 * @param pdf - The jsPDF instance.
 * @param page - The title page state object.
 */
const drawTitlePage = async (pdf: jsPDF, page: TitlePage) => {
  // Draw background image, fitting it to cover the page while maintaining aspect ratio.
  if (page.backgroundImage) {
    const img = await loadImage(page.backgroundImage);
    if (img) {
      const base64Data = await convertFileToBase64(page.backgroundImage);
      const assetFile = getAssetFile(page.backgroundImageAssetKey);
      const format = assetFile?.type === 'image/png' ? 'PNG' : 'JPEG';

      const pageRatio = PDF_WIDTH / PDF_HEIGHT;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > pageRatio) { // Image is wider, so it fills height and gets cropped horizontally.
          drawHeight = PDF_HEIGHT;
          drawWidth = drawHeight * imgRatio;
          drawX = (PDF_WIDTH - drawWidth) / 2;
          drawY = 0;
      } else { // Image is taller, so it fills width and gets cropped vertically.
          drawWidth = PDF_WIDTH;
          drawHeight = drawWidth / imgRatio;
          drawX = 0;
          drawY = (PDF_HEIGHT - drawHeight) / 2;
      }
      
      pdf.addImage(base64Data, format, drawX, drawY, drawWidth, drawHeight, undefined, 'FAST');
    }
  }

  // Draw a semi-transparent black overlay on top of the background image.
  const GState = (pdf as any).GState;
  if (GState) {
    pdf.setGState(new GState({opacity: parseFloat(theme.opacity.overlay)}));
    pdf.setFillColor(0, 0, 0); // Black
    pdf.rect(0, 0, PDF_WIDTH, PDF_HEIGHT, "F");
    pdf.setGState(new GState({opacity: 1.0})); // Reset opacity for subsequent drawing.
  }

  // Draw Header text
  const textLightRgb = hexToRgb(theme.colors.textLight);
  pdf.setFont('Oswald', 'bold');
  pdf.setFontSize(theme.fontSize.pdf.title);
  if (textLightRgb) pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);
  pdf.text(page.header.toUpperCase(), PAGE_MARGIN, PDF_HEIGHT / 2 - 30);

  // Draw Sub-Header text, handling multiple lines.
  const borderRgb = hexToRgb(theme.colors.border);
  pdf.setFont('Oswald-Light', 'normal');
  pdf.setFontSize(theme.fontSize.pdf.subTitle);
  if (borderRgb) pdf.setTextColor(borderRgb.r, borderRgb.g, borderRgb.b);
  
  const subHeaderLines = page.subHeader.toUpperCase().split('\n');
  let currentY = PDF_HEIGHT / 2 + 50;
  const lineHeight = theme.fontSize.pdf.subTitle * 1.15;

  for (const line of subHeaderLines) {
    pdf.text(line, PAGE_MARGIN, currentY);
    currentY += lineHeight;
  }

  // Draw the logo if it exists.
  if (page.logo) {
    await drawLogo(pdf, page.logo, PDF_WIDTH, PDF_HEIGHT, PAGE_MARGIN);
  }
};

/**
 * Draws the end page of the PDF.
 * @param pdf - The jsPDF instance.
 * @param page - The end page state object.
 */
const drawEndPage = async (pdf: jsPDF, page: EndPage) => {
    // Draw background image (similar logic to title page).
    if (page.backgroundImage) {
      const img = await loadImage(page.backgroundImage);
      if (img) {
        const base64Data = await convertFileToBase64(page.backgroundImage);
        const assetFile = getAssetFile(page.backgroundImageAssetKey);
        const format = assetFile?.type === 'image/png' ? 'PNG' : 'JPEG';

        const pageRatio = PDF_WIDTH / PDF_HEIGHT;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > pageRatio) {
            drawHeight = PDF_HEIGHT;
            drawWidth = drawHeight * imgRatio;
            drawX = (PDF_WIDTH - drawWidth) / 2;
            drawY = 0;
        } else {
            drawWidth = PDF_WIDTH;
            drawHeight = drawWidth / imgRatio;
            drawX = 0;
            drawY = (PDF_HEIGHT - drawHeight) / 2;
        }
        
        pdf.addImage(base64Data, format, drawX, drawY, drawWidth, drawHeight, undefined, 'FAST');
      }
    }

    // Draw overlay.
    const GState = (pdf as any).GState;
    if (GState) {
      pdf.setGState(new GState({opacity: parseFloat(theme.opacity.overlay)}));
      pdf.setFillColor(0, 0, 0); // Black
      pdf.rect(0, 0, PDF_WIDTH, PDF_HEIGHT, "F");
      pdf.setGState(new GState({opacity: 1.0})); // Reset
    }
    
    // Draw logo.
    if (page.logo) {
        await drawLogo(pdf, page.logo, PDF_WIDTH, PDF_HEIGHT, PAGE_MARGIN);
    }
}

/**
 * Draws a single page of storyboard panels (up to 6).
 * @param pdf - The jsPDF instance.
 * @param panels - An array of up to 6 panel objects to draw on this page.
 * @param chunkIndex - The index of this page chunk (0 for panels 1-6, 1 for 7-12, etc.).
 */
const drawPanelPage = async (pdf: jsPDF, panels: Panel[], chunkIndex: number) => {
  // Define the grid layout for the panels.
  const cols = 3;
  const rows = 2;
  const colGap = 20;
  const rowGap = 20;
  const contentWidth = PDF_WIDTH - PAGE_MARGIN * 2;
  const contentHeight = PDF_HEIGHT - PAGE_MARGIN * 2;
  const panelWidth = (contentWidth - (cols - 1) * colGap) / cols;
  const panelHeight = (contentHeight - (rows - 1) * rowGap) / rows;

  const panelPromises: Promise<void>[] = [];
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAGE_MARGIN + col * (panelWidth + colGap);
    const y = PAGE_MARGIN + row * (panelHeight + rowGap);
    // Asynchronously draw each panel template.
    panelPromises.push(drawPanelTemplate(pdf, panel, chunkIndex * 6 + i, x, y, panelWidth, panelHeight));
  }
  await Promise.all(panelPromises);
};

/**
 * The main export function. It creates a new PDF, registers fonts, draws all pages,
 * and then saves the file.
 */
export const exportToPdf = async () => {
  const { setLoading } = useStore.getState();
  setLoading(true);
  
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [PDF_WIDTH, PDF_HEIGHT],
      putOnlyUsedFonts: true,
      compress: true,
    });
    
    // Embed all necessary fonts into the PDF document.
    await registerFonts(pdf);
    
    const state = useStore.getState();
    
    // --- Page Creation Sequence ---
    // 1. Draw Title Page
    try {
        await drawTitlePage(pdf, state.titlePage);
    } catch (error) {
        // Wrap errors with context for better logging.
        const newError = new Error(`Failed at Title Page step: ${error instanceof Error ? error.message : String(error)}`);
        (newError as any).cause = error;
        throw newError;
    }

    // 2. Draw Panel Pages
    // Split panels into chunks of 6 to fit on pages.
    const panelChunks: Panel[][] = [];
    for (let i = 0; i < state.panels.length; i += 6) {
        panelChunks.push(state.panels.slice(i, i + 6));
    }
    
    for (let i = 0; i < panelChunks.length; i++) {
        pdf.addPage();
        try {
            await drawPanelPage(pdf, panelChunks[i], i);
        } catch (error) {
            const newError = new Error(`Failed at Panel Page ${i + 1} step: ${error instanceof Error ? error.message : String(error)}`);
            (newError as any).cause = error;
            throw newError;
        }
    }
    
    // 3. Draw End Page
    // Determine the correct configuration for the end page based on the "mirror" setting.
    const endPageConfig = state.endPage.mirrorTitlePage 
        ? { ...state.endPage, backgroundImage: state.titlePage.backgroundImage, logo: state.titlePage.logo ? { ...state.titlePage.logo, position: state.endPage.logo?.position || 'bottom-center' } : null }
        : state.endPage;
    
    if (endPageConfig) {
        pdf.addPage();
        try {
            await drawEndPage(pdf, endPageConfig);
        } catch (error) {
            const newError = new Error(`Failed at End Page step: ${error instanceof Error ? error.message : String(error)}`);
            (newError as any).cause = error;
            throw newError;
        }
    }
    
    // 4. Save the generated PDF file.
    const date = format(new Date(), 'yyMMdd');
    const defaultFilename = `${state.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'storyboard'}-${date}.pdf`;

    if ((window as any).__TAURI__) {
        const filePath = await save({
          defaultPath: defaultFilename,
          filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
        });
        if (filePath) {
          const pdfOutput = pdf.output('arraybuffer');
          await writeBinaryFile(filePath, new Uint8Array(pdfOutput));
        }
    } else {
        pdf.save(defaultFilename);
    }
  } catch (error) {
    // Log any errors that occurred during the process.
    await logError(error, "Failed to export PDF");
  } finally {
    setLoading(false);
  }
};
/**
 * @file Contains the logic for drawing a single storyboard panel onto the PDF canvas.
 * This is one of the most complex drawing functions, responsible for layout,
 * image placement, and rich text rendering with word wrapping.
 */
import type { jsPDF } from 'jspdf';
import type { Panel } from '../types';
import { theme } from '../config/theme';
import { content } from '../config/content';
import { loadImage, convertFileToBase64, hexToRgb } from './pdf-helpers';
import { getAssetFile } from './asset-service';

/**
 * Draws a complete storyboard panel at a specified location on the PDF.
 * @param pdf The jsPDF instance.
 * @param panel The panel data object.
 * @param index The zero-based index of the panel in the overall storyboard.
 * @param x The top-left x-coordinate of the panel's bounding box.
 * @param y The top-left y-coordinate of the panel's bounding box.
 * @param width The total width of the panel's bounding box.
 * @param height The total height of the panel's bounding box.
 */
export const drawPanelTemplate = async (pdf: jsPDF, panel: Panel, index: number, x: number, y: number, width: number, height: number) => {
  const PADDING = 10;
  const CONTENT_X = x + PADDING;
  const CONTENT_Y = y + PADDING;
  const CONTENT_WIDTH = width - 2 * PADDING;
  
  // Draw the panel's main background and border to match the in-app UI.
  const surfaceRgb = hexToRgb(theme.colors.surface);
  const borderRgb = hexToRgb(theme.colors.border);
  if (surfaceRgb && borderRgb) {
    pdf.setFillColor(surfaceRgb.r, surfaceRgb.g, surfaceRgb.b);
    pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
  }
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, width, height, 6, 6, 'FD'); // 'FD' = Fill and Stroke
  
  // Draw panel number (e.g., "01", "02").
  const textSubtleRgb = hexToRgb(theme.colors.textSubtle);
  pdf.setFont('Open Sans', 'bold');
  pdf.setFontSize(theme.fontSize.pdf.panelNumber);
  if (textSubtleRgb) pdf.setTextColor(textSubtleRgb.r, textSubtleRgb.g, textSubtleRgb.b);
  pdf.text(String(index + 1).padStart(2, '0'), CONTENT_X + 5, CONTENT_Y + 12);

  // --- Draw Image Container and Image ---
  const IMG_CONTAINER_Y = CONTENT_Y + 25;
  const IMG_CONTAINER_WIDTH = CONTENT_WIDTH;
  const IMG_CONTAINER_HEIGHT = IMG_CONTAINER_WIDTH * (9 / 16); // Enforce 16:9 aspect ratio.
  
  // 1. Draw the gray background fill for the image area.
  const mutedSurfaceRgb = hexToRgb(theme.colors.surfaceMuted);
  if (mutedSurfaceRgb) {
    pdf.setFillColor(mutedSurfaceRgb.r, mutedSurfaceRgb.g, mutedSurfaceRgb.b);
  }
  pdf.rect(CONTENT_X, IMG_CONTAINER_Y, IMG_CONTAINER_WIDTH, IMG_CONTAINER_HEIGHT, 'F');

  // 2. Draw the actual panel image if it exists, fitting it within the container.
  if (panel.image) {
    const img = await loadImage(panel.image);
    if (img) {
      const base64Data = await convertFileToBase64(panel.image);
      const assetFile = getAssetFile(panel.imageAssetKey);
      const format = assetFile?.type === 'image/png' ? 'PNG' : 'JPEG';
      
      if (base64Data) {
        // Calculate 'letterbox' or 'pillarbox' dimensions to fit the image.
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = IMG_CONTAINER_WIDTH / IMG_CONTAINER_HEIGHT;
        let drawWidth, drawHeight, finalX, finalY;

        if (imgRatio > containerRatio) { // Image is wider than container, fit to width.
            drawWidth = IMG_CONTAINER_WIDTH;
            drawHeight = drawWidth / imgRatio;
            finalX = CONTENT_X;
            finalY = IMG_CONTAINER_Y + (IMG_CONTAINER_HEIGHT - drawHeight) / 2;
        } else { // Image is taller or same ratio, fit to height.
            drawHeight = IMG_CONTAINER_HEIGHT;
            drawWidth = drawHeight * imgRatio;
            finalX = CONTENT_X + (IMG_CONTAINER_WIDTH - drawWidth) / 2;
            finalY = IMG_CONTAINER_Y;
        }
        
        pdf.addImage(base64Data, format, finalX, finalY, drawWidth, drawHeight, undefined, 'FAST');
      }
    }
  }

  // 3. Draw the black border for the image container, on top of the image.
  const panelBorderRgb = hexToRgb(theme.colors.panelBorder);
  if (panelBorderRgb) {
    pdf.setDrawColor(panelBorderRgb.r, panelBorderRgb.g, panelBorderRgb.b);
  }
  pdf.setLineWidth(1);
  pdf.rect(CONTENT_X, IMG_CONTAINER_Y, IMG_CONTAINER_WIDTH, IMG_CONTAINER_HEIGHT, 'S'); // 'S' = Stroke

  // --- Draw Script Section ---
  const SCRIPT_AREA_Y = IMG_CONTAINER_Y + IMG_CONTAINER_HEIGHT + 12;
  
  // Draw the "Script" label.
  const textMediumRgb = hexToRgb(theme.colors.textMedium);
  pdf.setFont('Open Sans', 'normal');
  pdf.setFontSize(theme.fontSize.pdf.scriptLabel);
  if (textMediumRgb) pdf.setTextColor(textMediumRgb.r, textMediumRgb.g, textMediumRgb.b);
  pdf.text(content.labels.script, CONTENT_X, SCRIPT_AREA_Y);

  // Define dimensions for the script text box.
  const SCRIPT_BOX_Y = SCRIPT_AREA_Y + 4;
  const SCRIPT_BOX_HEIGHT = y + height - PADDING - SCRIPT_BOX_Y;
  const SCRIPT_BOX_PADDING_X = 10;
  const SCRIPT_BOX_PADDING_Y = 10;
  
  // Draw the script box background and border.
  const backgroundRgb = hexToRgb(theme.colors.background);
  const borderMutedRgb = hexToRgb(theme.colors.borderMuted);
  if (borderMutedRgb) {
    pdf.setDrawColor(borderMutedRgb.r, borderMutedRgb.g, borderMutedRgb.b);
  }
  if (backgroundRgb) {
    pdf.setFillColor(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
  }
  pdf.setLineWidth(0.5);
  pdf.roundedRect(CONTENT_X, SCRIPT_BOX_Y, CONTENT_WIDTH, SCRIPT_BOX_HEIGHT, 4, 4, 'FD');

  // --- Rich Text Rendering Logic ---
  // This logic manually handles word wrapping and color changes for bracketed text.
  const SCRIPT_TEXT_MAX_WIDTH = CONTENT_WIDTH - (2 * SCRIPT_BOX_PADDING_X);
  const LINE_HEIGHT = 14;
  
  // Truncate script to 6 lines to match UI behavior.
  const scriptText = panel.script.split('\n').slice(0, 6).join('\n');
  
  pdf.setFontSize(theme.fontSize.pdf.script);
  let cursorX = CONTENT_X + SCRIPT_BOX_PADDING_X;
  let cursorY = SCRIPT_BOX_Y + SCRIPT_BOX_PADDING_Y + theme.fontSize.pdf.script - 4; // Adjust for baseline.

  const accentRgb = hexToRgb(theme.colors.accent);
  const textRgb = hexToRgb(theme.colors.text);
  if (!accentRgb || !textRgb) return;
  
  const checkYBounds = () => cursorY <= SCRIPT_BOX_Y + SCRIPT_BOX_HEIGHT - SCRIPT_BOX_PADDING_Y;
  const newLine = () => {
    cursorY += LINE_HEIGHT;
    cursorX = CONTENT_X + SCRIPT_BOX_PADDING_X;
  };

  // 1. Split script by [bracketed] content to isolate styled parts.
  const parts = scriptText.split(/(\[[\s\S]*?\])/g).filter(Boolean);

  for (const part of parts) {
    if (!checkYBounds()) break;

    const isAction = part.startsWith('[') && part.endsWith(']');
    const textToProcess = isAction ? part.slice(1, -1) : part; // Remove brackets for processing.

    // 2. Set font style and color for the current part.
    pdf.setFont('Open Sans', isAction ? 'bold' : 'normal');
    pdf.setTextColor(isAction ? accentRgb.r : textRgb.r, isAction ? accentRgb.g : textRgb.g, isAction ? accentRgb.b : textRgb.b);
    
    // 3. Process text that may contain its own newlines.
    const lines = textToProcess.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!checkYBounds()) break;
      const line = lines[i];

      // 4. Split line into words for manual word wrapping.
      const words = line.split(' ');
      for (let j = 0; j < words.length; j++) {
        if (!checkYBounds()) break;
        const word = words[j];
        // Add a space before the word unless it's the first word on a new line.
        const wordWithSpace = (cursorX === (CONTENT_X + SCRIPT_BOX_PADDING_X)) ? word : ' ' + word;
        const wordWidth = pdf.getTextWidth(wordWithSpace);
        
        // Check if the word overflows the current line.
        if (cursorX > (CONTENT_X + SCRIPT_BOX_PADDING_X) && (cursorX + wordWidth) > (CONTENT_X + SCRIPT_TEXT_MAX_WIDTH + SCRIPT_BOX_PADDING_X)) {
          newLine();
          if (!checkYBounds()) break;

          // After wrapping, print the word without a leading space.
          pdf.text(word, cursorX, cursorY);
          cursorX += pdf.getTextWidth(word);
        } else {
          pdf.text(wordWithSpace, cursorX, cursorY);
          cursorX += wordWidth;
        }
      }
      
      // 5. If there was a manual newline in the source text, create one in the PDF.
      if (i < lines.length - 1) {
        newLine();
      }
    }
  }
};
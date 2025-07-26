/**
 * @file A collection of helper functions for the PDF generation service.
 * These functions handle common, reusable tasks like loading images,
 * converting assets to base64, drawing logos, and embedding fonts.
 */
import type { jsPDF } from 'jspdf';
import type { Logo, LogoSize, LogoPosition } from '../types';
import { content } from '../config/content';
import { theme } from '../config/theme';
import { getAssetFile } from './asset-service';
import { getFetchableUrl } from './tauri-helpers';

/**
 * Loads an image from a given source string (URL, blob, or local path)
 * into an HTMLImageElement. This is necessary to get the image's natural dimensions.
 * @param src The source of the image.
 * @returns A Promise that resolves with the loaded HTMLImageElement, or null if loading fails.
 */
export const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
        if (!src) {
            resolve(null);
            return;
        }

        const fetchableSrc = getFetchableUrl(src);

        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Required for fetching from different origins or local files.
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.error(`Failed to load image for PDF from src: ${src} (resolved to: ${fetchableSrc})`);
            resolve(null);
        };
        img.src = fetchableSrc;
    });
};

/**
 * Maps a logo size identifier ('S', 'M', etc.) to pixel dimensions for the PDF.
 * @param size The LogoSize identifier.
 * @returns An object with maxWidth and maxHeight in pixels.
 */
const getPDFLogoSize = (size: LogoSize): { maxWidth: number; maxHeight: number } => {
  const map: Record<LogoSize, { maxWidth: number; maxHeight: number }> = {
    'S': { maxWidth: 85, maxHeight: 115 },
    'M': { maxWidth: 171, maxHeight: 230 },
    'L': { maxWidth: 256, maxHeight: 346 },
    'XL': { maxWidth: 341, maxHeight: 461 },
  };
  return map[size];
};

/**
 * Calculates the top-left (x, y) coordinates for a logo based on its position setting.
 * @param position The position identifier (e.g., 'top-right').
 * @param w The calculated width of the logo.
 * @param h The calculated height of the logo.
 * @param pageWidth The total width of the PDF page.
 * @param pageHeight The total height of the PDF page.
 * @param padding The margin to respect from the page edges.
 * @returns An object with the calculated x and y coordinates.
 */
const getPDFLogoPosition = (position: LogoPosition, w: number, h: number, pageWidth: number, pageHeight: number, padding: number): { x: number; y: number } => {
  const positions: Record<string, { x: number; y: number }> = {
    'top-left': { x: padding, y: padding },
    'top-center': { x: (pageWidth - w) / 2, y: padding },
    'top-right': { x: pageWidth - w - padding, y: padding },
    'center-left': { x: padding, y: (pageHeight - h) / 2 },
    'center': { x: (pageWidth - w) / 2, y: (pageHeight - h) / 2 },
    'center-right': { x: pageWidth - w - padding, y: (pageHeight - h) / 2 },
    'bottom-left': { x: padding, y: pageHeight - h - padding },
    'bottom-center': { x: (pageWidth - w) / 2, y: pageHeight - h - padding },
    'bottom-right': { x: pageWidth - w - padding, y: pageHeight - h - padding },
  };
  return positions[position];
};

/**
 * Draws a logo onto the PDF canvas with correct sizing and positioning.
 * @param pdf The jsPDF instance.
 * @param logo The logo object containing all necessary properties.
 * @param pageWidth The width of the PDF page.
 * @param pageHeight The height of the PDF page.
 * @param margin The page margin to use for padding.
 */
export const drawLogo = async (pdf: jsPDF, logo: Logo, pageWidth: number, pageHeight: number, margin: number) => {
    const img = await loadImage(logo.src);
    if (!img) return;

    // Calculate the display dimensions of the logo based on its size setting, while maintaining aspect ratio.
    const logoSizePx = getPDFLogoSize(logo.size);
    const ratio = img.naturalWidth / img.naturalHeight;
    let w = logoSizePx.maxWidth;
    let h = w / ratio;
    if (h > logoSizePx.maxHeight) {
        h = logoSizePx.maxHeight;
        w = h * ratio;
    }

    const base64Data = await convertFileToBase64(logo.src);
    if (!base64Data) return;
    
    // Determine image format for jsPDF.
    const assetFile = getAssetFile(logo.assetKey);
    const format = (assetFile?.type === 'image/png' || logo.assetKey === 'default-logo') ? 'PNG' : 'JPEG';

    // Calculate final position and add the image to the PDF.
    const pos = getPDFLogoPosition(logo.position, w, h, pageWidth, pageHeight, margin / 2);
    pdf.addImage(base64Data, format, pos.x, pos.y, w, h, undefined, 'FAST');
}

/**
 * Converts an asset (from a URL or local path) into a base64 encoded string.
 * This is required to embed images directly into the jsPDF document.
 * @param assetPath The path or URL of the asset.
 * @returns A Promise that resolves with the base64 string (without the data URI prefix).
 */
export const convertFileToBase64 = async (assetPath: string): Promise<string> => {
    const fetchablePath = getFetchableUrl(assetPath);
    const response = await fetch(fetchablePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            if (base64) {
              resolve(base64);
            } else {
              reject(new Error(`Could not read asset from path: ${assetPath}`));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Fetches, converts, and registers all required custom fonts with the jsPDF instance.
 * This ensures that the fonts are embedded in the final PDF file.
 * @param pdf The jsPDF instance to register fonts with.
 */
export const registerFonts = async (pdf: jsPDF) => {
    const fontDir = content.fontDirectory;
    const fontFiles = theme.font.files;

    // Fetch all font files in parallel.
    const [
        oswaldBoldBase64,
        oswaldLightBase64,
        oswaldRegularBase64,
        openSansRegularBase64,
        openSansBoldBase64
    ] = await Promise.all([
        convertFileToBase64(`${fontDir}${fontFiles['Oswald-Bold']}`),
        convertFileToBase64(`${fontDir}${fontFiles['Oswald-Light']}`),
        convertFileToBase64(`${fontDir}${fontFiles['Oswald-Regular']}`),
        convertFileToBase64(`${fontDir}${fontFiles['OpenSans-Regular']}`),
        convertFileToBase64(`${fontDir}${fontFiles['OpenSans-Bold']}`),
    ]);

    // Add each font to jsPDF's virtual file system and then register it.
    pdf.addFileToVFS('Oswald-Regular.ttf', oswaldRegularBase64);
    pdf.addFont('Oswald-Regular.ttf', 'Oswald', 'normal');

    pdf.addFileToVFS('Oswald-Bold.ttf', oswaldBoldBase64);
    pdf.addFont('Oswald-Bold.ttf', 'Oswald', 'bold');

    // 'light' is not a standard jsPDF style, so we register it as a separate font family.
    pdf.addFileToVFS('Oswald-Light.ttf', oswaldLightBase64);
    pdf.addFont('Oswald-Light.ttf', 'Oswald-Light', 'normal');

    pdf.addFileToVFS('OpenSans-Regular.ttf', openSansRegularBase64);
    pdf.addFont('OpenSans-Regular.ttf', 'Open Sans', 'normal');
    
    pdf.addFileToVFS('OpenSans-Bold.ttf', openSansBoldBase64);
    pdf.addFont('OpenSans-Bold.ttf', 'Open Sans', 'bold');
};

/** Helper to convert hex color strings to RGB objects for jsPDF. */
export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
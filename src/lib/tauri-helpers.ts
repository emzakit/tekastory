
import { convertFileSrc } from '@tauri-apps/api/tauri';

/**
 * Returns a fetchable URL for a given asset path, correctly handling
 * development vs. production (packaged) environments in Tauri. This is crucial
 * because local file paths need to be converted to a special `asset:` protocol
 * in a packaged Tauri app to be accessible.
 * - In dev mode (`http:` protocol), it returns the path as-is for the Vite dev server to handle.
 * - In production (`tauri:` protocol), it converts root-relative paths (e.g., '/images/foo.png')
 *   to `asset://...` URLs that Tauri can resolve from the app's bundled resources.
 * - It ignores already-absolute URLs (blob:, http:).
 * @param path - The asset path, which could be a blob URL, an HTTP URL, or a local project path.
 * @returns A URL string that can be safely used in `fetch` or `img.src`.
 */
export const getFetchableUrl = (path: string): string => {
    // If the path is already a valid, absolute URL, do nothing.
    if (!path || path.startsWith('blob:') || path.startsWith('http')) {
        return path;
    }

    // Check if running in a packaged Tauri app (protocol will be 'tauri:').
    if ((window as any).__TAURI__ && path.startsWith('/') && window.location.protocol.startsWith('tauri')) {
        // `convertFileSrc` expects a path relative to the resource directory.
        // Our project paths are root-relative (e.g., '/images/foo.png'), so we strip the leading '/'.
        return convertFileSrc(path.substring(1));
    }
    
    // In dev mode, the path is served from the root by the Vite dev server, so it's already correct.
    return path;
};

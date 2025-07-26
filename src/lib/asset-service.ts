
/**
 * @file Manages an in-memory store for project assets (images).
 * This service allows adding files, which assigns them a unique key,
 * and retrieving them later as Files or blob URLs. This avoids storing
 * large base64 strings in the main application state.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * A Map to store file assets in memory, with a unique string key for each file.
 * Key: assetKey (e.g., 'uuid.png'), Value: File object.
 */
const assetMap = new Map<string, File>();

/**
 * Extracts the file extension from a filename.
 * @param filename - The full name of the file (e.g., 'my-image.jpg').
 * @returns The extension including the dot (e.g., '.jpg'), or an empty string if no extension is found.
 */
const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    // Handles cases with no extension or hidden files like '.env'.
    if (lastDot < 1 || lastDot === filename.length - 1) {
        return '';
    }
    return filename.substring(lastDot);
};


/**
 * Adds a file to the asset map and returns a unique key for it.
 * The key is a UUID with the original file's extension appended.
 * @param file - The File object to add to the store.
 * @returns The generated unique asset key.
 */
export function addAsset(file: File): string {
  const extension = getFileExtension(file.name);
  const assetKey = `${uuidv4()}${extension}`;
  assetMap.set(assetKey, file);
  return assetKey;
}

/**
 * Retrieves a blob URL for a given asset key.
 * This URL can be used directly in `img.src` attributes.
 * @param assetKey - The unique key of the asset.
 * @returns A blob URL string, or null if the asset is not found.
 */
export function getAssetUrl(assetKey: string): string | null {
  const file = assetMap.get(assetKey);
  return file ? URL.createObjectURL(file) : null;
}

/**
 * Retrieves the original File object for a given asset key.
 * @param assetKey - The unique key of the asset.
 * @returns The File object, or undefined if not found.
 */
export function getAssetFile(assetKey: string): File | undefined {
    return assetMap.get(assetKey);
}

/**
 * Returns the entire asset map.
 * Used for iterating over all assets, e.g., when saving a project.
 * @returns The Map object containing all assets.
 */
export function getAssetMap() {
    return assetMap;
}

/**
 * Clears all assets from the map.
 * Important for memory management when loading a new project or resetting.
 */
export function clearAssets() {
    assetMap.clear();
}

/**
 * Adds or replaces an asset in the map with a specific key.
 * This is primarily used when loading a project from a file, where the asset keys
 * are predetermined.
 * @param key - The key to associate with the file.
 * @param file - The File object to store.
 */
export function setAsset(key: string, file: File) {
    assetMap.set(key, file);
}

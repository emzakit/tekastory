
/**
 * @file Handles saving and loading of project files.
 * This service orchestrates the process of bundling the project state and all associated
 * assets into a single .tekastory (zip) file, and the reverse process of loading and
 * hydrating a project from such a file. It supports both web and Tauri (desktop) environments.
 */
import JSZip from 'jszip';
import { format } from 'date-fns';
import { save, open } from '@tauri-apps/api/dialog';
import { writeBinaryFile, readBinaryFile } from '@tauri-apps/api/fs';
import type { ProjectState, Panel } from '../types';
import { useStore } from '../store/project-store';
import { content } from '../config/content';
import { getAssetFile, clearAssets, setAsset, addAsset } from './asset-service';
import { getFetchableUrl } from './tauri-helpers';

/**
 * Hydrates a loaded project state by creating local blob URLs for all assets.
 * This is a crucial step after loading a project from a file. The `project.json`
 * contains asset keys, and this function uses the `asset-service` (which has been
 * populated from the zip) to create displayable URLs.
 * @param state The raw project state loaded from `project.json`.
 * @returns A new, hydrated project state object with valid blob URLs for display in the UI.
 */
function hydrateState(state: ProjectState): ProjectState {
    /** Helper to get a blob URL for an asset key, or return the original path for default assets. */
    const hydrateAsset = (assetKey: string | undefined): string => {
        if (!assetKey || assetKey.startsWith('/images/')) {
            return assetKey || '';
        }
        const file = getAssetFile(assetKey);
        return file ? URL.createObjectURL(file) : '';
    };

    // Construct a new state object to ensure immutability.
    const newState: ProjectState = {
        ...state,
        titlePage: {
            ...state.titlePage,
            backgroundImage: hydrateAsset(state.titlePage.backgroundImageAssetKey),
            logo: state.titlePage.logo ? {
                ...state.titlePage.logo,
                src: hydrateAsset(state.titlePage.logo.assetKey),
            } : null,
        },
        endPage: {
            ...state.endPage,
            backgroundImage: hydrateAsset(state.endPage.backgroundImageAssetKey),
            logo: state.endPage.logo ? {
                ...state.endPage.logo,
                src: hydrateAsset(state.endPage.logo.assetKey),
            } : null,
        },
        panels: state.panels.map((panel) => ({
            ...panel,
            image: hydrateAsset(panel.imageAssetKey),
        })),
    };
    
    return newState;
}

/**
 * Processes the raw data from a loaded .tekastory file (a zip archive).
 * It extracts `project.json` and all files from the `assets` folder, populates
 * the asset service, and then hydrates and loads the project into the store.
 * @param fileContents The ArrayBuffer of the zip file.
 */
async function processProjectFile(fileContents: ArrayBuffer) {
  clearAssets(); // Start with a clean slate.
  const zip = await JSZip.loadAsync(fileContents);
  const projectJsonFile = zip.file('project.json');

  if (!projectJsonFile) {
    alert(content.alerts.loadError);
    return;
  }

  // 1. Load all assets from the zip's 'assets' folder into our in-memory asset service.
  const assetFiles = zip.folder('assets');
  if (assetFiles) {
    const assetPromises: Promise<void>[] = [];
    assetFiles.forEach((relativePath, fileInZip) => {
      // Don't process directories.
      if (!fileInZip.dir) {
        const promise = fileInZip.async('blob').then(fileData => {
          // The filename in the zip IS the assetKey.
          const assetKey = relativePath;
          const newFile = new File([fileData], assetKey, { type: fileData.type });
          setAsset(assetKey, newFile); // Populate the asset service.
        });
        assetPromises.push(promise);
      }
    });
    await Promise.all(assetPromises);
  }

  // 2. Load the project's structure from project.json.
  const projectJsonContent = await projectJsonFile.async('string');
  const loadedState: ProjectState = JSON.parse(projectJsonContent);

  // 3. Hydrate the state to create usable blob URLs from the asset keys.
  const stateToLoad = hydrateState(loadedState);
  
  // 4. Load the fully prepared state into the store and clear undo history.
  useStore.getState().loadProject(stateToLoad);
  useStore.temporal.getState().clear();
}


/**
 * Saves the current project state and assets to a .tekastory file.
 */
export const saveProject = async () => {
  const { setLoading } = useStore.getState();
  setLoading(true);

  try {
    const state = useStore.getState();
    const zip = new JSZip();

    // Create a deep copy of the state to modify before saving.
    // This is crucial because we may need to convert default asset placeholders
    // (like 'default-logo') into real assets by fetching them and adding them
    // to the asset service, which generates a real asset key.
    const savableState = JSON.parse(JSON.stringify(state));
    const defaultAssetMap = new Map<string, string>(); // Caches fetched default assets to avoid refetching.

    /**
     * Checks if an asset is a default placeholder. If so, fetches the default file,
     * adds it to the asset service to get a real key, and returns the new key.
     * Otherwise, returns the original key.
     */
    const processAndMapAsset = async (assetKey: string, defaultPath: string): Promise<string> => {
      if (assetKey.startsWith('default-')) {
        if (defaultAssetMap.has(assetKey)) {
          return defaultAssetMap.get(assetKey)!;
        }
        
        try {
          const fetchablePath = getFetchableUrl(defaultPath);
          const response = await fetch(fetchablePath);
          const blob = await response.blob();
          const filename = defaultPath.split('/').pop() || assetKey;
          const file = new File([blob], filename, { type: blob.type });

          const newAssetKey = addAsset(file); // This adds the default file to the real asset pool.
          defaultAssetMap.set(assetKey, newAssetKey);
          return newAssetKey;
        } catch (error) {
          console.error(`Failed to fetch default asset: ${defaultPath}`, error);
          return ''; // Return empty string if fetch fails to prevent crash.
        }
      }
      return assetKey; // Not a default asset, so return the original key.
    };

    // Go through all assets in the savable state and replace default placeholders with real keys.
    savableState.titlePage.backgroundImageAssetKey = await processAndMapAsset(savableState.titlePage.backgroundImageAssetKey, content.assets.defaultBackgroundPath);
    if (savableState.titlePage.logo) {
      savableState.titlePage.logo.assetKey = await processAndMapAsset(savableState.titlePage.logo.assetKey, content.assets.defaultLogoPath);
    }
    savableState.endPage.backgroundImageAssetKey = await processAndMapAsset(savableState.endPage.backgroundImageAssetKey, content.assets.defaultBackgroundPath);
    if (savableState.endPage.logo) {
      savableState.endPage.logo.assetKey = await processAndMapAsset(savableState.endPage.logo.assetKey, content.assets.defaultLogoPath);
    }

    // Create a clean JSON representation of the state, removing transient/display-only fields.
    const projectJsonString = JSON.stringify(savableState, (key, value) => {
      if (['src', 'image', 'backgroundImage', 'isLoading'].includes(key)) {
        return undefined; // Exclude these properties from the saved JSON.
      }
      return value;
    }, 2);
    zip.file('project.json', projectJsonString);

    // Collect all unique, non-default asset keys that are actually referenced in the project.
    const referencedAssets = new Set<string>();
    const collectAsset = (assetKey?: string) => assetKey && !assetKey.startsWith('default-') && referencedAssets.add(assetKey);
    collectAsset(savableState.titlePage.logo?.assetKey);
    collectAsset(savableState.titlePage.backgroundImageAssetKey);
    collectAsset(savableState.endPage.logo?.assetKey);
    collectAsset(savableState.endPage.backgroundImageAssetKey);
    savableState.panels.forEach((panel: Panel) => collectAsset(panel.imageAssetKey));

    // Add all referenced asset files to the 'assets' folder in the zip.
    const assetsFolder = zip.folder('assets');
    if (assetsFolder) {
      for (const assetKey of referencedAssets) {
        if (!assetKey) continue;
        const file = getAssetFile(assetKey);
        if (file) {
          assetsFolder.file(assetKey, file);
        }
      }
    }

    const contentZip = await zip.generateAsync({ type: 'uint8array' });

    // Generate a user-friendly filename.
    const projectTitleForFile = state.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = format(new Date(), 'yyMMdd-HHmm');
    const defaultFilename = `${projectTitleForFile || 'story'}-${date}.tekastory`;
    
    // Handle file saving differently for Tauri (desktop) vs. web.
    if ((window as any).__TAURI__) {
        const filePath = await save({
          defaultPath: defaultFilename,
          filters: [{ name: 'TekaStory Project', extensions: ['tekastory', 'mistory'] }]
        });

        if (filePath) {
          await writeBinaryFile(filePath, contentZip);
        }
    } else {
      // Standard web download flow.
      const blob = new Blob([contentZip], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error("Failed to save project:", error);
    alert("An error occurred while saving the project.");
  } finally {
    setLoading(false);
  }
};

/**
 * Initiates the process of loading a project from a user-selected file.
 */
export const loadProject = async () => {
  const { setLoading } = useStore.getState();

  // Use Tauri's native file open dialog if available.
  if ((window as any).__TAURI__) {
    const selectedPath = await open({
      multiple: false,
      filters: [{ name: 'TekaStory Project', extensions: ['tekastory', 'mistory', 'sbp', 'zip'] }]
    });

    if (!selectedPath || Array.isArray(selectedPath)) {
      return; // User cancelled the dialog.
    }
    
    setLoading(true);
    try {
        const fileContents = await readBinaryFile(selectedPath as string);
        await processProjectFile(fileContents.buffer);
    } catch (error) {
        console.error("Failed to load project:", error);
        alert("Failed to load project file.");
    } finally {
        setLoading(false);
    }

  } else {
    // Use a standard HTML file input for the web environment.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".tekastory,.mistory,.sbp,.zip";
    input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        
        setLoading(true);
        try {
            const fileContents = await file.arrayBuffer();
            await processProjectFile(fileContents);
        } catch (error) {
            console.error("Failed to load project:", error);
            alert("Failed to load project file.");
        } finally {
            setLoading(false);
        }
    };
    input.click();
  }
};

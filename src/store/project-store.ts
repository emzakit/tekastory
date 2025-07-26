
import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectState, TitlePage, Panel, EndPage, Logo } from '../types';
import { content } from '../config/content';

/**
 * Defines the actions available to modify the project state.
 * These are the functions that components will call to dispatch changes.
 */
interface Actions {
  /** Updates the main project title used for saving files. */
  setProjectTitle: (title: string) => void;
  /** Replaces the entire current project state with a new one, typically from a loaded file. */
  loadProject: (project: ProjectState) => void;
  /** Resets the project to its initial default state after user confirmation. */
  resetProject: () => void;
  // Title Page Actions
  /** Updates a specific field within the `titlePage` object. */
  setTitlePageField: <K extends keyof TitlePage>(field: K, value: TitlePage[K]) => void;
  // Shared Actions for Title and End Page
  /** Sets the background image for both the title and end pages simultaneously. */
  setSharedBackgroundImage: (src: string, assetKey: string) => void;
  /** Removes the custom background image, reverting both title and end pages to the default. */
  removeSharedBackgroundImage: () => void;
  /** Sets the logo for both the title and end pages simultaneously from a single file upload. */
  setSharedLogo: (logoFile: { src: string; assetKey: string } | null) => void;
  /** Removes the custom logo, reverting both title and end pages to the default. */
  removeSharedLogo: () => void;
  /** Updates the logo object for the title page, potentially syncing size with the end page logo. */
  updateTitlePageLogo: (logo: Logo | null) => void;
  // End Page Actions
  /** Updates a specific field within the `endPage` object. */
  setEndPageField: <K extends keyof EndPage>(field: K, value: EndPage[K]) => void;
  /** Sets the background image for only the end page (used when not mirroring). */
  setEndPageBackgroundImage: (src: string, assetKey: string) => void;
  /** Updates the logo object for the end page, potentially syncing size with the title page logo. */
  updateEndPageLogo: (logo: Logo | null) => void;
  /** Toggles whether the end page mirrors the title page's background and logo. */
  setEndPageMirror: (mirror: boolean) => void;
  // Logo Linking
  /** Toggles whether the logo sizes on the title and end pages are synchronized. */
  toggleLogoSizesLinked: (linked: boolean) => void;
  // Panel Actions
  /** Adds a new, empty panel to the end of the storyboard. */
  addPanel: () => void;
  /** Removes a panel from the storyboard by its unique ID. */
  removePanel: (id: string) => void;
  /** Updates the content (e.g., script) of a specific panel. */
  updatePanel: (id: string, newContent: Partial<Omit<Panel, 'id'>>) => void;
  /** Replaces the entire panels array with a new, reordered array. */
  reorderPanels: (panels: Panel[]) => void;
  /** Sets the image for a specific panel. */
  setPanelImage: (id: string, src: string, assetKey: string) => void;
  /** Sets the global loading state, displaying an overlay. */
  setLoading: (isLoading: boolean) => void;
}

/**
 * A utility function to revoke ObjectURLs from a project state.
 * This is crucial for preventing memory leaks when loading a new project or resetting.
 * @param state - The project state to clean up.
 */
const cleanupBlobUrls = (state: ProjectState) => {
    // Revoke any blob URLs to free up memory
    if (state.titlePage.backgroundImage?.startsWith('blob:')) URL.revokeObjectURL(state.titlePage.backgroundImage);
    if (state.titlePage.logo?.src?.startsWith('blob:')) URL.revokeObjectURL(state.titlePage.logo.src);
    if (state.endPage.backgroundImage?.startsWith('blob:')) URL.revokeObjectURL(state.endPage.backgroundImage);
    if (state.endPage.logo?.src?.startsWith('blob:')) URL.revokeObjectURL(state.endPage.logo.src);
    state.panels.forEach(panel => {
      if (panel.image?.startsWith('blob:')) URL.revokeObjectURL(panel.image);
    });
};

/**
 * Generates an array of initial empty panels.
 * @param count - The number of panels to create.
 * @returns An array of Panel objects.
 */
const createInitialPanels = (count: number): Panel[] => {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    image: '',
    imageAssetKey: '',
    script: '',
  }));
};

// Default logo configuration for the title page.
const defaultLogo: Logo = {
  src: content.assets.defaultLogoPath,
  assetKey: 'default-logo',
  position: 'bottom-right',
  size: 'M',
};

// Default logo configuration for the end page.
const defaultEndPageLogo: Logo = {
  ...defaultLogo,
  position: 'bottom-center',
  size: 'M',
};

// Default background image path and asset key.
const defaultBgImage = content.assets.defaultBackgroundPath;
const defaultBgAssetKey = 'default-background';

/**
 * The initial state for a new project.
 * This object defines the default values when the app starts or a new project is created.
 */
export const initialState: Omit<ProjectState, 'isLoading'> = {
  projectTitle: 'My Story Project',
  titlePage: {
    header: 'Client Name',
    subHeader: 'Project Title\nStoryboard',
    backgroundImage: defaultBgImage,
    backgroundImageAssetKey: defaultBgAssetKey,
    logo: defaultLogo,
  },
  panels: createInitialPanels(6),
  endPage: {
    backgroundImage: defaultBgImage,
    backgroundImageAssetKey: defaultBgAssetKey,
    logo: defaultEndPageLogo,
    text: 'The End',
    showText: true,
    mirrorTitlePage: true,
  },
  logoSizesLinked: true,
};


/**
 * The main Zustand store for the application.
 * It combines state and actions, using middleware for immutability and undo/redo functionality.
 * - `temporal`: from `zundo` for undo/redo.
 * - `immer`: for safe and easy state mutations.
 */
type Store = ProjectState & Actions;

export const useStore = create(
  // The `temporal` middleware wraps the store to provide undo/redo capabilities.
  temporal(
    // The `immer` middleware allows for direct, mutable-style updates to the state.
    immer<Store>((set, get) => ({
      ...initialState,
      isLoading: false, // Transient state, not part of `initialState` to avoid reset on new project.

      setProjectTitle: (title) => {
        set({ projectTitle: title });
      },
      loadProject: (project) => {
        // Before loading a new project, clean up blob URLs from the *current* state.
        const currentState = get();
        cleanupBlobUrls(currentState as ProjectState);

        // This handles older project files that didn't have a separate `projectTitle`.
        if (!project.projectTitle) {
          project.projectTitle = project.titlePage.header || 'Untitled Project';
        }

        set(project);
      },
      resetProject: () => {
        if (window.confirm(content.alerts.confirmNewProject)) {
          // Clean up blobs from the current project before resetting.
          cleanupBlobUrls(get() as ProjectState);
          // Reset state to initial values, but keep `isLoading` as is.
          set({...initialState, isLoading: get().isLoading});
          // Clear the undo/redo history stack.
          useStore.temporal.getState().clear();
        }
      },

      // --- Title Page ---
      setTitlePageField: (field, value) => {
        set((state) => {
          state.titlePage[field] = value;
        });
      },

      // --- Shared Title/End Page ---
      setSharedBackgroundImage: (src, assetKey) => {
        set((state) => {
          // If a custom background already exists (as a blob), revoke it first.
          if (state.titlePage.backgroundImage?.startsWith('blob:')) {
            URL.revokeObjectURL(state.titlePage.backgroundImage);
          }
          // Update both pages to use the new shared background.
          state.titlePage.backgroundImage = src;
          state.titlePage.backgroundImageAssetKey = assetKey;
          state.endPage.backgroundImage = src;
          state.endPage.backgroundImageAssetKey = assetKey;
        });
      },
      removeSharedBackgroundImage: () => {
        set((state) => {
          // Revoke the old blob URL if it exists.
          if (state.titlePage.backgroundImage?.startsWith('blob:')) {
            URL.revokeObjectURL(state.titlePage.backgroundImage);
          }
          // Reset both pages to the default background.
          state.titlePage.backgroundImage = defaultBgImage;
          state.titlePage.backgroundImageAssetKey = defaultBgAssetKey;
          state.endPage.backgroundImage = defaultBgImage;
          state.endPage.backgroundImageAssetKey = defaultBgAssetKey;
        });
      },
      setSharedLogo: (logoFile) => {
        set((state) => {
          if (logoFile) {
            // Create new logo objects for title and end pages, preserving their individual positions
            // but sharing the new image source and asset key.
            const newTitleLogo: Logo = {
              src: logoFile.src,
              assetKey: logoFile.assetKey,
              position: state.titlePage.logo?.position || 'bottom-right',
              size: state.titlePage.logo?.size || 'M',
            };
            const newEndLogo: Logo = {
              src: logoFile.src,
              assetKey: logoFile.assetKey,
              position: state.endPage.logo?.position || 'bottom-center',
              size: state.titlePage.logo?.size || 'M', // Start with sizes linked.
            };
            state.titlePage.logo = newTitleLogo;
            state.endPage.logo = newEndLogo;
          } else {
            // If no file is provided, remove the logos.
            state.titlePage.logo = null;
            state.endPage.logo = null;
          }
        });
      },
      removeSharedLogo: () => {
        set((state) => {
            // Revoke blob URL before resetting to default.
            if (state.titlePage.logo?.src?.startsWith('blob:')) {
                URL.revokeObjectURL(state.titlePage.logo.src);
            }
            // Reset both logos to their respective defaults.
            state.titlePage.logo = { ...defaultLogo };
            state.endPage.logo = { ...defaultEndPageLogo };
        });
      },
      updateTitlePageLogo: (logo) => {
        set((state) => {
          state.titlePage.logo = logo;
          // If sizes are linked, propagate the size change to the end page logo.
          if (state.logoSizesLinked && logo && state.endPage.logo) {
            state.endPage.logo.size = logo.size;
          }
        });
      },

      // --- End Page ---
      updateEndPageLogo: (logo) => {
        set((state) => {
          state.endPage.logo = logo;
          // If sizes are linked, propagate the size change to the title page logo.
          if (state.logoSizesLinked && logo && state.titlePage.logo) {
            state.titlePage.logo.size = logo.size;
          }
        });
      },
      setEndPageField: (field, value) => {
        set((state) => {
          state.endPage[field] = value;
        });
      },
      setEndPageBackgroundImage: (src, assetKey) => {
        set(state => {
          // This only applies when the end page is not mirroring the title page.
          state.endPage.backgroundImage = src;
          state.endPage.backgroundImageAssetKey = assetKey;
        })
      },
      setEndPageMirror: (mirror) => {
        set(state => {
          state.endPage.mirrorTitlePage = mirror;
          // When mirroring is enabled, sync the end page's assets with the title page.
          if (mirror) {
            state.endPage.backgroundImage = state.titlePage.backgroundImage;
            state.endPage.backgroundImageAssetKey = state.titlePage.backgroundImageAssetKey;
            // Also sync the logo image, but maintain the end page's unique position setting.
            if (state.titlePage.logo) {
              if (state.endPage.logo) {
                state.endPage.logo.src = state.titlePage.logo.src;
                state.endPage.logo.assetKey = state.titlePage.logo.assetKey;
              } else {
                // If end page had no logo, create one based on title page's, but with a default end page position.
                state.endPage.logo = {
                  ...state.titlePage.logo,
                  position: 'bottom-center',
                };
              }
            } else {
              state.endPage.logo = null;
            }
          }
        });
      },
      toggleLogoSizesLinked: (linked) => {
        set((state) => {
          state.logoSizesLinked = linked;
          // If we are re-linking them, make the title page size the master.
          if (linked && state.titlePage.logo && state.endPage.logo) {
            state.endPage.logo.size = state.titlePage.logo.size;
          }
        });
      },

      // --- Panels ---
      addPanel: () => {
        set((state) => {
          state.panels.push({
            id: uuidv4(),
            image: '',
            imageAssetKey: '',
            script: '',
          });
        });
      },
      removePanel: (id) => {
        set((state) => {
          state.panels = state.panels.filter((p) => p.id !== id);
        });
      },
      updatePanel: (id, newContent) => {
        set((state) => {
          const panel = state.panels.find((p) => p.id === id);
          if (panel) {
            Object.assign(panel, newContent);
          }
        });
      },
      reorderPanels: (panels) => set({ panels }),
      setPanelImage: (id, src, assetKey) => {
        set((state) => {
          const panel = state.panels.find((p) => p.id === id);
          if (panel) {
            panel.image = src;
            panel.imageAssetKey = assetKey;
          }
        });
      },
      setLoading: (isLoading) => {
        set({ isLoading });
      },
    })),
    {
      limit: 50, // Set a limit for the undo/redo history.
      // `partialize` determines which parts of the state are tracked for undo/redo.
      // We exclude all actions and transient state like `isLoading`.
      partialize: (state) => {
        const {
          // These are functions, not state data, so we exclude them.
          loadProject, resetProject, setTitlePageField, setProjectTitle,
          setSharedBackgroundImage, removeSharedBackgroundImage, setSharedLogo,
          removeSharedLogo, updateTitlePageLogo, updateEndPageLogo,
          setEndPageField, setEndPageBackgroundImage, setEndPageMirror,
          addPanel, removePanel, updatePanel, reorderPanels,
          setPanelImage, toggleLogoSizesLinked, setLoading,
          // This is transient UI state, not part of the project's data.
          isLoading,
          // The `...rest` includes all the actual project data we want to track.
          ...rest
        } = state;
        return rest;
      },
    }
  )
);

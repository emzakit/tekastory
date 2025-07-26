
import type { LOGO_POSITIONS, LOGO_SIZES } from '../constants';

/** Represents the possible positions for a logo on a page. */
export type LogoPosition = keyof typeof LOGO_POSITIONS;

/** Represents the possible sizes for a logo. */
export type LogoSize = keyof typeof LOGO_SIZES;

/**
 * Defines the properties of a logo asset, including its source,
 * a key for asset management, and its layout properties.
 */
export interface Logo {
  /** The displayable source URL of the logo (e.g., blob URL or path). */
  src: string;
  /** A unique key referencing the original file in the asset service. */
  assetKey: string;
  /** The placement of the logo on the page. */
  position: LogoPosition;
  /** The display size of the logo. */
  size: LogoSize;
}

/**
 * Defines the structure for the title page of the storyboard.
 */
export interface TitlePage {
  /** The main heading text. */
  header: string;
  /** The subheading text, can include newlines. */
  subHeader: string;
  /** The source URL for the background image. */
  backgroundImage: string;
  /** The unique asset key for the background image file. */
  backgroundImageAssetKey: string;
  /** The logo object to be displayed, or null if no logo is present. */
  logo: Logo | null;
}

/**
 * Defines the structure for a single storyboard panel.
 */
export interface Panel {
  /** A unique identifier for the panel, used for keys and drag-and-drop. */
  id: string;
  /** The source URL for the panel's image. */
  image: string;
  /** The unique asset key for the panel's image file. */
  imageAssetKey: string;
  /** The script or notes associated with the panel. Can include newlines. */
  script: string;
}

/**
 * Defines the structure for the end page of the storyboard.
 */
export interface EndPage {
  /** The source URL for the background image. */
  backgroundImage: string;
  /** The unique asset key for the background image file. */
  backgroundImageAssetKey: string;
  /** The logo object to be displayed, or null if no logo is present. */
  logo: Logo | null;
  /** The main text displayed on the end page (e.g., "The End"). */
  text: string;
  /** A boolean to control the visibility of the main text. */
  showText: boolean;
  /** If true, the end page mirrors the background and logo of the title page. */
  mirrorTitlePage: boolean;
}

/**
 * Represents the entire state of the TekaStory project.
 */
export interface ProjectState {
  /** The title of the project, used for file saving and identification. */
  projectTitle: string;
  /** The state object for the title page. */
  titlePage: TitlePage;
  /** An array of panel state objects. */
  panels: Panel[];
  /** The state object for the end page. */
  endPage: EndPage;
  /** If true, the logo sizes on the title and end pages are synchronized. */
  logoSizesLinked: boolean;
  /** A transient state flag to indicate if a long-running operation (like saving or loading) is in progress. */
  isLoading: boolean;
}

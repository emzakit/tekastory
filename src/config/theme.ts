

export const theme = {
  colors: {
    // Primary action color for buttons, highlights, active states, and focus rings.
    primary: '#4F46E5',
    // Hover state for primary color elements.
    primaryHover: '#4338CA',
    // Secondary action color for buttons (e.g., Load, Save).
    secondary: '#64748B',
    // Hover state for secondary color elements.
    secondaryHover: '#475569',
    // Accent color for special highlights (e.g., bracketed text in script).
    accent: '#4F46E5',
    // Color for destructive actions (e.g., delete buttons).
    danger: '#dc2626',
    // Hover state for destructive actions.
    dangerHover: '#b91c1c',
    
    // Main background color of the application body.
    background: '#F1F5F9',
    // Default background for UI components like cards and the main editor area.
    surface: '#ffffff',
    // A slightly darker surface for muted elements, like file info display and scrollbar tracks.
    surfaceMuted: '#E2E8F0',
    // Hover state for surface elements, and background for non-primary buttons (e.g., logo size selector).
    surfaceHover: '#CBD5E1',
    
    // Primary text color for high-emphasis content like titles.
    text: '#1E293B',
    // RGB components for `text` color, used for applying opacity with Tailwind.
    rgbText: '30, 41, 59',
    // Secondary text color for medium-emphasis content like labels and sub-headings.
    textMedium: '#475569',
    // Muted text color for tertiary information, placeholders, and panel numbers.
    textMuted: '#64748B',
    // The most subtle text color, used for hints, info icons, and some disabled states.
    textSubtle: '#94A3B8',
    // Text color for use on dark or colored backgrounds (e.g., inside buttons).
    textLight: '#ffffff',
    
    // Default border color for containers, separators, and cards.
    border: '#CBD5E1',
    // A slightly darker border color for form inputs and other interactive elements.
    borderMuted: '#94A3B8',

    // Border color for a panel's image container.
    panelBorder: '#1E293B',
    // Hover state border color for a panel's image container.
    panelBorderHover: '#4F46E5',
    
    // Focus ring color for primary interactive elements.
    focus: '#4F46E5',
    // Focus ring color for secondary interactive elements.
    focusSecondary: '#64748B',
    // Focus ring color for danger interactive elements.
    focusDanger: '#ef4444',

    // Base color for overlays (typically black). Used with an opacity value for title/end pages.
    overlayBase: '#000000',
    // RGB components for `overlayBase` color, used for applying opacity with Tailwind.
    rgbOverlayBase: '0, 0, 0',
    // A specific overlay with primary color, used for the image upload hover state.
    primaryOverlay: 'rgba(30, 41, 59, 0.75)',
    // Background color for tooltips that appear on hover.
    tooltipBg: '#1E293B',
    // Color for drop shadows, used for the drag-and-drop panel overlay.
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  opacity: {
    // Opacity for disabled UI elements (e.g., buttons, logo controls).
    disabled: '0.5',
    // Opacity for the panel being dragged and dropped.
    drag: '0.75',
    // Opacity for the header background (currently not used, header is solid).
    header: '0.8',
    // Opacity for icons in the application header.
    headerIcon: '0.9',
    // Opacity for the dark overlay on the title and end page previews.
    overlay: '0.7',
    // Opacity for the translucent background of the main loading overlay.
    loadingOverlay: '0.85',
    // Opacity for tooltips (usually full opacity).
    tooltip: '1',
    // Utility value for fully transparent elements (e.g., hiding mirrored text for layout).
    none: '0',
    // Utility value for fully opaque elements.
    full: '1',
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },
  font: {
    display: "'Oswald', sans-serif",
    body: "'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
    files: {
      'Oswald-Bold': 'Oswald-Bold.ttf',
      'Oswald-Light': 'Oswald-Light.ttf',
      'Oswald-Regular': 'Oswald-Regular.ttf',
      'OpenSans-Regular': 'OpenSans-Regular.ttf',
      'OpenSans-Bold': 'OpenSans-Bold.ttf',
    }
  },
  fontSize: {
    pdf: {
      title: 72,
      subTitle: 36,
      panelNumber: 14,
      scriptLabel: 10,
      script: 13,
      scriptLineHeight: 12,
    }
  }
} as const;
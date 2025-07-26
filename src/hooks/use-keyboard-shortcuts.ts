
import { useEffect, useCallback } from 'react';
import { useStore } from '../store/project-store';
import { saveProject } from '../lib/project-service';

/**
 * A custom hook that sets up and tears down global keyboard shortcuts for the application.
 * It handles common actions like Save, Load, Undo, Redo, and Add Panel.
 */
export function useKeyboardShortcuts() {
  // Get the necessary action functions from the Zustand store.
  const addPanel = useStore((state) => state.addPanel);
  const { undo, redo } = useStore.temporal.getState(); // Get undo/redo from the temporal middleware.

  /**
   * The callback function that handles the `keydown` event.
   * It's wrapped in `useCallback` to prevent re-creation on every render.
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if Ctrl (on Windows/Linux) or Cmd (on Mac) is pressed.
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlCmd = isMac ? event.metaKey : event.ctrlKey;
    
    if (isCtrlCmd) {
      switch (event.key.toLowerCase()) {
        case 's': // Ctrl+S or Cmd+S
          event.preventDefault(); // Prevent the browser's save dialog.
          saveProject();
          break;
        case 'o': // Ctrl+O or Cmd+O
          event.preventDefault(); // Prevent the browser's open file dialog.
          // Programmatically click the "Load Project" button in the header.
          document.getElementById('load-project-button')?.click();
          break;
        case 'b': // Ctrl+B or Cmd+B
          event.preventDefault();
          addPanel();
          break;
        case 'z': // Ctrl+Z or Cmd+Z
          event.preventDefault();
          // Handle Redo (Shift+Z)
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y': // Ctrl+Y or Cmd+Y (standard Redo shortcut on Windows)
          event.preventDefault();
          redo();
          break;
      }
    }
  }, [addPanel, undo, redo]); // Dependencies for the useCallback hook.

  // Use `useEffect` to attach and clean up the event listener.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // The cleanup function is returned from useEffect and runs when the component unmounts.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // The effect re-runs only if handleKeyDown changes.
}

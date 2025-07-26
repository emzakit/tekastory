
import React, { useSyncExternalStore } from 'react';
import { useStore } from '../../store/project-store';
import { saveProject, loadProject } from '../../lib/project-service';
import { exportToPdf } from '../../lib/pdf-service';
import { content } from '../../config/content';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { invoke } from '@tauri-apps/api/tauri';

/**
 * The main application header. It contains the primary action buttons for the application,
 * such as New, Load, Save, Export, and Undo/Redo.
 */
const Header: React.FC = () => {
  // Get the `resetProject` action from the main store.
  const { resetProject } = useStore(state => ({ 
    resetProject: state.resetProject,
  }));
  
  // Get undo/redo functions directly from the temporal (zundo) middleware state.
  const { undo, redo } = useStore.temporal.getState();

  // `useSyncExternalStore` is the officially recommended way to subscribe to external stores
  // like zundo's temporal store. This ensures the component re-renders safely when
  // the undo/redo stacks change.
  const pastStates = useSyncExternalStore(useStore.temporal.subscribe, () => useStore.temporal.getState().pastStates);
  const futureStates = useSyncExternalStore(useStore.temporal.subscribe, () => useStore.temporal.getState().futureStates);

  /**
   * Handles the click on the "Help" button. In a Tauri environment, this invokes a
   * Rust command that opens the bundled `README.html` documentation file in a new window.
   */
  const handleHelpClick = () => {
    // `invoke` is a Tauri API function to call a command defined in the Rust backend.
    if ((window as any).__TAURI__) {
      invoke('open_docs');
    }
  };

  return (
    <header className="bg-[var(--color-background)] border-b border-[var(--color-border)] p-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)]">
          <img src={content.assets.appClapperIconPath} alt="TekaStory Logo" className="w-6 h-6 opacity-[var(--opacity-header-icon)]" />
          <span>{content.appTitle}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Undo/Redo buttons are disabled based on the length of the past/future state arrays. */}
        <Button onClick={() => undo()} disabled={pastStates.length === 0} title={content.tooltips.undo} variant="secondary"><Icon name="Undo2" /></Button>
        <Button onClick={() => redo()} disabled={futureStates.length === 0} title={content.tooltips.redo} variant="secondary"><Icon name="Redo2" /></Button>
        
        <div className="w-px h-6 bg-[var(--color-border-muted)] mx-2"></div>
        
        <Button onClick={() => resetProject()} variant="secondary"><Icon name="PlusCircle" /> {content.buttons.newProject}</Button>
        <Button id="load-project-button" onClick={() => loadProject()} variant="secondary"><Icon name="FolderOpen" /> {content.buttons.loadProject}</Button>
        <Button onClick={() => saveProject()} variant="secondary"><Icon name="Save" /> {content.buttons.saveProject}</Button>
        <Button onClick={() => exportToPdf()} variant="primary"><Icon name="FileDown" /> {content.buttons.exportPdf}</Button>
        
        <div className="w-px h-6 bg-[var(--color-border-muted)] mx-2"></div>
        
        <Button onClick={handleHelpClick} variant="secondary" title={content.tooltips.help}>
          {content.buttons.help}
        </Button>
      </div>
    </header>
  );
};

export default Header;

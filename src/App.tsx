
import React from 'react';
import Header from './components/layout/Header';
import TitleAndEndPageEditor from './components/editors/TitlePageEditor';
import StoryboardCanvas from './components/canvas/StoryboardCanvas';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { content } from './config/content';
import { useStore } from './store/project-store';
import LoadingOverlay from './components/ui/LoadingOverlay';

/**
 * The root component of the TekaStory application.
 * It sets up the main layout, orchestrates the primary sections (Header, Editors, Canvas),
 * and initializes global functionalities like keyboard shortcuts and the loading overlay.
 */
function App() {
  // Initialize the global keyboard shortcuts listener.
  useKeyboardShortcuts();
  // Subscribe to the loading state to show/hide the overlay.
  const isLoading = useStore(state => state.isLoading);

  return (
    <div className="bg-[var(--color-background)] min-h-screen text-[var(--color-text)] flex flex-col">
      {/* The loading overlay is shown above all other content when isLoading is true. */}
      {isLoading && <LoadingOverlay />}
      
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto p-4 space-y-8 w-full">
        {/* A helpful pro-tip for users. */}
        <p className="text-center text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold">Pro tip:</span> {content.tooltips.proTip}
        </p>
        
        {/* The main editor for configuring the title and end pages. */}
        <TitleAndEndPageEditor />
        
        {/* The canvas where users build their storyboard panels. */}
        <StoryboardCanvas />
      </main>
      
      <footer className="text-center p-4">
        <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
          <img src={content.assets.appClapperIconPath} alt="TekaStory app icon" className="w-8 h-8"/>
          <span>{content.labels.footer}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../../store/project-store';
import type { Panel as PanelType } from '../../types';
import ImageUpload from '../ui/ImageUpload';
import TextArea from '../ui/TextArea';
import Icon from '../ui/Icon';
import { content } from '../../config/content';

/**
 * A placeholder component displayed in the script area when it's empty.
 */
const ScriptPlaceholder: React.FC = () => (
    <div className="text-[var(--color-text-subtle)] italic whitespace-pre-wrap">
        {'Click to edit...\nPaste / type voiceover lines like this\n'}
        <span className="text-[var(--color-accent)] not-italic font-medium">Wrap descriptions in brackets to highlight them</span>
    </div>
);

/**
 * Represents a single storyboard panel card within the canvas.
 * It handles its own content editing (image and script) and is a sortable item for dnd-kit.
 * @param {object} props - The component props.
 * @param {PanelType} props.panel - The data for this specific panel.
 * @param {number} props.index - The display index of the panel.
 */
const Panel: React.FC<{ panel: PanelType; index: number }> = ({ panel, index }) => {
  // Get actions from the Zustand store to update the panel's state.
  const { updatePanel, removePanel, setPanelImage } = useStore(state => ({
    updatePanel: state.updatePanel,
    removePanel: state.removePanel,
    setPanelImage: state.setPanelImage,
  }));
  
  // The `useSortable` hook from dnd-kit provides the necessary props to make this component draggable.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: panel.id });
  
  // Local state to toggle between displaying the script and showing the editing textarea.
  const [isEditingScript, setIsEditingScript] = useState(false);

  // Styles applied by dnd-kit to handle the dragging animation and state.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 'var(--opacity-drag)' : 'var(--opacity-full)',
  };
  
  /** Handles the click event for the remove button, with a confirmation dialog. */
  const handleRemove = () => {
    if (window.confirm(`${content.alerts.confirmPanelDelete}${index + 1}?`)) {
      removePanel(panel.id);
    }
  };

  /**
   * Formats the script text to render text within `[brackets]` in a different style.
   * @param text The script string to format.
   * @returns A React fragment with styled and unstyled text parts.
   */
  const formatBracketedText = (text: string) => {
    if (!text) return null;
    // Split the text by the bracketed content, keeping the delimiters.
    const parts = text.split(/(\[[\s\S]*?\])/g);
    return (
        <>
            {parts.filter(part => part).map((part, index) => {
                // If a part is bracketed, wrap it in a styled span.
                if (part.startsWith('[') && part.endsWith(']')) {
                    return <span key={index} className="text-[var(--color-accent)] font-semibold">{part.slice(1, -1)}</span>;
                }
                return part;
            })}
        </>
    );
  };

  return (
    // `setNodeRef` attaches this DOM node to dnd-kit for tracking.
    <div ref={setNodeRef} style={style} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm flex flex-col p-3 gap-3 touch-manipulation">
      <div className="flex items-center justify-between text-[var(--color-text-subtle)]">
        <div className="flex items-center gap-2">
          {/* The drag handle. `listeners` and `attributes` are from useSortable. */}
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
            <Icon name="GripVertical" />
          </div>
          {/* Display the panel number, padded with a leading zero. */}
          <span className="font-mono text-lg">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <button onClick={handleRemove} className="p-1 hover:text-[var(--color-danger)] transition-colors">
          <Icon name="Trash2" />
        </button>
      </div>

      <div className="w-full aspect-video">
        <ImageUpload
          onUpload={(src, assetKey) => setPanelImage(panel.id, src, assetKey)}
          currentImage={panel.image}
          borderStyle="solid"
        >
          <Icon name="Film" className="w-10 h-10 mx-auto mb-2" />
          <p>{content.imageUpload.panelPrompt}</p>
        </ImageUpload>
      </div>
      <div className="w-full flex flex-col gap-2">
        {isEditingScript ? (
          // When in edit mode, render a textarea.
          <TextArea
            label={
               <div className="flex items-center gap-1.5">
                  <span>{content.labels.script}</span>
                  <div className="group relative flex items-center">
                      <Icon name="Info" className="w-4 h-4 text-[var(--color-text-subtle)] cursor-help" />
                      <span className="pointer-events-none absolute bottom-full mb-2 w-max max-w-xs scale-0 transform rounded bg-[var(--color-tooltip-bg)] p-2 text-xs text-[var(--color-text-light)] transition-all group-hover:scale-100 origin-bottom z-30 left-1/2 -translate-x-1/2">
                          Max 6 lines. Wrap text in [brackets] to highlight it.
                      </span>
                  </div>
              </div>
            }
            value={panel.script}
            onChange={e => {
              // Limit the script to 6 lines to prevent layout issues in the PDF.
              const lines = e.target.value.split('\n');
              if (lines.length <= 6) {
                updatePanel(panel.id, { script: e.target.value });
              }
            }}
            rows={6}
            onBlur={() => setIsEditingScript(false)} // Exit edit mode on blur.
            placeholder={"Paste / type voiceover lines like this\n[Wrap descriptions in brackets for emphasis]"}
            autoFocus // Automatically focus the textarea when it appears.
          />
        ) : (
          // When not in edit mode, render the formatted, non-editable text.
          <div className="w-full" onClick={() => setIsEditingScript(true)}>
            <label className="block text-xs font-medium text-[var(--color-text-medium)] mb-1">{content.labels.script}</label>
            <div 
              className="w-full bg-[var(--color-background)] border border-[var(--color-border-muted)] hover:border-[var(--color-accent)] transition-colors rounded-md p-2 text-sm whitespace-pre-wrap cursor-text flex flex-col"
              style={{ minHeight: '8.5rem' }} // Ensure consistent height.
            >
              {panel.script ? formatBracketedText(panel.script) : <ScriptPlaceholder />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panel;

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, Active } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from '../../store/project-store';
import Panel from './Panel';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { content } from '../../config/content';

/**
 * The main canvas area that displays and manages the grid of storyboard panels.
 * It uses `dnd-kit` to provide drag-and-drop reordering functionality.
 */
const StoryboardCanvas: React.FC = () => {
    // Get panel data and actions from the Zustand store.
    const { panels, reorderPanels, addPanel } = useStore(state => ({
        panels: state.panels,
        reorderPanels: state.reorderPanels,
        addPanel: state.addPanel,
    }));
    
    // `active` stores the state of the currently dragged item.
    const [active, setActive] = useState<Active | null>(null);
    
    // Configure sensors for dnd-kit. A PointerSensor is used for mouse/touch input.
    // `activationConstraint` prevents accidental drags by requiring a small drag distance.
    const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }));

    // Find the full panel object corresponding to the active drag item.
    // This is used to render a copy of the panel in the `DragOverlay`.
    const activePanel = active ? panels.find(p => p.id === active.id) : null;

    /**
     * Handles the start of a drag operation. Sets the active item.
     * @param event The drag start event from dnd-kit.
     */
    const handleDragStart = (event: DragStartEvent) => {
        setActive(event.active);
    };

    /**
     * Handles the end of a drag operation. Updates the panel order in the store.
     * @param event The drag end event from dnd-kit.
     */
    const handleDragEnd = (event: DragEndEvent) => {
        setActive(null); // Clear the active item.
        const { active, over } = event;
        
        // If the item was dropped over a different item, reorder the panels.
        if (over && active.id !== over.id) {
            const oldIndex = panels.findIndex(p => p.id === active.id);
            const newIndex = panels.findIndex(p => p.id === over.id);
            
            // Create a new array with the reordered panels.
            const newPanels = [...panels];
            const [movedPanel] = newPanels.splice(oldIndex, 1);
            newPanels.splice(newIndex, 0, movedPanel);
            
            // Dispatch the reorder action to the store.
            reorderPanels(newPanels);
        }
    };
    
    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">{content.labels.panelPrefix}s</h2>
              <div className="group relative flex items-center">
                <Icon name="Info" className="w-5 h-5 text-[var(--color-text-subtle)] cursor-help" />
                <span className="pointer-events-none absolute left-full ml-2 w-max max-w-xs scale-0 transform rounded bg-[var(--color-tooltip-bg)] p-2 text-xs text-[var(--color-text-light)] transition-all group-hover:scale-100 origin-left z-10">
                  {content.tooltips.reorderPanels}
                </span>
              </div>
            </div>
            {/* The DndContext provides the context for all dnd-kit hooks and components. */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* SortableContext provides context for sortable items and defines the sorting strategy. */}
                <SortableContext items={panels} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {panels.map((panel, index) => (
                            <Panel key={panel.id} panel={panel} index={index} />
                        ))}
                    </div>
                </SortableContext>
                
                {/* DragOverlay renders a copy of the dragged item that follows the cursor.
                    This provides a smoother visual experience than moving the original item. */}
                <DragOverlay className="drag-overlay">
                    {activePanel ? <Panel panel={activePanel} index={panels.findIndex(p => p.id === activePanel.id)} /> : null}
                </DragOverlay>
            </DndContext>
            <div className="mt-8 flex justify-center">
                <Button onClick={addPanel} variant="primary">
                    <Icon name="PlusCircle" /> {content.buttons.addNewPanel}
                </Button>
            </div>
        </div>
    );
};

export default StoryboardCanvas;

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item component
const SortableItem = ({ field }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.key });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="mb-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
        <span className="inline-flex items-center justify-center w-5 h-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 9h8M8 15h8" />
          </svg>
        </span>
        {field.icon}{field.label}
      </div>
      <div className="flex gap-3 ml-6">
        {field.options.map(opt => (
          <button
            key={opt.value}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors 
              ${field.selected && field.direction === opt.value ? 'bg-gray-200 text-black font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => field.onSelect(field.key, opt.value)}
          >
            <span>{opt.label}</span>
            {field.selected && field.direction === opt.value && (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12l5 5L20 7"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const SortDropdown = ({ isOpen, sortRef, sortFields, currentSort, onSortChange, onClose }) => {
  const [items, setItems] = useState(sortFields);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.key === active.id);
        const newIndex = items.findIndex(item => item.key === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={sortRef} className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">Sort By</div>
      <div className="p-3">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.key)}
            strategy={verticalListSortingStrategy}
          >
            {items.map(field => (
              <SortableItem 
                key={field.key} 
                field={{
                  ...field,
                  selected: currentSort.field === field.key,
                  direction: currentSort.direction,
                  onSelect: onSortChange
                }} 
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="p-3 border-t border-gray-200 flex justify-between">
        <button 
          onClick={onClose} 
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Clear all
        </button>
        <button 
          onClick={onClose}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Apply Sort
        </button>
      </div>
    </div>
  );
};

export default SortDropdown;
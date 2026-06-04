'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/lib/store/kanban-store';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onEdit }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full w-80 flex-shrink-0 flex-col rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.1)]"
    >
      <div className="border-b border-[rgba(255,255,255,0.1)] p-4">
        <h2 className="font-semibold text-[#FFFFFF]">
          {title} <span className="ml-2 text-sm text-[rgba(255,255,255,0.4)]">{tasks.length}</span>
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onEdit={() => onEdit(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/store/kanban-store';

interface KanbanCardProps {
  task: Task;
  onEdit?: () => void;
}

export function KanbanCard({ task, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      className="cursor-grab rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 shadow-sm transition-colors hover:border-[#FFD31D] hover:bg-[rgba(255,255,255,0.08)] active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between">
        <span
          className={`rounded border px-2 py-0.5 text-xs font-medium uppercase ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
        {onEdit && (
          <button className="text-[rgba(255,255,255,0.4)] hover:text-[#FFFFFF]">
            <span className="sr-only">Edit</span>
            ✎
          </button>
        )}
      </div>
      <h3 className="mb-1 font-medium text-[#FFFFFF] line-clamp-2">{task.title}</h3>
      {task.description && (
        <p className="mb-3 text-xs text-[rgba(255,255,255,0.64)] line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs text-[rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-1">
          <span className="h-4 w-4 rounded-full bg-[rgba(255,255,255,0.1)] text-center leading-4">
            {task.assignee.charAt(0)}
          </span>
          <span>{task.assignee.split(' ')[0]}</span>
        </div>
        <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

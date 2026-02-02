'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useKanbanStore, TaskStatus, Task } from '@/lib/store/kanban-store';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { TaskForm } from './TaskForm';
import { Dialog, OverlayContent, OverlayHeader, OverlayTitle } from '@/components/ui/Overlay';
import { createPortal } from 'react-dom';

const COLUMNS: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Review', 'QA', 'Done'];

export function KanbanBoard() {
  const { tasks, moveTask, checkArchive } = useKanbanStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Archive check on mount
  useEffect(() => {
    checkArchive();
    const interval = setInterval(checkArchive, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkArchive]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!mounted) return null;

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesAssignee = assigneeFilter ? t.assignee === assigneeFilter : true;
    return matchesSearch && matchesAssignee;
  });

  const activeTask = tasks.find((t) => t.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as TaskStatus)) {
      moveTask(activeId, overId as TaskStatus);
      return;
    }

    // Check if dropped on another card
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status !== task.status) {
        moveTask(activeId, overTask.status);
    }
  };

  if (showHistory) {
    const archivedTasks = tasks.filter((t) => t.archived).sort((a, b) => new Date(b.doneAt!).getTime() - new Date(a.doneAt!).getTime());
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#FFFFFF]">Task History</h1>
          <button
            onClick={() => setShowHistory(false)}
            className="rounded bg-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.2)]"
          >
            Back to Board
          </button>
        </div>
        <div className="grid gap-4">
            {archivedTasks.length === 0 ? <p className="text-[rgba(255,255,255,0.4)]">No archived tasks.</p> : archivedTasks.map(t => (
                <div key={t.id} className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 text-[#FFFFFF]">
                    <div className="font-bold">{t.title}</div>
                    <div className="text-sm text-[rgba(255,255,255,0.64)]">Done: {new Date(t.doneAt!).toLocaleDateString()}</div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0B0B0B]">
      <div className="flex flex-col gap-4 border-b border-[rgba(255,255,255,0.1)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Kanban Board</h1>
        
        <div className="flex flex-1 items-center gap-4 sm:justify-end">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[#FFFFFF] focus:border-[#FFD31D] focus:outline-none"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="rounded bg-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.2)]"
            >
              History
            </button>
            <button
              onClick={() => { setEditingTask(null); setShowForm(true); }}
              className="rounded bg-[#FFD31D] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A]"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto p-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              id={col}
              title={col}
              tasks={filteredTasks.filter((t) => t.status === col && !t.archived)}
              onEdit={(task: Task) => { setEditingTask(task); setShowForm(true); }}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <OverlayContent>
            <OverlayHeader>
                <OverlayTitle>{editingTask ? 'Edit Task' : 'New Task'}</OverlayTitle>
            </OverlayHeader>
            <TaskForm 
                initialData={editingTask || undefined} 
                onClose={() => setShowForm(false)} 
            />
        </OverlayContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Task, TaskStatus, Assignee, Priority, useKanbanStore } from '@/lib/store/kanban-store';

interface TaskFormProps {
  initialData?: Task;
  onClose: () => void;
}

const ASSIGNEES: Assignee[] = ['Ali (CEO)', 'Tuffy Architect', 'Tuffy Dev', 'Tuffy QA'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
const STATUSES: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Review', 'QA', 'Done'];

export function TaskForm({ initialData, onClose }: TaskFormProps) {
  const { addTask, updateTask, deleteTask } = useKanbanStore();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignee: initialData?.assignee || 'Tuffy Dev',
    priority: initialData?.priority || 'Medium',
    status: initialData?.status || 'Backlog',
    userStory: initialData?.userStory || '',
    acceptanceCriteria: initialData?.acceptanceCriteria || '',
    qaNotes: initialData?.qaNotes || '',
    checklist: initialData?.checklist || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (initialData) {
      updateTask(initialData.id, formData);
    } else {
      addTask(formData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialData && confirm('Are you sure you want to delete this task?')) {
      deleteTask(initialData.id);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[#FFFFFF]">
      <div>
        <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Description</label>
        <textarea
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-[rgba(255,255,255,0.8)]">User Story</label>
        <textarea
          rows={2}
          value={formData.userStory}
          onChange={(e) => setFormData({ ...formData, userStory: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          placeholder="As a user..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Acceptance Criteria</label>
          <textarea
            rows={4}
            value={formData.acceptanceCriteria}
            onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
            placeholder="- Criteria 1..."
          />
        </div>
        <div>
          <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Checklist / QA Notes</label>
          <textarea
            rows={4}
            value={formData.checklist} // Using checklist field for both edit
            onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
            placeholder="- [ ] To do..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Assignee</label>
          <select
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value as Assignee })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            {ASSIGNEES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[rgba(255,255,255,0.8)]">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between pt-4">
        {initialData ? (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded px-4 py-2 text-red-500 hover:bg-red-500/10"
          >
            Delete
          </button>
        ) : <div />}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 text-[rgba(255,255,255,0.64)] hover:text-[#FFFFFF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-[#FFD31D] px-6 py-2 text-[#000000] hover:bg-[#E5BD1A]"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

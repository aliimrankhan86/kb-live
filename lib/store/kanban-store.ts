import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'QA' | 'Done';
export type Assignee = 'Ali (CEO)' | 'Tuffy Architect' | 'Tuffy Dev' | 'Tuffy QA';
export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  doneAt?: string;
  archived?: boolean;
  
  // Enhanced fields
  userStory?: string;
  acceptanceCriteria?: string; // Bulleted list
  qaNotes?: string;
  checklist?: string; // Guidance checklist based on role
}

interface KanbanState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  checkArchive: () => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              doneAt: task.status === 'Done' ? new Date().toISOString() : undefined,
              archived: false,
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  doneAt:
                    updates.status === 'Done' && t.status !== 'Done'
                      ? new Date().toISOString()
                      : updates.status && updates.status !== 'Done'
                      ? undefined
                      : t.doneAt,
                }
              : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      moveTask: (id, status) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task && task.status !== status) {
          let checklist = task.checklist;
          
          // Role Workflow Logic
          if (status === 'In Progress' && task.assignee === 'Tuffy Dev' && !checklist) {
            checklist = "**Dev Checklist**\n- [ ] Implementation steps\n- [ ] Update tests\n- [ ] Update docs";
          } else if (status === 'QA' && !checklist?.includes('QA Checklist')) {
             checklist = (checklist ? checklist + '\n\n' : '') + "**QA Checklist**\n- [ ] Verify acceptance criteria\n- [ ] Run e2e tests";
          }

          get().updateTask(id, { status, checklist });
        }
      },
      checkArchive: () =>
        set((state) => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          return {
            tasks: state.tasks.map((t) => {
              if (
                t.status === 'Done' &&
                t.doneAt &&
                new Date(t.doneAt) < sevenDaysAgo &&
                !t.archived
              ) {
                return { ...t, archived: true };
              }
              return t;
            }),
          };
        }),
    }),
    {
      name: 'kanban-storage',
    }
  )
);

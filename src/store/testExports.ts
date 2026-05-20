import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { Project, Todo, Theme, PersistedState } from '../types'

export interface AppStore extends PersistedState {
  addProject: (name: string) => void
  updateProjectName: (id: string, name: string) => void
  archiveProject: (id: string) => void
  unarchiveProject: (id: string) => void
  deleteProject: (id: string) => void
  reorderProjects: (activeId: string, overId: string) => void
  updateProjectNotes: (id: string, notes: string) => void
  setSelectedProject: (id: string | null) => void
  addTodo: (projectId: string, text: string) => void
  updateTodoText: (id: string, text: string) => void
  completeTodo: (id: string) => void
  uncompleteTodo: (id: string) => void
  deleteTodo: (id: string) => void
  reorderTodos: (activeId: string, overId: string) => void
  updateTodoNotes: (id: string, notes: string) => void
  setSelectedTodo: (id: string | null) => void
  setTheme: (theme: Theme) => void
  toggleHideArchived: () => void
  toggleHideCompleted: () => void
  loadState: (state: PersistedState) => void
}

export const buildStoreState: StateCreator<AppStore> = (set, get) => ({
  projects: [],
  todos: [],
  selectedProjectId: null,
  selectedTodoId: null,
  theme: 'system',
  hideArchivedProjects: false,
  hideCompletedTodos: false,

  addProject: (name) => {
    set((s) => ({
      projects: [
        { id: nanoid(), name: name.trim(), order: 0, archived: false, notes: '', createdAt: Date.now() },
        ...s.projects.map((p: Project) => ({ ...p, order: p.order + 1 })),
      ],
    }))
  },

  updateProjectName: (id, name) =>
    set((s) => ({
      projects: s.projects.map((p: Project) =>
        p.id === id ? { ...p, name: name.trim() } : p
      ),
    })),

  archiveProject: (id) =>
    set((s) => ({
      projects: s.projects.map((p: Project) =>
        p.id === id ? { ...p, archived: true } : p
      ),
      selectedProjectId:
        s.selectedProjectId === id ? null : s.selectedProjectId,
      selectedTodoId: s.selectedProjectId === id ? null : s.selectedTodoId,
    })),

  unarchiveProject: (id) =>
    set((s) => ({
      projects: s.projects.map((p: Project) =>
        p.id === id ? { ...p, archived: false } : p
      ),
    })),

  deleteProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p: Project) => p.id !== id),
      todos: s.todos.filter((t: Todo) => t.projectId !== id),
      selectedProjectId:
        s.selectedProjectId === id ? null : s.selectedProjectId,
      selectedTodoId: s.selectedProjectId === id ? null : s.selectedTodoId,
    })),

  reorderProjects: (activeId, overId) => {
    const all = get().projects
    const active = [...all.filter((p: Project) => !p.archived)].sort(
      (a: Project, b: Project) => a.order - b.order
    )
    const activeIdx = active.findIndex((p: Project) => p.id === activeId)
    const overIdx = active.findIndex((p: Project) => p.id === overId)
    if (activeIdx === -1 || overIdx === -1) return
    const reordered = [...active]
    const [moved] = reordered.splice(activeIdx, 1)
    reordered.splice(overIdx, 0, moved)
    const withOrder = reordered.map((p: Project, i: number) => ({ ...p, order: i }))
    set({ projects: all.map((p: Project) => withOrder.find((r) => r.id === p.id) ?? p) })
  },

  updateProjectNotes: (id, notes) =>
    set((s) => ({
      projects: s.projects.map((p: Project) =>
        p.id === id ? { ...p, notes } : p
      ),
    })),

  setSelectedProject: (id) =>
    set({ selectedProjectId: id, selectedTodoId: null }),

  addTodo: (projectId, text) => {
    set((s) => ({
      todos: [
        { id: nanoid(), projectId, text: text.trim(), order: 0, completed: false, notes: '', createdAt: Date.now() },
        ...s.todos.map((t: Todo) =>
          t.projectId === projectId ? { ...t, order: t.order + 1 } : t
        ),
      ],
    }))
  },

  updateTodoText: (id, text) =>
    set((s) => ({
      todos: s.todos.map((t: Todo) =>
        t.id === id ? { ...t, text: text.trim() } : t
      ),
    })),

  completeTodo: (id) =>
    set((s) => ({
      todos: s.todos.map((t: Todo) =>
        t.id === id ? { ...t, completed: true } : t
      ),
    })),

  uncompleteTodo: (id) =>
    set((s) => ({
      todos: s.todos.map((t: Todo) =>
        t.id === id ? { ...t, completed: false } : t
      ),
    })),

  deleteTodo: (id) =>
    set((s) => ({
      todos: s.todos.filter((t: Todo) => t.id !== id),
      selectedTodoId: s.selectedTodoId === id ? null : s.selectedTodoId,
    })),

  reorderTodos: (activeId, overId) => {
    const projectId = get().todos.find((t: Todo) => t.id === activeId)?.projectId
    if (!projectId) return
    const all = get().todos
    const active = [...all.filter((t: Todo) => t.projectId === projectId && !t.completed)].sort(
      (a: Todo, b: Todo) => a.order - b.order
    )
    const activeIdx = active.findIndex((t: Todo) => t.id === activeId)
    const overIdx = active.findIndex((t: Todo) => t.id === overId)
    if (activeIdx === -1 || overIdx === -1) return
    const reordered = [...active]
    const [moved] = reordered.splice(activeIdx, 1)
    reordered.splice(overIdx, 0, moved)
    const withOrder = reordered.map((t: Todo, i: number) => ({ ...t, order: i }))
    set({ todos: all.map((t: Todo) => withOrder.find((r) => r.id === t.id) ?? t) })
  },

  updateTodoNotes: (id, notes) =>
    set((s) => ({
      todos: s.todos.map((t: Todo) => (t.id === id ? { ...t, notes } : t)),
    })),

  setSelectedTodo: (id) => set({ selectedTodoId: id }),

  setTheme: (theme) => set({ theme }),
  toggleHideArchived: () =>
    set((s) => ({ hideArchivedProjects: !s.hideArchivedProjects })),
  toggleHideCompleted: () =>
    set((s) => ({ hideCompletedTodos: !s.hideCompletedTodos })),

  loadState: (state) => set(state),
})

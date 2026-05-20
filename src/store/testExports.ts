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
  toggleShowArchived: () => void
  toggleShowCompleted: () => void
  loadState: (state: PersistedState) => void
}

export const buildStoreState: StateCreator<AppStore> = (set, get) => ({
  projects: [],
  todos: [],
  selectedProjectId: null,
  selectedTodoId: null,
  theme: 'system',
  showArchivedProjects: false,
  showCompletedTodos: false,

  addProject: (name) => {
    const projects = get().projects
    const maxOrder = projects.reduce((m: number, p: Project) => Math.max(m, p.order), -1)
    set((s) => ({
      projects: [
        ...s.projects,
        {
          id: nanoid(),
          name: name.trim(),
          order: maxOrder + 1,
          archived: false,
          notes: '',
          createdAt: Date.now(),
        },
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
    const projects = [...get().projects].sort((a: Project, b: Project) => a.order - b.order)
    const activeIdx = projects.findIndex((p: Project) => p.id === activeId)
    const overIdx = projects.findIndex((p: Project) => p.id === overId)
    if (activeIdx === -1 || overIdx === -1) return
    const reordered = [...projects]
    const [moved] = reordered.splice(activeIdx, 1)
    reordered.splice(overIdx, 0, moved)
    set({ projects: reordered.map((p: Project, i: number) => ({ ...p, order: i })) })
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
    const todos = get().todos.filter((t: Todo) => t.projectId === projectId)
    const maxOrder = todos.reduce((m: number, t: Todo) => Math.max(m, t.order), -1)
    set((s) => ({
      todos: [
        ...s.todos,
        {
          id: nanoid(),
          projectId,
          text: text.trim(),
          order: maxOrder + 1,
          completed: false,
          notes: '',
          createdAt: Date.now(),
        },
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
      selectedTodoId: s.selectedTodoId === id ? null : s.selectedTodoId,
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
    const projectTodos = [...all.filter((t: Todo) => t.projectId === projectId)].sort(
      (a: Todo, b: Todo) => a.order - b.order
    )
    const activeIdx = projectTodos.findIndex((t: Todo) => t.id === activeId)
    const overIdx = projectTodos.findIndex((t: Todo) => t.id === overId)
    if (activeIdx === -1 || overIdx === -1) return
    const reordered = [...projectTodos]
    const [moved] = reordered.splice(activeIdx, 1)
    reordered.splice(overIdx, 0, moved)
    const withOrder = reordered.map((t: Todo, i: number) => ({ ...t, order: i }))
    set({
      todos: all.map((t: Todo) => withOrder.find((r: Todo) => r.id === t.id) ?? t),
    })
  },

  updateTodoNotes: (id, notes) =>
    set((s) => ({
      todos: s.todos.map((t: Todo) => (t.id === id ? { ...t, notes } : t)),
    })),

  setSelectedTodo: (id) => set({ selectedTodoId: id }),

  setTheme: (theme) => set({ theme }),
  toggleShowArchived: () =>
    set((s) => ({ showArchivedProjects: !s.showArchivedProjects })),
  toggleShowCompleted: () =>
    set((s) => ({ showCompletedTodos: !s.showCompletedTodos })),

  loadState: (state) => set(state),
})

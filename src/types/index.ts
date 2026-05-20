export interface Project {
  id: string
  name: string
  order: number
  archived: boolean
  notes: string
  createdAt: number
}

export interface Todo {
  id: string
  projectId: string
  text: string
  order: number
  completed: boolean
  notes: string
  createdAt: number
}

export type Theme = 'light' | 'dark' | 'system'

export interface PersistedState {
  projects: Project[]
  todos: Todo[]
  selectedProjectId: string | null
  selectedTodoId: string | null
  theme: Theme
  hideArchivedProjects: boolean
  hideCompletedTodos: boolean
}

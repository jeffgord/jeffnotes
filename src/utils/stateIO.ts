import type { PersistedState } from '../types'

export function exportStateToJson(state: PersistedState): string {
  const exportable: PersistedState = {
    projects: state.projects,
    todos: state.todos,
    selectedProjectId: state.selectedProjectId,
    selectedTodoId: state.selectedTodoId,
    theme: state.theme,
    showArchivedProjects: state.showArchivedProjects,
    showCompletedTodos: state.showCompletedTodos,
  }
  return JSON.stringify(exportable, null, 2)
}

export function importStateFromJson(json: string): PersistedState {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON file')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid state: not an object')
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.projects)) throw new Error('Invalid state: missing projects')
  if (!Array.isArray(obj.todos)) throw new Error('Invalid state: missing todos')

  return {
    projects: obj.projects as PersistedState['projects'],
    todos: obj.todos as PersistedState['todos'],
    selectedProjectId:
      typeof obj.selectedProjectId === 'string' ? obj.selectedProjectId : null,
    selectedTodoId:
      typeof obj.selectedTodoId === 'string' ? obj.selectedTodoId : null,
    theme:
      obj.theme === 'light' || obj.theme === 'dark' ? obj.theme : 'system',
    showArchivedProjects: obj.showArchivedProjects === true,
    showCompletedTodos: obj.showCompletedTodos === true,
  }
}

export function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

import { describe, it, expect } from 'vitest'
import { exportStateToJson, importStateFromJson } from '../../src/utils/stateIO'
import type { PersistedState } from '../../src/types'

const sampleState: PersistedState = {
  projects: [
    {
      id: 'p1',
      name: 'Work',
      order: 0,
      archived: false,
      notes: 'Project note',
      createdAt: 1000,
    },
  ],
  todos: [
    {
      id: 't1',
      projectId: 'p1',
      text: 'Fix bug',
      order: 0,
      completed: false,
      notes: 'Todo note',
      createdAt: 2000,
    },
  ],
  selectedProjectId: 'p1',
  selectedTodoId: 't1',
  theme: 'dark',
  showArchivedProjects: true,
  showCompletedTodos: false,
}

describe('exportStateToJson', () => {
  it('produces valid JSON', () => {
    const json = exportStateToJson(sampleState)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes all top-level keys', () => {
    const parsed = JSON.parse(exportStateToJson(sampleState))
    expect(parsed).toHaveProperty('projects')
    expect(parsed).toHaveProperty('todos')
    expect(parsed).toHaveProperty('theme')
    expect(parsed).toHaveProperty('showArchivedProjects')
    expect(parsed).toHaveProperty('showCompletedTodos')
  })
})

describe('importStateFromJson', () => {
  it('round-trips state correctly', () => {
    const json = exportStateToJson(sampleState)
    const imported = importStateFromJson(json)
    expect(imported.projects).toHaveLength(1)
    expect(imported.projects[0].name).toBe('Work')
    expect(imported.todos[0].text).toBe('Fix bug')
    expect(imported.theme).toBe('dark')
    expect(imported.showArchivedProjects).toBe(true)
  })

  it('throws on invalid JSON', () => {
    expect(() => importStateFromJson('not json')).toThrow('Invalid JSON')
  })

  it('throws when projects is missing', () => {
    const json = JSON.stringify({ todos: [] })
    expect(() => importStateFromJson(json)).toThrow('missing projects')
  })

  it('throws when todos is missing', () => {
    const json = JSON.stringify({ projects: [] })
    expect(() => importStateFromJson(json)).toThrow('missing todos')
  })

  it('defaults missing optional fields gracefully', () => {
    const minimal = JSON.stringify({ projects: [], todos: [] })
    const imported = importStateFromJson(minimal)
    expect(imported.theme).toBe('system')
    expect(imported.selectedProjectId).toBeNull()
    expect(imported.showArchivedProjects).toBe(false)
  })
})

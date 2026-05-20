import { describe, it, expect, beforeEach } from 'vitest'
import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AppStore } from '../../src/store/testExports'
import { buildStoreState } from '../../src/store/testExports'

// Build a fresh in-memory store for each test (no persist middleware)
function createTestStore() {
  return create<AppStore>()(buildStoreState)
}

describe('Project actions', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('adds a project', () => {
    store.getState().addProject('Work')
    const { projects } = store.getState()
    expect(projects).toHaveLength(1)
    expect(projects[0].name).toBe('Work')
    expect(projects[0].archived).toBe(false)
    expect(projects[0].order).toBe(0)
  })

  it('adds multiple projects with incrementing order', () => {
    store.getState().addProject('A')
    store.getState().addProject('B')
    const { projects } = store.getState()
    const sorted = [...projects].sort((a, b) => a.order - b.order)
    expect(sorted.map((p) => p.name)).toEqual(['A', 'B'])
  })

  it('updates project name', () => {
    store.getState().addProject('Old')
    const id = store.getState().projects[0].id
    store.getState().updateProjectName(id, 'New')
    expect(store.getState().projects[0].name).toBe('New')
  })

  it('archives a project', () => {
    store.getState().addProject('Test')
    const id = store.getState().projects[0].id
    store.getState().setSelectedProject(id)
    store.getState().archiveProject(id)
    expect(store.getState().projects[0].archived).toBe(true)
    expect(store.getState().selectedProjectId).toBeNull()
  })

  it('unarchives a project', () => {
    store.getState().addProject('Test')
    const id = store.getState().projects[0].id
    store.getState().archiveProject(id)
    store.getState().unarchiveProject(id)
    expect(store.getState().projects[0].archived).toBe(false)
  })

  it('deletes a project and its todos', () => {
    store.getState().addProject('Test')
    const id = store.getState().projects[0].id
    store.getState().addTodo(id, 'Task A')
    store.getState().setSelectedProject(id)
    store.getState().deleteProject(id)
    expect(store.getState().projects).toHaveLength(0)
    expect(store.getState().todos).toHaveLength(0)
    expect(store.getState().selectedProjectId).toBeNull()
  })

  it('reorders projects (only among active)', () => {
    store.getState().addProject('A')
    store.getState().addProject('B')
    store.getState().addProject('C')
    const [a, b, c] = [...store.getState().projects].sort((x, y) => x.order - y.order)
    store.getState().reorderProjects(a.id, c.id)
    const reordered = [...store.getState().projects].sort((x, y) => x.order - y.order)
    expect(reordered[0].name).toBe('B')
    expect(reordered[1].name).toBe('C')
    expect(reordered[2].name).toBe('A')
  })

  it('updates project notes', () => {
    store.getState().addProject('Test')
    const id = store.getState().projects[0].id
    store.getState().updateProjectNotes(id, 'Some notes')
    expect(store.getState().projects[0].notes).toBe('Some notes')
  })

  it('sets selected project and clears selected todo', () => {
    store.getState().addProject('P1')
    store.getState().addProject('P2')
    const [p1] = store.getState().projects
    store.getState().setSelectedProject(p1.id)
    store.getState().addTodo(p1.id, 'T1')
    const todoId = store.getState().todos[0].id
    store.getState().setSelectedTodo(todoId)
    store.getState().setSelectedProject(null)
    expect(store.getState().selectedProjectId).toBeNull()
    expect(store.getState().selectedTodoId).toBeNull()
  })
})

describe('Todo actions', () => {
  let store: ReturnType<typeof createTestStore>
  let projectId: string

  beforeEach(() => {
    store = createTestStore()
    store.getState().addProject('TestProject')
    projectId = store.getState().projects[0].id
  })

  it('adds a todo', () => {
    store.getState().addTodo(projectId, 'Fix bug')
    const { todos } = store.getState()
    expect(todos).toHaveLength(1)
    expect(todos[0].text).toBe('Fix bug')
    expect(todos[0].completed).toBe(false)
    expect(todos[0].projectId).toBe(projectId)
  })

  it('completes a todo', () => {
    store.getState().addTodo(projectId, 'Task')
    const id = store.getState().todos[0].id
    store.getState().completeTodo(id)
    expect(store.getState().todos[0].completed).toBe(true)
  })

  it('uncompletes a todo', () => {
    store.getState().addTodo(projectId, 'Task')
    const id = store.getState().todos[0].id
    store.getState().completeTodo(id)
    store.getState().uncompleteTodo(id)
    expect(store.getState().todos[0].completed).toBe(false)
  })

  it('deletes a todo', () => {
    store.getState().addTodo(projectId, 'Task')
    const id = store.getState().todos[0].id
    store.getState().setSelectedTodo(id)
    store.getState().deleteTodo(id)
    expect(store.getState().todos).toHaveLength(0)
    expect(store.getState().selectedTodoId).toBeNull()
  })

  it('reorders todos (only among active)', () => {
    store.getState().addTodo(projectId, 'A')
    store.getState().addTodo(projectId, 'B')
    store.getState().addTodo(projectId, 'C')
    const [a, b, c] = [...store.getState().todos].sort((x, y) => x.order - y.order)
    store.getState().reorderTodos(a.id, c.id)
    const reordered = [...store.getState().todos].sort((x, y) => x.order - y.order)
    expect(reordered[0].text).toBe('B')
    expect(reordered[1].text).toBe('C')
    expect(reordered[2].text).toBe('A')
  })

  it('updates todo text', () => {
    store.getState().addTodo(projectId, 'Old')
    const id = store.getState().todos[0].id
    store.getState().updateTodoText(id, 'New')
    expect(store.getState().todos[0].text).toBe('New')
  })

  it('updates todo notes', () => {
    store.getState().addTodo(projectId, 'Task')
    const id = store.getState().todos[0].id
    store.getState().updateTodoNotes(id, 'Details here')
    expect(store.getState().todos[0].notes).toBe('Details here')
  })
})

describe('UI actions', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('cycles theme', () => {
    expect(store.getState().theme).toBe('system')
    store.getState().setTheme('dark')
    expect(store.getState().theme).toBe('dark')
    store.getState().setTheme('light')
    expect(store.getState().theme).toBe('light')
  })

  it('toggles hide archived', () => {
    expect(store.getState().hideArchivedProjects).toBe(false)
    store.getState().toggleHideArchived()
    expect(store.getState().hideArchivedProjects).toBe(true)
  })

  it('toggles hide completed', () => {
    expect(store.getState().hideCompletedTodos).toBe(false)
    store.getState().toggleHideCompleted()
    expect(store.getState().hideCompletedTodos).toBe(true)
  })
})

describe('loadState', () => {
  it('replaces the entire state', () => {
    const store = createTestStore()
    store.getState().addProject('OldProject')

    const newState = {
      projects: [{ id: nanoid(), name: 'Imported', order: 0, archived: false, notes: '', createdAt: Date.now() }],
      todos: [],
      selectedProjectId: null,
      selectedTodoId: null,
      theme: 'dark' as const,
      hideArchivedProjects: true,
      hideCompletedTodos: false,
    }
    store.getState().loadState(newState)

    const s = store.getState()
    expect(s.projects).toHaveLength(1)
    expect(s.projects[0].name).toBe('Imported')
    expect(s.theme).toBe('dark')
    expect(s.hideArchivedProjects).toBe(true)
  })
})

import { useState, useRef } from 'react'
import { CheckSquare, Circle } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useStore } from '../../store'
import TodoItem from './TodoItem'

export default function TodosPanel() {
  const [addingNew, setAddingNew] = useState(false)
  const addSpanRef = useRef<HTMLSpanElement>(null)

  const {
    projects,
    todos,
    selectedProjectId,
    selectedTodoId,
    hideCompletedTodos,
    addTodo,
    reorderTodos,
    toggleHideCompleted,
  } = useStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTodos(String(active.id), String(over.id))
    }
  }

  function handleSubmit() {
    const text = addSpanRef.current?.textContent?.trim() ?? ''
    if (text && selectedProjectId) addTodo(selectedProjectId, text)
    setAddingNew(false)
  }

  function startAdding() {
    if (selectedProject?.archived) return
    setAddingNew(true)
    setTimeout(() => addSpanRef.current?.focus(), 0)
  }

  if (!selectedProjectId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center px-4">
          Select a project to view todos
        </p>
      </div>
    )
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const projectTodos = todos
    .filter((t) => t.projectId === selectedProjectId)
    .sort((a, b) => a.order - b.order)
  const activeTodos = projectTodos.filter((t) => !t.completed)
  const completedTodos = projectTodos.filter((t) => t.completed)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
        <span
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 truncate"
          title={selectedProject?.name}
        >
          {selectedProject ? `${selectedProject.name} Todos` : 'Todos'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            title={hideCompletedTodos ? 'Show completed' : 'Hide completed'}
            onClick={toggleHideCompleted}
            className={`p-1 rounded transition-colors cursor-pointer ${
              hideCompletedTodos
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <CheckSquare size={14} />
          </button>
        </div>
      </div>

      <div
        data-testid="todos-list"
        className="flex-1 overflow-y-auto py-1 select-none"
        onDoubleClick={(e) => { if (e.target === e.currentTarget) startAdding() }}
      >
        {addingNew && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded mx-1 my-0.5 text-sm">
            <Circle size={15} className="shrink-0 text-neutral-300 dark:text-neutral-600" />
            <span
              ref={addSpanRef}
              data-testid="add-input"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="New todo…"
              className="flex-1 outline-none cursor-text"
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleSubmit() }
                if (e.key === 'Escape') setAddingNew(false)
              }}
              onBlur={handleSubmit}
            />
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {activeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={todo.id === selectedTodoId}
                projectArchived={selectedProject?.archived}
              />
            ))}
          </SortableContext>
        </DndContext>

        {!hideCompletedTodos && completedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isSelected={todo.id === selectedTodoId}
          />
        ))}

        {activeTodos.length === 0 && completedTodos.length === 0 && !addingNew && (
          <p
            className="text-xs text-neutral-400 dark:text-neutral-500 px-3 py-2 cursor-default select-none"
            onDoubleClick={startAdding}
          >
            No todos yet
          </p>
        )}
      </div>
    </div>
  )
}

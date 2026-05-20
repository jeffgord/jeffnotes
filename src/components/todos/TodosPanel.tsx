import { useState, useRef } from 'react'
import { Plus, Eye, EyeOff } from 'lucide-react'
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
  const [newText, setNewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    projects,
    todos,
    selectedProjectId,
    selectedTodoId,
    showCompletedTodos,
    addTodo,
    reorderTodos,
    toggleShowCompleted,
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
    const text = newText.trim()
    if (text && selectedProjectId) addTodo(selectedProjectId, text)
    setNewText('')
    setAddingNew(false)
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
  const visible = projectTodos.filter((t) => showCompletedTodos || !t.completed)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
        <span
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 truncate"
          title={selectedProject?.name}
        >
          {selectedProject?.name ?? 'Todos'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            title={showCompletedTodos ? 'Hide completed' : 'Show completed'}
            onClick={toggleShowCompleted}
            className={`p-1 rounded transition-colors ${
              showCompletedTodos
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            {showCompletedTodos ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            title="Add todo"
            onClick={() => {
              setAddingNew(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visible.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {visible.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={todo.id === selectedTodoId}
              />
            ))}
          </SortableContext>
        </DndContext>

        {visible.length === 0 && !addingNew && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 px-3 py-2">
            No todos yet
          </p>
        )}

        {addingNew && (
          <div className="px-2 py-1">
            <input
              ref={inputRef}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
                if (e.key === 'Escape') {
                  setNewText('')
                  setAddingNew(false)
                }
              }}
              onBlur={handleSubmit}
              placeholder="New todo…"
              className="w-full text-sm px-2 py-1 rounded border border-blue-400 dark:border-blue-500 bg-white dark:bg-neutral-800 outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}

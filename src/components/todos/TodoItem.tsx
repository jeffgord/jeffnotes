import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store'
import ConfirmDialog from '../ui/ConfirmDialog'
import ContextMenu from '../ui/ContextMenu'
import type { Todo } from '../../types'

interface Props {
  todo: Todo
  isSelected: boolean
}

export default function TodoItem({ todo, isSelected }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const { completeTodo, uncompleteTodo, deleteTodo, setSelectedTodo } = useStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        data-testid="todo-item"
        className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer select-none rounded mx-1 my-0.5 text-sm ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        onClick={() => setSelectedTodo(isSelected ? null : todo.id)}
        onContextMenu={
          todo.completed
            ? (e) => {
                e.preventDefault()
                setMenuPos({ x: e.clientX, y: e.clientY })
              }
            : undefined
        }
      >
        <button
          {...attributes}
          {...listeners}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 shrink-0 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => {
            e.stopPropagation()
            todo.completed ? uncompleteTodo(todo.id) : completeTodo(todo.id)
          }}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 accent-blue-600 cursor-pointer"
        />
        <span
          className={`flex-1 truncate ${
            todo.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
          }`}
        >
          {todo.text}
        </span>
      </div>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={[{ label: 'Delete', onClick: () => setConfirmDelete(true), danger: true }]}
          onClose={() => setMenuPos(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${todo.text}"? This cannot be undone.`}
          onConfirm={() => {
            deleteTodo(todo.id)
            setConfirmDelete(false)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}

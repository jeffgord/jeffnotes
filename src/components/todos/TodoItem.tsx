import { useState, useRef } from 'react'
import { Circle, CircleCheck, Check } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store'
import ConfirmDialog from '../ui/ConfirmDialog'
import ContextMenu from '../ui/ContextMenu'
import type { Todo } from '../../types'

interface Props {
  todo: Todo
  isSelected: boolean
  projectArchived?: boolean
}

export default function TodoItem({ todo, isSelected, projectArchived = false }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)
  const { completeTodo, uncompleteTodo, deleteTodo, updateTodoText, setSelectedTodo } = useStore()

  const draggable = !todo.completed && !projectArchived && !isEditing

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id, disabled: !draggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  function startEditing() {
    setIsEditing(true)
    setTimeout(() => {
      if (!spanRef.current) return
      spanRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(spanRef.current)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }, 0)
  }

  function commitEdit() {
    const trimmed = spanRef.current?.textContent?.trim() ?? ''
    if (trimmed) updateTodoText(todo.id, trimmed)
    else if (spanRef.current) spanRef.current.textContent = todo.text
    setIsEditing(false)
  }

  const menuItems = todo.completed
    ? [
        { label: 'Rename', onClick: startEditing },
        { label: 'Mark incomplete', onClick: () => uncompleteTodo(todo.id) },
        { label: 'Delete', onClick: () => setConfirmDelete(true), danger: true as const },
      ]
    : [
        { label: 'Rename', onClick: startEditing },
        { label: 'Mark complete', onClick: () => completeTodo(todo.id) },
      ]

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        data-testid="todo-item"
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
        className={`flex items-center gap-1.5 px-2 py-1.5 select-none rounded mx-1 my-0.5 text-sm ${
          draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } ${
          isSelected
            ? 'bg-slate-300 dark:bg-slate-500/50 text-slate-900 dark:text-slate-100'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        onClick={() => { if (!isEditing) setSelectedTodo(isSelected ? null : todo.id) }}
        onContextMenu={
          projectArchived
            ? undefined
            : (e) => {
                e.preventDefault()
                setMenuPos({ x: e.clientX, y: e.clientY })
              }
        }
      >
        <button
          data-testid="todo-checkbox"
          onClick={
            projectArchived
              ? (e) => e.stopPropagation()
              : (e) => {
                  e.stopPropagation()
                  todo.completed ? uncompleteTodo(todo.id) : completeTodo(todo.id)
                }
          }
          className={`relative shrink-0 ${projectArchived ? 'cursor-not-allowed' : 'cursor-pointer group/circle'}`}
        >
          {todo.completed ? (
            <CircleCheck size={15} className="text-neutral-400 dark:text-neutral-500" />
          ) : (
            <>
              <Circle size={15} className="text-neutral-300 dark:text-neutral-600" />
              {!projectArchived && (
                <Check
                  size={9}
                  strokeWidth={3}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-200 dark:text-neutral-500 opacity-0 group-hover/circle:opacity-100 transition-opacity"
                />
              )}
            </>
          )}
        </button>
        <span
          ref={spanRef}
          data-testid={isEditing ? 'rename-input' : undefined}
          contentEditable={isEditing ? true : undefined}
          suppressContentEditableWarning
          className={`flex-1 truncate ${todo.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''} ${isEditing ? 'outline-none cursor-text' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (!isEditing) setSelectedTodo(todo.id) }}
          onDoubleClick={projectArchived ? undefined : (e) => { e.stopPropagation(); if (!isEditing) startEditing() }}
          onKeyDown={(e) => {
            if (!isEditing) return
            if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
            if (e.key === 'Escape') {
              if (spanRef.current) spanRef.current.textContent = todo.text
              setIsEditing(false)
            }
          }}
          onBlur={() => { if (isEditing) commitEdit() }}
        >
          {todo.text}
        </span>
      </div>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={menuItems}
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

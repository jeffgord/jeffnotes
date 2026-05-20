import { useState, useRef } from 'react'
import { GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store'
import ConfirmDialog from '../ui/ConfirmDialog'
import ContextMenu from '../ui/ContextMenu'
import type { Project } from '../../types'

interface Props {
  project: Project
  isSelected: boolean
}

export default function ProjectItem({ project, isSelected }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { archiveProject, unarchiveProject, deleteProject, updateProjectName, setSelectedProject } = useStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  }

  function startEditing() {
    setEditName(project.name)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commitEdit() {
    const trimmed = editName.trim()
    if (trimmed) updateProjectName(project.id, trimmed)
    setIsEditing(false)
  }

  const menuItems = project.archived
    ? [
        { label: 'Rename', onClick: startEditing },
        { label: 'Unarchive', onClick: () => unarchiveProject(project.id) },
        { label: 'Delete', onClick: () => setConfirmDelete(true), danger: true as const },
      ]
    : [
        { label: 'Rename', onClick: startEditing },
        { label: 'Archive', onClick: () => archiveProject(project.id) },
      ]

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        data-testid="project-item"
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer select-none rounded mx-1 my-0.5 text-sm ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        onClick={() => { if (!isEditing) setSelectedProject(isSelected ? null : project.id) }}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenuPos({ x: e.clientX, y: e.clientY })
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            onBlur={commitEdit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 text-sm px-1 py-0 rounded border border-blue-400 dark:border-blue-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none shadow-none"
          />
        ) : (
          <span
            className={`flex-1 truncate ${project.archived ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}
            onClick={(e) => { e.stopPropagation(); setSelectedProject(project.id) }}
            onDoubleClick={(e) => { e.stopPropagation(); startEditing() }}
          >
            {project.name}
          </span>
        )}
        {!project.archived && !isEditing && (
          <button
            {...attributes}
            {...listeners}
            className="text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400 shrink-0 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <GripVertical size={14} />
          </button>
        )}
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
          message={`Delete "${project.name}"? This will also delete all its todos. This cannot be undone.`}
          onConfirm={() => {
            deleteProject(project.id)
            setConfirmDelete(false)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}

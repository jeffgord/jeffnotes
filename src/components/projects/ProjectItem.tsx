import { useState, useRef } from 'react'
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
  const spanRef = useRef<HTMLSpanElement>(null)
  const { archiveProject, unarchiveProject, deleteProject, updateProjectName, setSelectedProject } = useStore()

  const draggable = !project.archived && !isEditing

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id, disabled: !draggable })

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
    if (trimmed) updateProjectName(project.id, trimmed)
    else if (spanRef.current) spanRef.current.textContent = project.name
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
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
        className={`flex items-center gap-1 px-2 py-1.5 select-none rounded mx-1 my-0.5 text-sm ${
          draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } ${
          isSelected
            ? 'bg-slate-300 dark:bg-slate-500/50 text-slate-900 dark:text-slate-100'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        onClick={() => { if (!isEditing) setSelectedProject(isSelected ? null : project.id) }}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenuPos({ x: e.clientX, y: e.clientY })
        }}
      >
        <span
          ref={spanRef}
          data-testid={isEditing ? 'rename-input' : undefined}
          contentEditable={isEditing ? true : undefined}
          suppressContentEditableWarning
          className={`flex-1 truncate ${project.archived ? 'line-through text-neutral-400 dark:text-neutral-500' : ''} ${isEditing ? 'outline-none cursor-text' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (!isEditing) setSelectedProject(project.id) }}
          onDoubleClick={(e) => { e.stopPropagation(); if (!isEditing) startEditing() }}
          onKeyDown={(e) => {
            if (!isEditing) return
            if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
            if (e.key === 'Escape') {
              if (spanRef.current) spanRef.current.textContent = project.name
              setIsEditing(false)
            }
          }}
          onBlur={() => { if (isEditing) commitEdit() }}
        >
          {project.name}
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

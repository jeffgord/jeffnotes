import { useState } from 'react'
import { GripVertical, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store'
import ConfirmDialog from '../ui/ConfirmDialog'
import type { Project } from '../../types'

interface Props {
  project: Project
  isSelected: boolean
}

export default function ProjectItem({ project, isSelected }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { archiveProject, unarchiveProject, deleteProject, setSelectedProject } =
    useStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

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
        data-testid="project-item"
        className={`group flex items-center gap-1 px-2 py-1.5 cursor-pointer select-none rounded mx-1 my-0.5 text-sm ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
        } ${project.archived ? 'opacity-60' : ''}`}
        onClick={() => setSelectedProject(isSelected ? null : project.id)}
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
        <span className="flex-1 truncate">{project.name}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title={project.archived ? 'Unarchive' : 'Archive'}
            onClick={(e) => {
              e.stopPropagation()
              project.archived
                ? unarchiveProject(project.id)
                : archiveProject(project.id)
            }}
            className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            {project.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          </button>
          <button
            title="Delete project"
            onClick={(e) => {
              e.stopPropagation()
              setConfirmDelete(true)
            }}
            className="p-0.5 rounded text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

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

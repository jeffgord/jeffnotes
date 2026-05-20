import { useState, useRef } from 'react'
import { Archive } from 'lucide-react'
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
import ProjectItem from './ProjectItem'

export default function ProjectsPanel() {
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    projects,
    selectedProjectId,
    hideArchivedProjects,
    addProject,
    reorderProjects,
    toggleHideArchived,
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
      reorderProjects(String(active.id), String(over.id))
    }
  }

  function handleSubmit() {
    const name = newName.trim()
    if (name) addProject(name)
    setNewName('')
    setAddingNew(false)
  }

  function startAdding() {
    setAddingNew(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const sorted = [...projects].sort((a, b) => a.order - b.order)
  const activeProjects = sorted.filter((p) => !p.archived)
  const archivedProjects = sorted.filter((p) => p.archived)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Projects
        </span>
        <div className="flex items-center gap-1">
          <button
            title={hideArchivedProjects ? 'Show archived' : 'Hide archived'}
            onClick={toggleHideArchived}
            className={`p-1 rounded transition-colors ${
              hideArchivedProjects
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <Archive size={14} />
          </button>
        </div>
      </div>

      <div
        data-testid="projects-list"
        className="flex-1 overflow-y-auto py-1"
        onDoubleClick={(e) => { if (e.target === e.currentTarget) startAdding() }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeProjects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {activeProjects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isSelected={project.id === selectedProjectId}
              />
            ))}
          </SortableContext>
        </DndContext>

        {!hideArchivedProjects && archivedProjects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isSelected={project.id === selectedProjectId}
          />
        ))}

        {activeProjects.length === 0 && archivedProjects.length === 0 && !addingNew && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 px-3 py-2">
            No projects yet
          </p>
        )}

        {addingNew && (
          <div className="px-2 py-1">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
                if (e.key === 'Escape') {
                  setNewName('')
                  setAddingNew(false)
                }
              }}
              onBlur={handleSubmit}
              placeholder="Project name…"
              className="w-full text-sm px-2 py-1 rounded border border-blue-400 dark:border-blue-500 bg-white dark:bg-neutral-800 outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}

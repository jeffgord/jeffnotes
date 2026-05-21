import { useState, useRef } from 'react'
import { Archive, Plus } from 'lucide-react'
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
  const addSpanRef = useRef<HTMLSpanElement>(null)

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
    const name = addSpanRef.current?.textContent?.trim() ?? ''
    if (name) addProject(name)
    setAddingNew(false)
  }

  function startAdding() {
    setAddingNew(true)
    setTimeout(() => addSpanRef.current?.focus(), 0)
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
            className={`p-1 rounded transition-colors cursor-pointer ${
              hideArchivedProjects
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <Archive size={14} />
          </button>
          <button
            title="Add project"
            onClick={startAdding}
            className="p-1 rounded transition-colors cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div
        data-testid="projects-list"
        className="flex-1 overflow-y-auto py-1 select-none"
        onDoubleClick={(e) => { if (e.target === e.currentTarget) startAdding() }}
      >
        {addingNew && (
          <div className="flex items-center gap-1 px-2 py-1.5 rounded mx-1 my-0.5 text-sm">
            <span
              ref={addSpanRef}
              data-testid="add-input"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Project name…"
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
          <p
            className="text-xs text-neutral-400 dark:text-neutral-500 px-3 py-2 cursor-default select-none"
            onDoubleClick={startAdding}
          >
            No projects yet
          </p>
        )}
      </div>
    </div>
  )
}

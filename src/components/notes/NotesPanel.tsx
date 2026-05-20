import { useStore } from '../../store'

export default function NotesPanel() {
  const {
    projects,
    todos,
    selectedProjectId,
    selectedTodoId,
    updateProjectNotes,
    updateTodoNotes,
  } = useStore()

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedTodo = todos.find((t) => t.id === selectedTodoId)

  return (
    <div className="flex flex-col h-full">
      {/* Project notes */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center px-3 py-[11px] border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Project Notes
          </span>
        </div>
        <textarea
          value={selectedProject?.notes ?? ''}
          onChange={(e) =>
            selectedProject && updateProjectNotes(selectedProject.id, e.target.value)
          }
          disabled={!selectedProject || selectedProject.archived}
          placeholder={selectedProject ? 'Notes for this project…' : 'Select a project…'}
          className="flex-1 w-full resize-none p-3 text-sm bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 disabled:cursor-not-allowed"
        />
      </div>

      <div className="border-t-2 border-slate-400 dark:border-slate-600" />

      {/* Todo notes */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center px-3 py-[11px] border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Todo Notes
          </span>
        </div>
        <textarea
          value={selectedTodo?.notes ?? ''}
          onChange={(e) =>
            selectedTodo && updateTodoNotes(selectedTodo.id, e.target.value)
          }
          disabled={!selectedTodo || selectedProject?.archived}
          placeholder={selectedTodo ? 'Notes for this todo…' : 'Select a todo…'}
          className="flex-1 w-full resize-none p-3 text-sm bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}

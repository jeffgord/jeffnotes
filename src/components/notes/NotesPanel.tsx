import { Panel, Group, Separator } from 'react-resizable-panels'
import { useStore } from '../../store'

const handleClass = 'bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 transition-colors'

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
    <div className="relative h-full">
    <Group orientation="vertical" style={{ position: 'absolute', inset: 0 }}>
      <Panel defaultSize="50%" minSize="15%">
        <div className="h-full flex flex-col overflow-hidden">
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
      </Panel>
      <Separator className={`h-[2px] cursor-row-resize ${handleClass}`} />
      <Panel defaultSize="50%" minSize="15%">
        <div className="h-full flex flex-col overflow-hidden">
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
      </Panel>
    </Group>
    </div>
  )
}

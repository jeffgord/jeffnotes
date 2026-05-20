import { Sun, Moon, Monitor, Download, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useStore } from '../store'
import { exportStateToJson, importStateFromJson, downloadJson } from '../utils/stateIO'
import type { Theme } from '../types'

export default function Header() {
  const { theme, setTheme, loadState, ...state } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const json = exportStateToJson({
      projects: state.projects,
      todos: state.todos,
      selectedProjectId: state.selectedProjectId,
      selectedTodoId: state.selectedTodoId,
      theme,
      hideArchivedProjects: state.hideArchivedProjects,
      hideCompletedTodos: state.hideCompletedTodos,
    })
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(json, `jeffnotes-backup-${date}.json`)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = importStateFromJson(ev.target?.result as string)
        loadState(parsed)
      } catch (err) {
        alert(`Failed to import: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const themeIcons: Record<Theme, React.ReactNode> = {
    light: <Sun size={16} />,
    dark: <Moon size={16} />,
    system: <Monitor size={16} />,
  }

  const nextTheme: Record<Theme, Theme> = {
    system: 'light',
    light: 'dark',
    dark: 'system',
  }

  const themeLabels: Record<Theme, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-neutral-900 shrink-0">
      <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        jeffnotes
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          title="Export state"
          className="flex items-center gap-1 px-2 py-1 text-xs rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Download size={14} />
          Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import state"
          className="flex items-center gap-1 px-2 py-1 text-xs rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Upload size={14} />
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <button
          onClick={() => setTheme(nextTheme[theme])}
          title={`Theme: ${themeLabels[theme]}`}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {themeIcons[theme]}
          <span className="inline-block w-[38px]">{themeLabels[theme]}</span>
        </button>
      </div>
    </header>
  )
}

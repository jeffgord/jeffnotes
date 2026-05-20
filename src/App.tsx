import { useEffect } from 'react'
import { useStore } from './store'
import Header from './components/Header'
import ProjectsPanel from './components/projects/ProjectsPanel'
import TodosPanel from './components/todos/TodosPanel'
import NotesPanel from './components/notes/NotesPanel'

export default function App() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    const apply = (dark: boolean) =>
      document.documentElement.classList.toggle('dark', dark)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    apply(theme === 'dark')
  }, [theme])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[220px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden">
          <ProjectsPanel />
        </div>
        <div className="w-[280px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden">
          <TodosPanel />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <NotesPanel />
        </div>
      </div>
    </div>
  )
}

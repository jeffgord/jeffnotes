import { useEffect } from 'react'
import { Panel, Group, Separator } from 'react-resizable-panels'
import { useStore } from './store'
import Header from './components/Header'
import ProjectsPanel from './components/projects/ProjectsPanel'
import TodosPanel from './components/todos/TodosPanel'
import NotesPanel from './components/notes/NotesPanel'

const handleClass = 'bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 transition-colors'

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
      <div className="flex-1 relative">
        <Group orientation="horizontal" style={{ position: 'absolute', inset: 0 }}>
          <Panel defaultSize="20%" minSize="10%">
            <div className="h-full flex flex-col overflow-hidden">
              <ProjectsPanel />
            </div>
          </Panel>
          <Separator className={`w-[2px] cursor-col-resize ${handleClass}`} />
          <Panel defaultSize="20%" minSize="12%">
            <div className="h-full flex flex-col overflow-hidden">
              <TodosPanel />
            </div>
          </Panel>
          <Separator className={`w-[2px] cursor-col-resize ${handleClass}`} />
          <Panel minSize="20%">
            <div className="h-full flex flex-col overflow-hidden">
              <NotesPanel />
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  )
}

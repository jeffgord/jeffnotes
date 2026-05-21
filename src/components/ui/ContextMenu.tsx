import { useEffect, useRef } from 'react'

export interface MenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

interface Props {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      data-testid="context-menu"
      style={{ top: y, left: x }}
      className="fixed z-50 bg-white dark:bg-neutral-900 border border-slate-400 dark:border-slate-600 rounded shadow-md py-1 w-36"
    >
      {items.map((item) => (
        <button
          key={item.label}
          title={item.label}
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className={`w-full text-left px-3 py-1 text-xs transition-colors cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
            item.danger
              ? 'text-red-500 dark:text-red-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

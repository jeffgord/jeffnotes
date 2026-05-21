interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-5 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-neutral-800 dark:text-neutral-200 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            title="Cancel"
            className="px-3 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            data-testid="confirm-delete-btn"
            onClick={onConfirm}
            title="Delete forever"
            className="px-3 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

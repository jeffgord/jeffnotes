# jeffnotes

Personal todo/notes web app. Three-panel layout: Projects | Todos | Notes. All data stored in localStorage with JSON import/export. Deployed to GitHub Pages.

## Commands

```bash
npm run dev          # start dev server at localhost:5173/jeffnotes/
npm run build        # TypeScript check + Vite production build
npm test             # run Vitest unit tests
npm run test:e2e     # run Playwright e2e tests (starts dev server automatically)
npm run deploy       # build + push to gh-pages branch
```

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React 19 + TypeScript | ^19 | UI framework |
| Vite 6 | ^6 | Build tool |
| TailwindCSS v4 | ^4 | Styling (class-based dark mode via `@custom-variant`) |
| Zustand 5 | ^5 | State management + localStorage persistence |
| @dnd-kit | ^6/8 | Drag-to-reorder for projects and todos |
| Lucide React | ^0.5 | Icons |
| nanoid | ^5 | ID generation |
| Vitest | ^3 | Unit tests |
| Playwright | ^1.52 | E2e tests |

## Architecture

```
src/
  types/index.ts          — Project, Todo, Theme, PersistedState interfaces
  store/
    index.ts              — Zustand store (wraps buildStoreState with persist middleware)
    testExports.ts        — AppStore type + buildStoreState (shared with unit tests)
  utils/stateIO.ts        — exportStateToJson, importStateFromJson, downloadJson
  components/
    Header.tsx            — App title, theme toggle, import/export buttons
    projects/
      ProjectsPanel.tsx   — DndContext + SortableContext list, add form (dbl-click), archive toggle
      ProjectItem.tsx     — Sortable row: drag handle, select, right-click context menu
    todos/
      TodosPanel.tsx      — DndContext list, add form (dbl-click), completed toggle
      TodoItem.tsx        — Sortable row: drag handle, checkbox, right-click context menu (completed only)
    notes/
      NotesPanel.tsx      — Two textareas: project notes (top) + todo notes (bottom)
    ui/
      ConfirmDialog.tsx   — Reusable modal confirmation (data-testid="confirm-delete-btn")
      ContextMenu.tsx     — Right-click context menu (data-testid="context-menu")
tests/
  unit/
    store.test.ts         — All store actions via in-memory stores (no persist middleware)
    stateIO.test.ts       — Export/import round-trip and error cases
  e2e/
    projects.spec.ts      — Create, archive, unarchive, delete with confirmation
    todos.spec.ts         — Add, complete, uncomplete, delete with confirmation
    notes.spec.ts         — Project notes persistence, per-todo note isolation
```

## Data Model

```typescript
interface Project { id, name, order, archived, notes, createdAt }
interface Todo    { id, projectId, text, order, completed, notes, createdAt }
```

State also holds: `selectedProjectId`, `selectedTodoId`, `theme` ('light'|'dark'|'system'), `showArchivedProjects`, `showCompletedTodos`.

## Theme

Dark mode applied by toggling the `.dark` class on `<html>` in `App.tsx`. TailwindCSS is configured with `@custom-variant dark (&:is(.dark, .dark *))` in `src/index.css`. Theme cycles: System → Light → Dark → System.

## GitHub Pages

- `vite.config.ts` sets `base: '/jeffnotes/'`
- GitHub Actions workflow at `.github/workflows/deploy.yml` deploys on push to `main`
- Manual deploy: `npm run deploy`

## Maintenance Notes

- **Keep this file updated** whenever you add/remove features, change the stack, or modify test commands.
- **Write or update tests** whenever you change store actions or add new UI flows — do this proactively without waiting to be asked. Unit tests live in `tests/unit/`, e2e in `tests/e2e/`. Every new user interaction (click, double-click, keyboard shortcut, etc.) needs an e2e test.
- Unit tests create fresh in-memory stores via `buildStoreState` from `src/store/testExports.ts` — no localStorage involved.
- E2e tests call `localStorage.clear()` + `page.reload()` in `beforeEach` for isolation.
- E2e test files use local `addProject`/`addTodo` helpers that dblclick near the bottom of the list area (`data-testid="projects-list"` / `"todos-list"`) to avoid hitting existing items.
- Item actions (archive/unarchive/delete) are triggered via right-click context menu — use `click({ button: 'right' })` + `getByTestId('context-menu').getByText(...)` in tests.
- Tailwind v4 uses `@tailwindcss/vite` plugin (not PostCSS). No `tailwind.config.js` needed.

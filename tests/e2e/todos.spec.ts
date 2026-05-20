import { test, expect, type Page } from '@playwright/test'

async function addProject(page: Page, name: string) {
  const list = page.getByTestId('projects-list')
  const box = await list.boundingBox()
  await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height - 20)
  await page.getByPlaceholder('Project name…').fill(name)
  await page.keyboard.press('Enter')
}

async function addTodo(page: Page, text: string) {
  const list = page.getByTestId('todos-list')
  const box = await list.boundingBox()
  await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height - 20)
  await page.getByPlaceholder('New todo…').fill(text)
  await page.keyboard.press('Enter')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await addProject(page, 'My Project')
  await page.getByText('My Project').click()
})

test('shows prompt when no project selected', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByText('Select a project to view todos')).toBeVisible()
})

test('adds a todo', async ({ page }) => {
  await addTodo(page, 'Fix bug')
  await expect(page.getByText('Fix bug')).toBeVisible()
})

test('completes and uncompletes a todo', async ({ page }) => {
  await addTodo(page, 'Task')

  // Complete — todo disappears from default (active) view
  await page.getByTestId('todo-item').getByTestId('todo-checkbox').click()
  await expect(page.getByText('Task')).not.toBeVisible()

  // Show completed — now shows ONLY completed todos
  await page.getByTitle('Show completed').click()
  await expect(page.getByText('Task')).toBeVisible()

  // Uncomplete — todo disappears from completed-only view
  await page.getByTestId('todo-item').getByTestId('todo-checkbox').click()
  await expect(page.getByText('Task')).not.toBeVisible()

  // Back to active view — todo is visible again
  await page.getByTitle('Hide completed').click()
  await expect(page.getByText('Task')).toBeVisible()
})

test('double-click on empty space opens add input', async ({ page }) => {
  await page.getByTestId('todos-list').dblclick()
  await expect(page.getByPlaceholder('New todo…')).toBeVisible()

  await page.getByPlaceholder('New todo…').fill('Dbl todo')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Dbl todo')).toBeVisible()
})

test('deletes a todo with confirmation', async ({ page }) => {
  await addTodo(page, 'Temp todo')

  // Must complete first — delete is only available on completed todos
  await page.getByTestId('todo-item').getByTestId('todo-checkbox').click()

  // Show completed to access the todo
  await page.getByTitle('Show completed').click()

  // Cancel — todo stays
  await page.getByTestId('todo-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Delete').click()
  await expect(page.getByText(/cannot be undone/i)).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByTestId('todo-item')).toHaveCount(1)

  // Delete for real
  await page.getByTestId('todo-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Delete').click()
  await page.getByTestId('confirm-delete-btn').click()
  await expect(page.getByTestId('todo-item')).toHaveCount(0)
})

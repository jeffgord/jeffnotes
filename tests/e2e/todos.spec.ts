import { test, expect, type Page } from '@playwright/test'

async function addProject(page: Page, name: string) {
  const list = page.getByTestId('projects-list')
  const box = await list.boundingBox()
  await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height - 20)
  await page.getByTestId('add-input').fill(name)
  await page.keyboard.press('Enter')
}

async function addTodo(page: Page, text: string) {
  const list = page.getByTestId('todos-list')
  const box = await list.boundingBox()
  await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height - 20)
  await page.getByTestId('add-input').fill(text)
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

  // Complete — todo stays visible at bottom with strikethrough
  await page.getByTestId('todo-item').getByTestId('todo-checkbox').click()
  await expect(page.getByText('Task')).toBeVisible()

  // Hide completed — todo disappears
  await page.getByTitle('Hide completed').click()
  await expect(page.getByText('Task')).not.toBeVisible()

  // Show completed again
  await page.getByTitle('Show completed').click()
  await expect(page.getByText('Task')).toBeVisible()

  // Uncomplete — moves back to active section
  await page.getByTestId('todo-item').getByTestId('todo-checkbox').click()

  // Now hiding completed still shows it (no longer completed)
  await page.getByTitle('Hide completed').click()
  await expect(page.getByText('Task')).toBeVisible()
})

test('completes and incompletes a todo via context menu', async ({ page }) => {
  await addTodo(page, 'Task')

  await page.getByTestId('todo-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Mark complete').click()
  await expect(page.getByText('Task')).toBeVisible()

  await page.getByTestId('todo-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Mark incomplete').click()
  await expect(page.getByText('Task')).toBeVisible()
})

test('double-click on empty space opens add input', async ({ page }) => {
  await page.getByTestId('todos-list').dblclick()
  await expect(page.getByTestId('add-input')).toBeVisible()

  await page.getByTestId('add-input').fill('Dbl todo')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Dbl todo')).toBeVisible()
})

test('renames a todo via double-click', async ({ page }) => {
  await addTodo(page, 'Old Task')
  await page.getByTestId('todo-item').getByText('Old Task').dblclick()
  await page.getByTestId('rename-input').fill('New Task')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('todo-item').getByText('New Task')).toBeVisible()
  await expect(page.getByTestId('todo-item').getByText('Old Task')).not.toBeVisible()
})

test('renames a todo via context menu', async ({ page }) => {
  await addTodo(page, 'Old Task')
  await page.getByTestId('todo-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Rename').click()
  await page.getByTestId('rename-input').fill('New Task')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('todo-item').getByText('New Task')).toBeVisible()
  await expect(page.getByTestId('todo-item').getByText('Old Task')).not.toBeVisible()
})

test('deletes a todo with confirmation', async ({ page }) => {
  await addTodo(page, 'Temp todo')

  // Must complete first — delete is only available on completed todos
  await page.getByTestId('todo-item').getByTestId('todo-checkbox').click()

  // Todo is still visible (completed shown by default)
  await expect(page.getByTestId('todo-item')).toHaveCount(1)

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

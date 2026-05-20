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
})

test('project notes textarea is disabled when no project selected', async ({ page }) => {
  const projectNotes = page.locator('textarea').first()
  await expect(projectNotes).toBeDisabled()
})

test('project notes persist across todo selections', async ({ page }) => {
  await addProject(page, 'Work')
  await page.getByText('Work').click()

  const projectNotes = page.locator('textarea').first()
  await projectNotes.fill('These are project notes')

  await addTodo(page, 'Todo A')
  await addTodo(page, 'Todo B')

  await page.getByText('Todo A').click()
  await expect(page.locator('textarea').first()).toHaveValue('These are project notes')

  await page.getByText('Todo B').click()
  await expect(page.locator('textarea').first()).toHaveValue('These are project notes')
})

test('todo notes are per-todo', async ({ page }) => {
  await addProject(page, 'Work')
  await page.getByText('Work').click()

  await addTodo(page, 'Todo A')
  await addTodo(page, 'Todo B')

  // Write notes for Todo A
  await page.getByTestId('todo-item').filter({ hasText: 'Todo A' }).click()
  const todoNotes = page.locator('textarea').last()
  await todoNotes.fill('Notes for A')

  // Switch to Todo B — notes should be empty
  await page.getByTestId('todo-item').filter({ hasText: 'Todo B' }).click()
  await expect(page.locator('textarea').last()).toHaveValue('')

  // Switch back to Todo A — notes should be preserved
  await page.getByTestId('todo-item').filter({ hasText: 'Todo A' }).click()
  await expect(page.locator('textarea').last()).toHaveValue('Notes for A')
})

test('todo notes textarea is disabled when no todo selected', async ({ page }) => {
  await addProject(page, 'Work')
  await page.getByText('Work').click()

  const todoNotes = page.locator('textarea').last()
  await expect(todoNotes).toBeDisabled()
})

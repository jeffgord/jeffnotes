import { test, expect } from '@playwright/test'

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
  // Create project + select it
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Work')
  await page.keyboard.press('Enter')
  await page.getByText('Work').click()

  // Type project notes
  const projectNotes = page.locator('textarea').first()
  await projectNotes.fill('These are project notes')

  // Add two todos and switch between them
  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Todo A')
  await page.keyboard.press('Enter')
  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Todo B')
  await page.keyboard.press('Enter')

  await page.getByText('Todo A').click()
  await expect(page.locator('textarea').first()).toHaveValue('These are project notes')

  await page.getByText('Todo B').click()
  await expect(page.locator('textarea').first()).toHaveValue('These are project notes')
})

test('todo notes are per-todo', async ({ page }) => {
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Work')
  await page.keyboard.press('Enter')
  await page.getByText('Work').click()

  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Todo A')
  await page.keyboard.press('Enter')
  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Todo B')
  await page.keyboard.press('Enter')

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
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Work')
  await page.keyboard.press('Enter')
  await page.getByText('Work').click()

  const todoNotes = page.locator('textarea').last()
  await expect(todoNotes).toBeDisabled()
})

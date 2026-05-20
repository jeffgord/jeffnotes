import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  // Create a project to work with
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('My Project')
  await page.keyboard.press('Enter')
  await page.getByText('My Project').click()
})

test('shows prompt when no project selected', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByText('Select a project to view todos')).toBeVisible()
})

test('adds a todo', async ({ page }) => {
  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Fix bug')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Fix bug')).toBeVisible()
})

test('completes and uncompletes a todo', async ({ page }) => {
  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Task')
  await page.keyboard.press('Enter')

  // Click the checkbox (use click not check — item disappears after completing)
  await page.getByTestId('todo-item').getByRole('checkbox').click()

  // Todo disappears (completed hidden by default)
  await expect(page.getByText('Task')).not.toBeVisible()

  // Show completed
  await page.getByTitle('Show completed').click()
  await expect(page.getByText('Task')).toBeVisible()

  // Uncheck
  await page.getByTestId('todo-item').getByRole('checkbox').click()
  await expect(page.getByText('Task')).toBeVisible()
})

test('double-click on empty space opens add input', async ({ page }) => {
  // The todos panel is the second .flex-1.overflow-y-auto column
  await page.locator('.flex-1.overflow-y-auto').nth(1).dblclick()
  await expect(page.getByPlaceholder('New todo…')).toBeVisible()

  await page.getByPlaceholder('New todo…').fill('Dbl todo')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Dbl todo')).toBeVisible()
})

test('deletes a todo with confirmation', async ({ page }) => {
  await page.getByTitle('Add todo').click()
  await page.getByPlaceholder('New todo…').fill('Temp todo')
  await page.keyboard.press('Enter')

  await page.getByTestId('todo-item').hover()
  await page.getByTitle('Delete todo').click()

  // Confirmation
  await expect(page.getByText(/cannot be undone/i)).toBeVisible()

  // Cancel
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByText('Temp todo')).toBeVisible()

  // Delete
  await page.getByTestId('todo-item').hover()
  await page.getByTitle('Delete todo').click()
  await page.getByTestId('confirm-delete-btn').click()
  await expect(page.getByText('Temp todo')).not.toBeVisible()
})

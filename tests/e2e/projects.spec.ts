import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Clear localStorage before each test for isolation
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('shows empty state on load', async ({ page }) => {
  await expect(page.getByText('No projects yet')).toBeVisible()
})

test('adds a project', async ({ page }) => {
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Work')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Work')).toBeVisible()
})

test('selects a project', async ({ page }) => {
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Work')
  await page.keyboard.press('Enter')
  await page.getByText('Work').click()
  // Todos panel should show project name header
  await expect(page.locator('.w-\\[280px\\]').getByText('Work')).toBeVisible()
})

test('archives and unarchives a project', async ({ page }) => {
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Work')
  await page.keyboard.press('Enter')

  // Archive the project
  await page.getByTestId('project-item').hover()
  await page.getByTitle('Archive', { exact: true }).click()

  // Project disappears (archived hidden by default)
  await expect(page.getByText('Work')).not.toBeVisible()

  // Show archived
  await page.getByTitle('Show archived').click()
  await expect(page.getByText('Work')).toBeVisible()

  // Unarchive
  await page.getByTestId('project-item').hover()
  await page.getByTitle('Unarchive', { exact: true }).click()

  // Hide archived again — project still visible (not archived anymore)
  await page.getByTitle('Hide archived').click()
  await expect(page.getByText('Work')).toBeVisible()
})

test('double-click on empty space opens add input', async ({ page }) => {
  await page.locator('.flex-1.overflow-y-auto').first().dblclick()
  await expect(page.getByPlaceholder('Project name…')).toBeVisible()

  await page.getByPlaceholder('Project name…').fill('Dbl')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Dbl')).toBeVisible()
})

test('deletes a project with confirmation', async ({ page }) => {
  await page.getByTitle('Add project').click()
  await page.getByPlaceholder('Project name…').fill('Temp')
  await page.keyboard.press('Enter')

  await page.getByTestId('project-item').hover()
  await page.getByTitle('Delete project').click()

  // Confirmation dialog should appear
  await expect(page.getByText(/cannot be undone/i)).toBeVisible()

  // Cancel — project stays
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByTestId('project-item')).toHaveCount(1)

  // Delete for real
  await page.getByTestId('project-item').hover()
  await page.getByTitle('Delete project').click()
  await page.getByTestId('confirm-delete-btn').click()
  await expect(page.getByTestId('project-item')).toHaveCount(0)
})

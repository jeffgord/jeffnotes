import { test, expect, type Page } from '@playwright/test'

async function addProject(page: Page, name: string) {
  const list = page.getByTestId('projects-list')
  const box = await list.boundingBox()
  await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height - 20)
  await page.getByPlaceholder('Project name…').fill(name)
  await page.keyboard.press('Enter')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('shows empty state on load', async ({ page }) => {
  await expect(page.getByText('No projects yet')).toBeVisible()
})

test('adds a project', async ({ page }) => {
  await addProject(page, 'Work')
  await expect(page.getByText('Work')).toBeVisible()
})

test('selects a project', async ({ page }) => {
  await addProject(page, 'Work')
  await page.getByText('Work').click()
  await expect(page.locator('.w-\\[280px\\]').getByText('Work')).toBeVisible()
})

test('archives and unarchives a project', async ({ page }) => {
  await addProject(page, 'Work')

  // Archive via context menu — project stays visible at bottom with strikethrough
  await page.getByTestId('project-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Archive').click()
  await expect(page.getByText('Work')).toBeVisible()

  // Hide archived — project disappears
  await page.getByTitle('Hide archived').click()
  await expect(page.getByText('Work')).not.toBeVisible()

  // Show archived again
  await page.getByTitle('Show archived').click()
  await expect(page.getByText('Work')).toBeVisible()

  // Unarchive via context menu
  await page.getByTestId('project-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Unarchive').click()

  // Now hiding archived still shows it (it's no longer archived)
  await page.getByTitle('Hide archived').click()
  await expect(page.getByText('Work')).toBeVisible()
})

test('double-click on empty space opens add input', async ({ page }) => {
  await page.getByTestId('projects-list').dblclick()
  await expect(page.getByPlaceholder('Project name…')).toBeVisible()

  await page.getByPlaceholder('Project name…').fill('Dbl')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Dbl')).toBeVisible()
})

test('renames a project via double-click', async ({ page }) => {
  await addProject(page, 'Old Name')
  await page.getByTestId('project-item').getByText('Old Name').dblclick()
  await page.locator('input[value="Old Name"]').fill('New Name')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('project-item').getByText('New Name')).toBeVisible()
  await expect(page.getByTestId('project-item').getByText('Old Name')).not.toBeVisible()
})

test('renames a project via context menu', async ({ page }) => {
  await addProject(page, 'Old Name')
  await page.getByTestId('project-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Rename').click()
  await page.locator('input[value="Old Name"]').fill('New Name')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('project-item').getByText('New Name')).toBeVisible()
  await expect(page.getByTestId('project-item').getByText('Old Name')).not.toBeVisible()
})

test('deletes a project with confirmation', async ({ page }) => {
  await addProject(page, 'Temp')

  // Must archive first — delete is only available on archived projects
  await page.getByTestId('project-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Archive').click()

  // Project is still visible (archived shown by default)
  await expect(page.getByTestId('project-item')).toHaveCount(1)

  // Cancel — project stays
  await page.getByTestId('project-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Delete').click()
  await expect(page.getByText(/cannot be undone/i)).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByTestId('project-item')).toHaveCount(1)

  // Delete for real
  await page.getByTestId('project-item').click({ button: 'right' })
  await page.getByTestId('context-menu').getByText('Delete').click()
  await page.getByTestId('confirm-delete-btn').click()
  await expect(page.getByTestId('project-item')).toHaveCount(0)
})

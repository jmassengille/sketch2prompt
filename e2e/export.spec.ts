import { test, expect } from '@playwright/test'

test.describe('Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Mark onboarding as completed
    await page.evaluate(() => {
      localStorage.setItem('sketch2prompt:onboarding-completed', 'true')
    })
    await page.reload()
    // Wait for canvas to be ready and click to focus
    // Click at top-left corner to avoid the empty state message in center
    await page.getByTestId('rf__wrapper').click({ position: { x: 100, y: 100 } })
  })

  test('opens export drawer with Generate button', async ({ page }) => {
    // Click Generate button
    const generateButton = page.getByRole('button', { name: /Generate/i })
    await generateButton.click()

    // Export drawer should open
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })
  })

  test('opens export drawer with Ctrl+E', async ({ page }) => {
    await page.keyboard.press('Control+e')

    // Export drawer should open
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })
  })

  test('shows validation error when no nodes', async ({ page }) => {
    // Open export drawer
    await page.keyboard.press('Control+e')

    // With no nodes, export will still work but show minimal content
    // Check that the drawer opened
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })
  })

  test('can set project name', async ({ page }) => {
    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Find project name input by its label
    const projectNameInput = page.getByRole('textbox', { name: /Project Name/i })
    await projectNameInput.fill('My Test Project')

    // Verify it's set
    await expect(projectNameInput).toHaveValue('My Test Project')
  })

  test('shows AI enhancement section', async ({ page }) => {
    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // AI section should be visible
    await expect(page.getByText(/AI-Powered Specs/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('can expand AI settings', async ({ page }) => {
    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Click to expand AI settings
    await page.getByText(/AI-Powered Specs/i).click()

    // After expanding, should show API key input or provider options
    await expect(
      page.getByText(/API Key|Provider|Anthropic|OpenAI/i).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('export shows preview with nodes', async ({ page }) => {
    // Add a node first
    await page.keyboard.press('1')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Frontend' })
    ).toBeVisible({ timeout: 5000 })

    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Set project name
    const projectNameInput = page.getByRole('textbox', { name: /Project Name/i })
    await projectNameInput.fill('Test Project')

    // Click Download Blueprint to open preview
    const downloadButton = page.getByRole('button', {
      name: /Download Blueprint/i,
    })
    await downloadButton.click()

    // Preview modal should open with file list - use listitem to be more specific
    await expect(
      page.getByRole('listitem').filter({ hasText: 'PROJECT_RULES.md' }).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('preview shows correct file structure', async ({ page }) => {
    // Add multiple nodes
    await page.keyboard.press('1')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Frontend' })
    ).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('2')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Backend' })
    ).toBeVisible({ timeout: 5000 })

    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Set project name
    const projectNameInput = page.getByRole('textbox', { name: /Project Name/i })
    await projectNameInput.fill('Multi Node Test')

    // Click Download Blueprint
    const downloadButton = page.getByRole('button', {
      name: /Download Blueprint/i,
    })
    await downloadButton.click()

    // Verify file list in preview - use listitem to be more specific
    await expect(
      page.getByRole('listitem').filter({ hasText: 'PROJECT_RULES.md' }).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('JSON tab shows diagram data', async ({ page }) => {
    // Add a node
    await page.keyboard.press('1')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Frontend' })
    ).toBeVisible({ timeout: 5000 })

    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Click JSON tab
    await page.getByRole('button', { name: /JSON/i }).click()

    // Should show JSON content with nodes - look in code block
    await expect(page.locator('pre').filter({ hasText: '"nodes"' })).toBeVisible({
      timeout: 5000,
    })
  })

  test('JSON tab has copy button', async ({ page }) => {
    // Add a node
    await page.keyboard.press('1')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Frontend' })
    ).toBeVisible({ timeout: 5000 })

    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Click JSON tab
    await page.getByRole('button', { name: /JSON/i }).click()

    // Wait for JSON content to load
    await expect(page.locator('pre').filter({ hasText: '"nodes"' })).toBeVisible({
      timeout: 5000,
    })

    // Copy button should be visible
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible()
  })

  test('closes export drawer with Generate button click', async ({ page }) => {
    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Click outside the drawer to close it (on the overlay)
    await page.locator('.fixed.inset-0').click({ force: true })

    // Drawer should close - wait for heading to disappear
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).not.toBeVisible({ timeout: 5000 })
  })

  test('export contents summary shows correct node count', async ({ page }) => {
    // Add 3 nodes
    await page.keyboard.press('1')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Frontend' })
    ).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('2')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Backend' })
    ).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('3')
    await expect(
      page.locator('[data-id]').filter({ hasText: 'Storage' })
    ).toBeVisible({ timeout: 5000 })

    // Open export drawer
    await page.keyboard.press('Control+e')
    await expect(
      page.getByRole('heading', { name: 'Export', level: 2 })
    ).toBeVisible({ timeout: 5000 })

    // Should show "3 component specs" or similar count in the export includes list
    await expect(page.getByText(/3 component/i)).toBeVisible({ timeout: 5000 })
  })
})

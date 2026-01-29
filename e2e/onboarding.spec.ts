import { test, expect } from '@playwright/test'

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  test('shows Quick Start button on empty canvas', async ({ page }) => {
    await page.goto('/')

    // Wait for the Quick Start button to appear
    const quickStartButton = page.getByRole('button', { name: /Quick Start/i })
    await expect(quickStartButton).toBeVisible({ timeout: 5000 })
  })

  test('opens onboarding wizard when Quick Start is clicked', async ({ page }) => {
    await page.goto('/')

    // Click Quick Start
    const quickStartButton = page.getByRole('button', { name: /Quick Start/i })
    await quickStartButton.click()

    // Verify wizard opens - look for the first step content
    await expect(
      page.getByRole('heading', { name: /What are you building/i })
    ).toBeVisible({ timeout: 5000 })
  })

  test('completes full onboarding flow', async ({ page }) => {
    await page.goto('/')

    // Start onboarding
    const quickStartButton = page.getByRole('button', { name: /Quick Start/i })
    await quickStartButton.click()

    // Step 1: Platform selection - select Web Application
    await expect(
      page.getByRole('heading', { name: /What are you building/i })
    ).toBeVisible()
    await page.getByRole('button', { name: /Web Application/i }).click()

    // Click Continue
    const continueButton = page.getByRole('button', { name: /Continue/i })
    await continueButton.click()

    // Step 2: Pattern selection - select CRUD / Dashboard
    await expect(
      page.getByRole('heading', { name: /What's the primary pattern/i })
    ).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /CRUD/i }).first().click()
    await continueButton.click()

    // Step 3: Stack selection - select TypeScript and React
    await expect(
      page.getByRole('heading', { name: /Build your stack/i })
    ).toBeVisible({ timeout: 5000 })
    // Select frontend TypeScript
    await page.getByRole('button', { name: 'TypeScript' }).first().click()
    // Select React (Vite)
    await page.getByRole('button', { name: /React/i }).click()
    // Select backend TypeScript
    await page.getByRole('button', { name: 'TypeScript' }).nth(1).click()
    // Select Express
    await page.getByRole('button', { name: /Express/i }).click()
    await continueButton.click()

    // Step 4: Capabilities - just continue with defaults
    await expect(
      page.getByRole('heading', { name: /What capabilities do you need/i })
    ).toBeVisible({ timeout: 5000 })
    await continueButton.click()

    // Step 5: Project name and out of scope
    await expect(
      page.getByRole('heading', { name: /Name your project/i })
    ).toBeVisible({ timeout: 5000 })

    // Enter project name
    const projectNameInput = page.getByRole('textbox')
    await projectNameInput.fill('E2E Test Project')

    // Click Start Building
    const startBuildingButton = page.getByRole('button', {
      name: /Start Building/i,
    })
    await startBuildingButton.click()

    // Verify nodes are created on canvas
    // Nodes have data-id attribute in React Flow
    await expect(
      page.locator('[data-id]').filter({ hasText: /Frontend|Backend|Storage/i }).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('can skip onboarding with Skip button', async ({ page }) => {
    await page.goto('/')

    // Start onboarding
    const quickStartButton = page.getByRole('button', { name: /Quick Start/i })
    await quickStartButton.click()

    // Verify wizard is open
    await expect(
      page.getByRole('heading', { name: /What are you building/i })
    ).toBeVisible()

    // Click Skip button
    await page.getByRole('button', { name: /Skip/i }).click()

    // Verify wizard is closed (Quick Start should be visible again)
    await expect(
      page.getByRole('button', { name: /Quick Start/i })
    ).toBeVisible({ timeout: 5000 })
  })
})

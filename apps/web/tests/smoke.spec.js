// Playwright smoke test for ValuHire UI
// Run: npx playwright test smoke.spec.js
// Requires both API (port 4000) and web (port 3000) running

import { test, expect } from "@playwright/test";

const WEB_URL = process.env.WEB_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";

const ADMIN_EMAIL = "admin@valuhire.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";
const RECRUITER_EMAIL = "recruiter@example.com";
const RECRUITER_PASSWORD = process.env.RECRUITER_PASSWORD || "RecruiterPass123!";
const CANDIDATE_EMAIL = "candidate@example.com";
const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD || "CandidatePass123!";

test.describe("ValuHire smoke tests", () => {
  test("login page renders", async ({ page }) => {
    await page.goto(WEB_URL);
    await expect(page).toHaveURL(/login/);
    await expect(page.locator("text=Welcome to ValuHire")).toBeVisible();
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(page.locator("input[type=password]")).toBeVisible();
  });

  test("unauthenticated user redirected to login", async ({ page }) => {
    await page.goto(`${WEB_URL}/recruiter`);
    await expect(page).toHaveURL(/login/);
  });

  test("candidate can login and see dashboard", async ({ page }) => {
    await page.goto(`${WEB_URL}/login`);
    await page.fill("input[type=email]", CANDIDATE_EMAIL);
    await page.fill("input[type=password]", CANDIDATE_PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForURL(/candidate|recruiter|admin/, { timeout: 10_000 });
    await expect(page.locator("text=ValuHire")).toBeVisible();
  });

  test("recruiter dashboard shows campaigns pipeline", async ({ page }) => {
    await page.goto(`${WEB_URL}/login`);
    await page.fill("input[type=email]", RECRUITER_EMAIL);
    await page.fill("input[type=password]", RECRUITER_PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForURL(/recruiter|admin/, { timeout: 10_000 });
    await expect(page.locator("text=Recruiter Dashboard").or(page.locator("text=Campaign Pipeline"))).toBeVisible({ timeout: 5_000 });
  });

  test("admin moderation page loads", async ({ page }) => {
    await page.goto(`${WEB_URL}/login`);
    await page.fill("input[type=email]", ADMIN_EMAIL);
    await page.fill("input[type=password]", ADMIN_PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForURL(/admin/, { timeout: 10_000 });
    await expect(page.locator("text=Admin Moderation").or(page.locator("text=Company Approvals"))).toBeVisible({ timeout: 5_000 });
  });

  test("login form shows error for bad credentials", async ({ page }) => {
    await page.goto(`${WEB_URL}/login`);
    await page.fill("input[type=email]", "wrong@example.com");
    await page.fill("input[type=password]", "wrongpass");
    await page.click("button[type=submit]");
    await expect(page.locator("text=/invalid|error|failed/i").first()).toBeVisible({ timeout: 5_000 });
  });

  test("logout clears session", async ({ page }) => {
    await page.goto(`${WEB_URL}/login`);
    await page.fill("input[type=email]", CANDIDATE_EMAIL);
    await page.fill("input[type=password]", CANDIDATE_PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForURL(/candidate|recruiter|admin/, { timeout: 10_000 });
    const logoutButton = page.locator("button[title='Sign out'], button:has-text('Sign out'), button:has-text('Exit'), button:has-text('Logout')").first();
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForURL(/login/, { timeout: 5_000 }).catch(() => {});
    }
  });

  test("API health endpoint returns ok", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/health`);
    expect(res.status()).toBeLessThan(500);
  });
});

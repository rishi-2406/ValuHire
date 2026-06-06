# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/smoke.spec.js >> ValuHire smoke tests >> login form shows error for bad credentials
- Location: tests/smoke.spec.js:58:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | // Playwright smoke test for ValuHire UI
  2  | // Run: npx playwright test smoke.spec.js
  3  | // Requires both API (port 4000) and web (port 3000) running
  4  | 
  5  | import { test, expect } from "@playwright/test";
  6  | 
  7  | const WEB_URL = process.env.WEB_URL || "http://localhost:3000";
  8  | const API_URL = process.env.API_URL || "http://localhost:4000";
  9  | 
  10 | const ADMIN_EMAIL = "admin@valuhire.local";
  11 | const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";
  12 | const RECRUITER_EMAIL = "recruiter@example.com";
  13 | const RECRUITER_PASSWORD = process.env.RECRUITER_PASSWORD || "RecruiterPass123!";
  14 | const CANDIDATE_EMAIL = "candidate@example.com";
  15 | const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD || "CandidatePass123!";
  16 | 
  17 | test.describe("ValuHire smoke tests", () => {
  18 |   test("login page renders", async ({ page }) => {
  19 |     await page.goto(WEB_URL);
  20 |     await expect(page).toHaveURL(/login/);
  21 |     await expect(page.locator("text=Welcome to ValuHire")).toBeVisible();
  22 |     await expect(page.locator("input[type=email]")).toBeVisible();
  23 |     await expect(page.locator("input[type=password]")).toBeVisible();
  24 |   });
  25 | 
  26 |   test("unauthenticated user redirected to login", async ({ page }) => {
  27 |     await page.goto(`${WEB_URL}/recruiter`);
  28 |     await expect(page).toHaveURL(/login/);
  29 |   });
  30 | 
  31 |   test("candidate can login and see dashboard", async ({ page }) => {
  32 |     await page.goto(`${WEB_URL}/login`);
  33 |     await page.fill("input[type=email]", CANDIDATE_EMAIL);
  34 |     await page.fill("input[type=password]", CANDIDATE_PASSWORD);
  35 |     await page.click("button[type=submit]");
  36 |     await page.waitForURL(/candidate|recruiter|admin/, { timeout: 10_000 });
  37 |     await expect(page.locator("text=ValuHire")).toBeVisible();
  38 |   });
  39 | 
  40 |   test("recruiter dashboard shows campaigns pipeline", async ({ page }) => {
  41 |     await page.goto(`${WEB_URL}/login`);
  42 |     await page.fill("input[type=email]", RECRUITER_EMAIL);
  43 |     await page.fill("input[type=password]", RECRUITER_PASSWORD);
  44 |     await page.click("button[type=submit]");
  45 |     await page.waitForURL(/recruiter|admin/, { timeout: 10_000 });
  46 |     await expect(page.locator("text=Recruiter Dashboard").or(page.locator("text=Campaign Pipeline"))).toBeVisible({ timeout: 5_000 });
  47 |   });
  48 | 
  49 |   test("admin moderation page loads", async ({ page }) => {
  50 |     await page.goto(`${WEB_URL}/login`);
  51 |     await page.fill("input[type=email]", ADMIN_EMAIL);
  52 |     await page.fill("input[type=password]", ADMIN_PASSWORD);
  53 |     await page.click("button[type=submit]");
  54 |     await page.waitForURL(/admin/, { timeout: 10_000 });
  55 |     await expect(page.locator("text=Admin Moderation").or(page.locator("text=Company Approvals"))).toBeVisible({ timeout: 5_000 });
  56 |   });
  57 | 
  58 |   test("login form shows error for bad credentials", async ({ page }) => {
> 59 |     await page.goto(`${WEB_URL}/login`);
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  60 |     await page.fill("input[type=email]", "wrong@example.com");
  61 |     await page.fill("input[type=password]", "wrongpass");
  62 |     await page.click("button[type=submit]");
  63 |     await expect(page.locator("text=/invalid|error|failed/i").first()).toBeVisible({ timeout: 5_000 });
  64 |   });
  65 | 
  66 |   test("logout clears session", async ({ page }) => {
  67 |     await page.goto(`${WEB_URL}/login`);
  68 |     await page.fill("input[type=email]", CANDIDATE_EMAIL);
  69 |     await page.fill("input[type=password]", CANDIDATE_PASSWORD);
  70 |     await page.click("button[type=submit]");
  71 |     await page.waitForURL(/candidate|recruiter|admin/, { timeout: 10_000 });
  72 |     const logoutButton = page.locator("button[title='Sign out'], button:has-text('Sign out'), button:has-text('Exit'), button:has-text('Logout')").first();
  73 |     if (await logoutButton.count() > 0) {
  74 |       await logoutButton.click();
  75 |       await page.waitForURL(/login/, { timeout: 5_000 }).catch(() => {});
  76 |     }
  77 |   });
  78 | 
  79 |   test("API health endpoint returns ok", async ({ request }) => {
  80 |     const res = await request.get(`${API_URL}/api/v1/health`);
  81 |     expect(res.status()).toBeLessThan(500);
  82 |   });
  83 | });
  84 | 
```
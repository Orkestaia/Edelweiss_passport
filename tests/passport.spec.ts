import { test, expect } from "@playwright/test";
const token = "a".repeat(43), complete = "b".repeat(43);
async function dismissInstall(page: import("@playwright/test").Page) {
  await page.addInitScript(() => localStorage.setItem("edelweiss_install_help_seen", "1"));
}
test("landing, responsive content and valid/invalid personal links", async ({ page }) => {
  await dismissInstall(page);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/"); await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
  await page.goto(`/p/${token}`); await expect(page.getByRole("heading", { name: "Grüezi, Daniel!" })).toBeVisible();
  await expect(page.locator(".mini-stamps .filled")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/passport-${test.info().project.name}.png`, fullPage: true });
  const html = await page.content(); expect(html).not.toContain("fixture-read-secret"); expect(html).not.toContain("customerEmail");
  expect(errors).toEqual([]);
  await page.goto("/p/invalid"); await expect(page.getByRole("heading", { name: "We couldn't find this passport" })).toBeVisible();
  await page.getByRole("link", { name: "Back to Edelweiss" }).click(); await expect(page).toHaveURL("/");
});
test("personal manifest, privacy headers and persistent token redirect", async ({ page, request }) => {
  await dismissInstall(page);
  const response = await page.goto(`/p/${token}`);
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const manifest = await request.get(`/p/${token}/manifest.webmanifest`);
  expect(await manifest.json()).toMatchObject({ start_url: `/p/${token}`, scope: "/", display: "standalone", name: "Edelweiss Swiss Passport" });
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", `/p/${token}/manifest.webmanifest`);
  await page.goto("/"); await expect(page).toHaveURL(`/p/${token}`);
});
test("only unseen stamps animate and reduced motion is honored", async ({ page }) => {
  await dismissInstall(page);
  await page.addInitScript(token => localStorage.setItem(`edelweiss_passport_seen:${token}`, "3"), token);
  await page.goto(`/p/${token}`);
  await expect(page.locator('[data-new="true"]')).toHaveCount(1);
  await expect(page.locator('[data-new="true"]')).toHaveCount(0, { timeout: 5000 });
  // Remove init scripts by opening a new document without resetting the seen value.
  await page.evaluate(token => localStorage.setItem(`edelweiss_passport_seen:${token}`, "4"), token);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".stamp-art").first()).toHaveCSS("animation-name", "none");
});
test("seen stamp count survives a reload without replay", async ({ page }) => {
  await dismissInstall(page); await page.goto(`/p/${token}`);
  await expect.poll(() => page.evaluate(token => localStorage.getItem(`edelweiss_passport_seen:${token}`), token)).toBe("4");
  await page.reload(); await expect(page.locator('[data-new="true"]')).toHaveCount(0);
});
test("stop facts, dates, enlarged map and zoom controls", async ({ page }) => {
  await dismissInstall(page); await page.goto(`/p/${token}`);
  await page.getByRole("button", { name: "1. Zürich, stamped", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Zürich", exact: true })).toBeVisible();
  await expect(page.getByText(/Legend says Charlemagne/)).toBeVisible();
  await expect(page.getByText("Stamped September 25, 2026")).toBeVisible();
  await page.getByRole("button", { name: "Close stop details" }).click();
  await page.getByRole("button", { name: /View full map/ }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.locator(".zoom-viewport>div")).toHaveAttribute("style", /scale\(1.5\)/);
  await page.getByRole("button", { name: "Close", exact: true }).click();
});
test("complete passport shows the single reward and no next-card language", async ({ page }) => {
  await dismissInstall(page); await page.goto(`/p/${complete}`);
  await expect(page.getByText("SWISS-7K3QXM", { exact: true })).toBeVisible();
  await expect(page.locator(".mini-stamps .filled")).toHaveCount(10);
  await expect(page.getByText(/Your Swiss journey is complete/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Order online/ })).toHaveAttribute("href", "https://edelweisspastryshop.ch/menu");
});
test("Android install event invokes browser prompt; installed mode hides controls", async ({ page }) => {
  await dismissInstall(page); await page.goto(`/p/${token}`);
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt: async () => { document.documentElement.dataset.prompted = "true"; }, userChoice: Promise.resolve({ outcome: "accepted" }) });
    window.dispatchEvent(event);
  });
  await page.getByRole("button", { name: "Add to home screen", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-prompted", "true");
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByRole("button", { name: "How to add to home screen" })).toHaveCount(0);
});
test("iPhone guidance appears once and help remains available", async ({ page, browserName }) => {
  test.skip(browserName !== "webkit", "iPhone user agent project");
  await page.goto(`/p/${token}`);
  await expect(page.getByRole("heading", { name: "Add your passport" })).toBeVisible();
  await expect(page.getByText(/Tap Share/)).toBeVisible();
  await page.getByRole("button", { name: "Close installation instructions" }).click();
  await page.reload(); await page.waitForTimeout(1500);
  await expect(page.getByRole("heading", { name: "Add your passport" })).not.toBeVisible();
  await page.getByRole("button", { name: "How to add to home screen" }).click();
  await expect(page.getByRole("heading", { name: "Add your passport" })).toBeVisible();
});
test("offline reload retains the personal passport and displays a notice", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Chromium verifies service-worker offline navigation on Windows");
  await dismissInstall(page); await page.goto(`/p/${token}`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(async path => Boolean(await (await caches.open("edelweiss-passport-v1-pages")).match(path)), `/p/${token}`), { timeout: 20000 }).toBe(true);
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole("heading", { name: "Grüezi, Daniel!" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("offline");
  await expect(page.locator(".mini-stamps .filled")).toHaveCount(4);
  await context.setOffline(false);
});

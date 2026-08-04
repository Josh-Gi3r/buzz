import { test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1500, height: 950 } });

test("what each library item actually renders", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("buzz-feature-overrides-v1", JSON.stringify({ "preview-studio": true }));
    window.localStorage.setItem("buzz-theme", "houston");
  });
  await installMockBridge(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("open-preview-studio-view").click();

  await page.getByTestId("preview-studio-screen").waitFor({ timeout: 20000 });
  await page.locator("[data-testid^=\"preview-studio-artifact-\"]").first().waitFor({ timeout: 20000 });
  const items = await page.locator('[data-testid^="preview-studio-artifact-"]').all();
  for (const item of items) {
    const title = (await item.innerText()).split("\n")[0];
    await item.click();
    await page.waitForTimeout(1200);
    const kind = await page.getByTestId("preview-studio-stage").getAttribute("data-stage-kind").catch(() => null);
    const hasFrame = await page.locator("iframe").count();
    console.log(`  ${title.padEnd(24)} stage=${kind ?? "-"}  iframes=${hasFrame}`);
  }
});

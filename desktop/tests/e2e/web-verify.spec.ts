import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1000 } });

test("website artifact renders real, editable source", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "buzz-feature-overrides-v1",
      JSON.stringify({ "preview-studio": true }),
    );
    window.localStorage.setItem("buzz-theme", "houston");
  });
  await installMockBridge(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("open-preview-studio-view").click();
  await page.getByTestId("preview-studio-artifact-art-checkout").click();

  await expect(page.getByTestId("preview-studio-web")).toBeVisible({ timeout: 20_000 });

  // the site is a live document in a frame, not an image
  const frame = page.frameLocator("iframe").first();
  await expect(frame.getByRole("heading", { name: /Days worth keeping/i })).toBeVisible({ timeout: 25_000 });
  console.log("hero text from inside the live site:", await frame.locator("h1").first().textContent());

  // the photographs are real pixels, not broken slots
  const photos = await frame.locator("img").evaluateAll((els) =>
    els.map((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0),
  );
  console.log(`photographs loaded: ${photos.filter(Boolean).length}/${photos.length}`);
  expect(photos.length).toBe(7);
  expect(photos.every(Boolean)).toBe(true);

  await page.getByTestId("preview-studio-viewport-mobile").click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/web-verify.png" });
});

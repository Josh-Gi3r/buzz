import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1000 } });

/**
 * Video generation needs the Higgsfield tool, which is only reachable through
 * the desktop shell. In a browser the section must say so and offer nothing —
 * it never presents generation it cannot verify the audio policy for.
 */
test("video generation fails closed without the media tool", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("buzz-feature-overrides-v1", JSON.stringify({ "preview-studio": true }));
    window.localStorage.setItem("buzz-theme", "houston");
  });
  await installMockBridge(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("open-preview-studio-view").click();
  await page.getByTestId("preview-studio-open-generate").click();

  await expect(page.getByText("The Higgsfield tool is not installed on this device.")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("preview-studio-video-generate")).toHaveCount(0);
  await expect(page.getByTestId("preview-studio-video-model")).toHaveCount(0);

  await page.screenshot({ path: "test-results/video-panel.png" });
});

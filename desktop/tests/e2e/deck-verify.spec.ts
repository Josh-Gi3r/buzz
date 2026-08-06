import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1000 } });

test("deck renders slides", async ({ page }) => {
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
  await page.getByTestId("preview-studio-artifact-art-pricing-deck").click();
  await expect(page.getByTestId("preview-studio-deck")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("preview-studio-slide-next").click();
  await page.waitForTimeout(600);
  await page.getByTestId("preview-studio-slide-next").click();
  await expect(page.getByText("Slide 3 of 6")).toBeVisible();
  // text is real text, not a picture
  await expect(page.getByRole("heading", { name: "Collections" })).toBeVisible();
  await page.getByTestId("preview-studio-review-input").fill("Can we lead with The Full Day here?");
  await page.getByTestId("preview-studio-review-submit").click();
  await expect(page.getByText("Slide 3 ·")).toBeVisible();
  await page.screenshot({ path: "test-results/deck-verify.png" });
});

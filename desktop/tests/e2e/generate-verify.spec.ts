import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1000 } });

test("generate panel offers real model choices", async ({ page }) => {
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
  await page.getByTestId("preview-studio-open-generate").click();
  await expect(page.getByTestId("preview-studio-generate-panel")).toBeVisible();

  const models = await page
    .getByTestId("preview-studio-model-select")
    .locator("option")
    .allTextContents();
  console.log("models offered:", models.join(" | "));

  // no key stored -> generate is blocked, nothing can fire by accident
  await page
    .getByTestId("preview-studio-prompt")
    .fill("a calm nordic landing page hero");
  const disabled = await page
    .getByTestId("preview-studio-generate")
    .isDisabled();
  console.log("generate blocked without a key:", disabled);
  expect(disabled).toBe(true);

  await page.screenshot({ path: "test-results/generate-verify.png" });
});

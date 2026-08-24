import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

// Interactive playground: seeds the demo library, enables the flag, opens
// BUZZ — LIVE PREVIEW STUDIO, then holds the window open. Run headed.
// Roomy fixed window (the Desktop Chrome preset forbids a null viewport).
test.use({ viewport: { width: 1600, height: 1000 } });

test("preview studio playground", async ({ page }) => {
  test.skip(
    process.env.CI === "true",
    "Interactive playground is intended for local headed use only",
  );
  test.setTimeout(0);
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
  await expect(page.getByTestId("preview-studio-screen")).toBeVisible({
    timeout: 20_000,
  });
  await page.waitForTimeout(6 * 60 * 60 * 1000);
});

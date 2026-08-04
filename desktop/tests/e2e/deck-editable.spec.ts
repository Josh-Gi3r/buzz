import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1000 } });

test("deck text is real, selectable and editable", async ({ page }) => {
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
  await page.getByTestId("preview-studio-artifact-art-investor-deck").click();
  await expect(page.getByTestId("preview-studio-deck")).toBeVisible({ timeout: 15000 });

  // 1. it is text in the DOM, not pixels
  const heading = page.getByRole("heading", { name: "Northwind" });
  await expect(heading).toBeVisible();
  console.log("slide 1 heading text:", await heading.textContent());

  // 2. editing changes the words
  await page.getByTestId("preview-studio-deck-edit").click();
  await heading.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Northwind — Series A");
  await page.getByTestId("preview-studio-deck-save").click();

  // 3. the edit became a NEW revision (immutable model)
  await expect(page.getByRole("heading", { name: "Northwind — Series A" })).toBeVisible();
  const rev = await page.locator("code").first().textContent();
  console.log("revision after edit:", rev);
  expect(rev).not.toBe("rev-deck-7");
  await page.screenshot({ path: "test-results/deck-editable.png" });
});

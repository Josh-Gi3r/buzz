import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1000 } });

test("editing keeps the old revision and its comment reachable", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("buzz-feature-overrides-v1", JSON.stringify({ "preview-studio": true }));
    window.localStorage.setItem("buzz-theme", "houston");
  });
  await installMockBridge(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("open-preview-studio-view").click();
  await page.getByTestId("preview-studio-artifact-art-pricing-deck").click();
  await expect(page.getByTestId("preview-studio-deck")).toBeVisible({ timeout: 15000 });

  // comment on v1
  await page.getByTestId("preview-studio-review-input").fill("Tighten the opening line.");
  await page.getByTestId("preview-studio-review-submit").click();
  await expect(page.getByText("Tighten the opening line.")).toBeVisible();

  // no rail yet — a single revision has no history to show
  await expect(page.getByTestId("preview-studio-revision-rail")).toHaveCount(0);

  // edit -> new revision
  await page.getByTestId("preview-studio-deck-edit").click();
  const heading = page.getByRole("heading", { name: "Elena Marsh" });
  await heading.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Elena Marsh 2027");
  await page.getByTestId("preview-studio-deck-save").click();
  await expect(page.getByRole("heading", { name: "Elena Marsh 2027" })).toBeVisible();

  // the rail appears, and the old comment is NOT lost — it is on v1
  const rail = page.getByTestId("preview-studio-revision-rail");
  await expect(rail).toBeVisible();
  const entries = await rail.locator("li").count();
  console.log("revisions listed:", entries);

  // current revision shows no comments; clicking back to v1 restores it
  await expect(page.getByText("Tighten the opening line.")).toHaveCount(0);
  await rail.locator("li").last().locator("button").click();
  await expect(page.getByText("Tighten the opening line.")).toBeVisible();
  console.log("comment recovered from the earlier revision: yes");

  await page.screenshot({ path: "test-results/revision-rail.png" });
});

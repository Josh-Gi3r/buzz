import { expect, test } from "@playwright/test";
import { installMockBridge } from "../helpers/bridge";

test.use({ viewport: { width: 1600, height: 1100 } });

/**
 * The film artifact is a HyperFrames composition with a render beside it.
 * Editing the cut has to regenerate the composition and create a revision, and
 * the render has to admit when it is older than the cut — otherwise the stage
 * shows stale footage as if it were current.
 */
test("film plays, previews its cut, and edits create a new revision", async ({
  page,
}) => {
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
  await page.getByTestId("preview-studio-artifact-art-wedding-film").click();
  await expect(page.getByTestId("preview-studio-stage")).toBeVisible({
    timeout: 15000,
  });

  // the render is a real decodable video, not a poster pretending to be one
  const video = page.getByTestId("preview-studio-film-video");
  await expect(video).toBeVisible();
  await page.waitForFunction(
    () => {
      const el = document.querySelector(
        "[data-testid='preview-studio-film-video']",
      ) as HTMLVideoElement | null;
      return !!el && el.readyState >= 2 && el.videoWidth > 0;
    },
    undefined,
    { timeout: 20000 },
  );

  const sceneCount = await page
    .locator("[data-testid^='preview-studio-film-scene-']")
    .count();
  expect(sceneCount).toBe(7);

  // the cut preview is the live composition, not a second copy of the video
  await page.getByTestId("preview-studio-film-mode-cut").click();
  const frame = page.frameLocator("[data-testid='preview-studio-film-frame']");
  await expect(frame.locator("#root")).toBeAttached({ timeout: 15000 });
  const composition = await frame.locator("#root").evaluate((el) => ({
    sections: el.querySelectorAll("section.clip").length,
    duration: el.getAttribute("data-duration"),
  }));
  expect(composition.sections).toBe(7);
  expect(Number(composition.duration)).toBeCloseTo(25.4, 1);

  // dropping a scene rewrites the cut and lands as a new revision
  await page
    .locator(
      "[data-testid='preview-studio-film-edit-scene-details'] button[aria-label='Drop scene']",
    )
    .click();
  await expect(
    page.locator("[data-testid^='preview-studio-film-scene-']"),
  ).toHaveCount(6);

  const regenerated = await frame
    .locator("#root")
    .evaluate((el) => el.querySelectorAll("section.clip").length);
  expect(regenerated).toBe(6);

  // and the shipped render now openly predates the cut
  await page.getByTestId("preview-studio-film-mode-film").click();
  await expect(page.getByTestId("preview-studio-film-stale")).toBeVisible();

  await page.screenshot({ path: "test-results/film-verify.png" });
});

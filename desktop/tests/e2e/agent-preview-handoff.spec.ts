import { expect, test } from "@playwright/test";

import { installMockBridge, TEST_IDENTITIES } from "../helpers/bridge";

const PREVIEW_URL = "http://agent-preview.test/";

test("an agent live URL opens in Preview Studio and survives reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2048, height: 1024 });
  await installMockBridge(
    page,
    {
      searchProfiles: [
        {
          pubkey: TEST_IDENTITIES.alice.pubkey,
          displayName: "Builder",
          isAgent: true,
        },
      ],
    },
    { seedPreviewFeatures: true },
  );
  await page.route(`${PREVIEW_URL}**`, async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body><main><h1>Agent build is live</h1><button>Try the app</button></main></body></html>`,
    });
  });

  await page.goto("/");
  await page.getByTestId("channel-general").click();
  await page.waitForFunction(
    () => typeof window.__BUZZ_E2E_EMIT_MOCK_MESSAGE__ === "function",
  );
  await page.evaluate(
    ({ pubkey, url }) => {
      window.__BUZZ_E2E_EMIT_MOCK_MESSAGE__?.({
        channelName: "general",
        content: `The website is ready. Live preview: ${url}`,
        pubkey,
        id: "a".repeat(64),
      });
    },
    { pubkey: TEST_IDENTITIES.alice.pubkey, url: PREVIEW_URL },
  );

  const handoff = page.getByTestId("agent-preview-open");
  await expect(handoff).toContainText("Open live preview");
  await handoff.click();

  await expect(page).toHaveURL(/\/preview-studio$/);
  await expect(page.getByTestId("preview-studio-inspector")).toHaveCount(0);
  const frame = page.getByTestId("preview-studio-url-frame");
  await expect(frame).toHaveAttribute(
    "sandbox",
    "allow-scripts allow-forms allow-modals allow-same-origin",
  );
  await expect
    .poll(async () => (await frame.boundingBox())?.width ?? 0)
    .toBeGreaterThan(1_200);
  await expect(
    page
      .frameLocator('[data-testid="preview-studio-url-frame"]')
      .getByRole("heading", { name: "Agent build is live" }),
  ).toBeVisible();

  await page.getByTestId("preview-studio-inspector-toggle").click();
  await expect(page.getByTestId("preview-studio-inspector")).toBeVisible();
  await page.getByTestId("preview-studio-inspector-toggle").click();
  await expect(page.getByTestId("preview-studio-inspector")).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId("preview-studio-url-frame")).toBeVisible();
  await expect(
    page
      .frameLocator('[data-testid="preview-studio-url-frame"]')
      .getByRole("button", { name: "Try the app" }),
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

test("shows reusable institution packs without provisioning live agents", async ({
  page,
}) => {
  await page.goto("/?studio=1", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("preview-studio-screen")).toBeVisible({
    timeout: 20_000,
  });

  await page.getByTestId("preview-studio-open-institution").click();
  const panel = page.getByTestId("institution-studio-panel");
  await expect(panel).toBeVisible();
  await expect(
    panel.getByText("Remittance corridor", { exact: true }),
  ).toHaveCount(2);
  await expect(panel.getByText("Ledger & Banking")).toBeVisible();
  await expect(panel.getByText("Monetary Engine")).toBeVisible();
  await expect(panel.getByText("No credential is copied.")).toBeVisible();

  await panel.getByRole("button", { name: "Stablecoin issuer" }).click();
  await expect(panel.getByText("Reserve Treasury")).toBeVisible();
  await expect(panel.getByText("Smart Contracts")).toBeVisible();
  await expect(page.getByTestId("institution-studio-result")).toHaveCount(0);
});

import { expect, test } from "@playwright/test";

test("未ログインでトップページとログイン導線を表示する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Supabaseと連携したNextjsアプリケーション" })).toBeVisible();
  await page.getByRole("link", { name: "ログイン", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("未ログインで保護されたページを開くとログインに戻る", async ({ page }) => {
  await page.goto("/protected/chat");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("認証APIの拒否をフォームに表示する", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByPlaceholder("you@example.com").fill("test@example.com");
  await page.getByPlaceholder("Your password").fill("incorrect-password");
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await expect(page.getByText("Invalid login credentials")).toBeVisible();
});

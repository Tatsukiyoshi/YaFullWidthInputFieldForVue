import { test, expect } from '@playwright/test';

test.describe('FullWidthNumberField', () => {
  test('全角数字入力が半角数字に変換される', async ({ page }) => {
    // サンプルアプリを起動
    await page.goto('http://localhost:8080/'); // ポート番号は環境に合わせて調整

    // 価格フィールドを取得
    const priceInput = page.getByPlaceholder('全角で価格を入力');

    // 全角数字を入力
    await priceInput.fill('１２３４５');

    // 入力値が半角数字に変換されていることを検証
    await expect(priceInput).toHaveValue('12,345');
  });
});

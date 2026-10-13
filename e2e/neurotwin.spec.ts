import { test, expect } from '@playwright/test';
test('landing and anatomical 3D load without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ваш разум. Новый ракурс.' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Загрузка анатомии', { exact: false })).toHaveCount(0, {
    timeout: 45000,
  });
  await page.getByRole('button', { name: 'Остановить вращение' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screenshots/landing-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
  await page.getByRole('link', { name: 'Исследовать свой профиль' }).click();
  await expect(page.getByRole('button', { name: 'Разрешить локальное сохранение' })).toBeVisible();
});
test('demo, region interaction, export, mobile layout and model failure', async ({ page }) => {
  await page.goto('/dashboard?demo=1');
  await expect(page.getByText('DEMO PROFILE')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Загрузка анатомии', { exact: false })).toHaveCount(0, {
    timeout: 45000,
  });
  await page.getByRole('button', { name: 'Память', exact: true }).click();
  await expect(page.locator('.region-panel h2')).toHaveText('Память');
  await page.locator('.formula-details summary').click();
  await expect(page.getByText('35% самооценки памяти', { exact: false })).toBeVisible();
  await page.locator('.formula-details summary').click();
  await page.getByRole('button', { name: 'Внимание', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/dashboard-desktop.png', fullPage: true });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Экспорт JSON' }).click();
  expect((await download).suggestedFilename()).toBe('neurotwin-demo.json');
  expect(await page.evaluate(() => localStorage.getItem('neurotwin:v1'))).toBeNull();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'screenshots/dashboard-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.route('**/models/brain.glb', (route) => route.abort());
  await page.reload();
  await expect(page.getByText('Не удалось открыть 3D.', { exact: false })).toBeVisible({
    timeout: 45000,
  });
  await page.getByRole('button', { name: 'Контроль', exact: true }).click();
  await expect(page.locator('.region-panel h2')).toHaveText('Контроль');
});
test('intake validation, real reaction and memory tasks, profile, persistence and deletion', async ({
  page,
}) => {
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Разрешить локальное сохранение' }).click();
  await page.getByRole('spinbutton', { name: 'Обычно сплю, часов' }).fill('13');
  await page.getByRole('button', { name: 'Дальше', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Начнём с вашего дня.' })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Обычно сплю, часов' }).fill('7.5');
  await page
    .getByRole('button', { name: 'Насколько легко удерживать фокус? 8 из 10', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Как ощущается ваша память? 7 из 10', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Сколько нагрузки ощущаете сейчас? 4 из 10', exact: true })
    .click();
  await page.getByRole('button', { name: 'Дальше', exact: true }).click();
  const pad = page.getByTestId('reaction-pad');
  await pad.click();
  await pad.click();
  await expect(pad).toContainText('Попробуем ещё раз');
  for (let i = 0; i < 5; i++) {
    await pad.click();
    await expect(pad).toContainText('Сейчас!', { timeout: 6000 });
    await page.waitForTimeout(210);
    await pad.press('Space');
  }
  await expect(page.locator('.trial-row .completed')).toHaveCount(5);
  await page.getByRole('button', { name: /^Сохранить ·/ }).click();
  for (let round = 0; round < 5; round++) {
    await page
      .getByRole('button', {
        name: round === 0 ? 'Показать последовательность' : 'Следующий раунд',
        exact: false,
      })
      .click();
    await expect(page.getByRole('button', { name: 'Плитка 1', exact: true })).toBeEnabled({
      timeout: 10000,
    });
    for (let i = 0; i < 3 + round; i++) await page.keyboard.press(String((i % 9) + 1));
  }
  await expect(page.getByText('Все пять раундов завершены')).toBeVisible();
  await page.getByRole('button', { name: 'Сохранить результат', exact: false }).click();
  await expect(page.getByText('Медиана реакции', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Создать мой профиль' }).click();
  await expect(page.getByText('LOCAL PROFILE')).toBeVisible();
  await expect(page.getByText('DEMO PROFILE')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('LOCAL PROFILE')).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('neurotwin:v1')!).sessions.length),
  ).toBe(1);
  await page.getByRole('link', { name: 'Приватность', exact: true }).click();
  await page.getByRole('button', { name: 'Удалить мои данные' }).click();
  await page.getByRole('button', { name: 'Удалить данные', exact: true }).click();
  await expect(page.getByText('Локальные данные удалены')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('neurotwin:v1'))).toBeNull();
  await page.goto('/dashboard');
  await expect(
    page.getByRole('heading', { name: 'Ваш профиль начинается с любопытства.' }),
  ).toBeVisible();
});

test('resume, optional task skipping and comparison keep demo out of history', async ({ page }) => {
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Разрешить локальное сохранение' }).click();
  for (const score of [6, 8]) {
    await page
      .getByRole('button', {
        name: `Насколько легко удерживать фокус? ${score} из 10`,
        exact: true,
      })
      .click();
    await page.getByRole('button', { name: 'Дальше', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Поймайте момент.' })).toBeVisible();
    await page.getByRole('button', { name: 'Пропустить задание' }).click();
    await page.getByRole('button', { name: 'Пропустить задание' }).click();
    await page.getByRole('button', { name: 'Создать мой профиль' }).click();
    await expect(page.getByText('LOCAL PROFILE')).toBeVisible();
    if (score === 6) await page.getByRole('link', { name: 'Новое исследование' }).click();
  }
  await expect(page.locator('.history-chart')).toBeVisible();
  await page.getByRole('combobox', { name: 'Выбрать сессию' }).selectOption('demo');
  await expect(page.getByText('DEMO PROFILE')).toBeVisible();
  const sessions = await page.evaluate(
    () => JSON.parse(localStorage.getItem('neurotwin:v1')!).sessions,
  );
  expect(sessions).toHaveLength(2);
  expect(sessions.every((s: { demo: boolean }) => s.demo === false)).toBe(true);
  await page.locator('.history-table summary').click();
  await expect(page.locator('.history-table tbody tr')).toHaveCount(2);
});

test('storage failure is explicit and leaves an operable intake', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage disabled', 'QuotaExceededError');
    };
  });
  await page.goto('/assessment');
  await page.getByRole('button', { name: 'Разрешить локальное сохранение' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Браузер не разрешил сохранить данные' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Начнём с вашего дня.' })).toBeVisible();
});

test('unavailable WebGL retains an anatomical illustration and accessible region controls', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextType: string,
      ...args: unknown[]
    ) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(contextType)) return null;
      return original.apply(this, [contextType, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/dashboard?demo=1');
  await expect(
    page.getByRole('img', { name: 'Схематическая анатомическая иллюстрация мозга' }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Загрузка анатомии', { exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'Память', exact: true }).click();
  await expect(page.locator('.region-panel h2')).toHaveText('Память');
});

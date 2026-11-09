import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { default: Section } = await server.ssrLoadModule('/src/components/features/CategoryMenuSection.tsx');
  const { getContractedDisplayType } = await server.ssrLoadModule('/src/constants/categoryDisplayTypes.ts');
  const food = { orderKey: 'test', name: 'نام بسیار بلند '.repeat(8), image: '', hasRealImage: false, enabled: false, price: 1350, shortDescription: 'hidden description' };
  const render = (category, quantity = 0) => renderToStaticMarkup(React.createElement(Section, {
    category,
    foods: [food, { ...food, orderKey: 'second', enabled: true }], subcategories: [], index: 0,
    sectionRef() {}, scrollMarginTop: 0, dietaryFilter: 'all', getQuantity: () => quantity,
    onAddToOrder() {}, onRemoveFromOrder() {}, onOpen() {},
  }));
  const html = render({ Id: 1, Title: 'test', DisplayType: 'FirstItemImage' });
  assert.equal((html.match(/<img /g) ?? []).length, 1);
  assert.equal((html.match(/<article /g) ?? []).length, 2);
  assert.ok(!html.includes('hidden description'));
  assert.ok(html.includes('data-order-disabled="true"'));
  assert.ok(html.includes('overflow-wrap:anywhere'));
  assert.ok(html.includes('آیتم'));
  assert.ok(render({ Id: 1, Title: 'test', DisplayType: 'FirstItemImage' }, 2).includes('کم کردن'));
  assert.equal((render({ Id: 1, Title: 'test', DisplayType: 'LargeImage' }).match(/<img /g) ?? []).length, 2);

  assert.equal(getContractedDisplayType(20), 'FirstItemImage');
  const hookahWithoutApiType = render({ Id: 20, Title: 'قلیان' });
  assert.equal((hookahWithoutApiType.match(/<img /g) ?? []).length, 1, 'category 20 contract activates FirstItemImage');
  assert.ok(hookahWithoutApiType.includes('rounded-[13px]'), 'hookah uses compact title-price rows');
  assert.ok(hookahWithoutApiType.includes('۲ آیتم'));
  assert.equal(
    (render({ Id: 20, Title: 'قلیان', DisplayType: 'LargeImage' }).match(/<img /g) ?? []).length,
    2,
    'explicit API DisplayType still wins over contract',
  );
  console.log('MENU-004: shared image, compact rows, Id=20 contract, API override, counter, availability passed.');
} finally {
  await server.close();
}

import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { default: Section } = await server.ssrLoadModule('/src/components/features/CategoryMenuSection.tsx');
  const food = { orderKey: 'test', name: 'نام بسیار بلند '.repeat(8), image: '', hasRealImage: false, enabled: false, price: 1350, shortDescription: 'hidden description' };
  const render = (displayType, quantity = 0) => renderToStaticMarkup(React.createElement(Section, {
    category: { Id: 1, Title: 'test', DisplayType: displayType },
    foods: [food, { ...food, orderKey: 'second', enabled: true }], subcategories: [], index: 0,
    sectionRef() {}, scrollMarginTop: 0, dietaryFilter: 'all', getQuantity: () => quantity,
    onAddToOrder() {}, onRemoveFromOrder() {}, onOpen() {},
  }));
  const html = render('FirstItemImage');
  assert.equal((html.match(/<img /g) ?? []).length, 1);
  assert.equal((html.match(/<article /g) ?? []).length, 2);
  assert.ok(!html.includes('hidden description'));
  assert.ok(html.includes('data-order-disabled="true"'));
  assert.ok(html.includes('overflow-wrap:anywhere'));
  assert.ok(render('FirstItemImage', 2).includes('کم کردن'));
  assert.equal((render('LargeImage').match(/<img /g) ?? []).length, 2);
  console.log('MENU-004: shared image, compact rows, missing image, availability, long name, quantity, fallback passed.');
} finally {
  await server.close();
}

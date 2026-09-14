const { test, expect } = require('@playwright/test');
const GroceryPage = require('../pages/GroceryPage');
const { createTestItemName } = require('./helpers/test-data');

test('adding an item shows it under the correct category', async ({ page }) => {
    const groceryPage = new GroceryPage(page);
    await groceryPage.goto();

    const itemName = createTestItemName('Milk');
    await groceryPage.addItem(itemName, 'Dairy', 2);

    const categoryGroup = groceryPage.getCategoryGroup('Dairy');
    await expect(categoryGroup).toContainText(itemName);
    await expect(categoryGroup).toContainText('x2');

    // ------------------------------------------------
    // CLEAN UP TEST ITEM
    // ------------------------------------------------
    await groceryPage.deleteItem(itemName);
    await expect(groceryPage.itemList).not.toContainText(itemName);
});

test('checking off an item marks it as checked', async ({ page }) => {
    const groceryPage = new GroceryPage(page);
    await groceryPage.goto();

    const itemName = createTestItemName('Apples');
    await groceryPage.addItem(itemName, 'Produce');

    await groceryPage.toggleItem(itemName);

    await expect(groceryPage.getItem(itemName)).toHaveClass(/checked/);

    // ------------------------------------------------
    // CLEAN UP TEST ITEM
    // ------------------------------------------------
    await groceryPage.deleteItem(itemName);
    await expect(groceryPage.itemList).not.toContainText(itemName);
});

test('clearing checked items removes only checked items', async ({ page }) => {
    const groceryPage = new GroceryPage(page);
    await groceryPage.goto();

    const checkedItemName = createTestItemName('Bread');
    const uncheckedItemName = createTestItemName('Rice');

    await groceryPage.addItem(checkedItemName, 'Bakery');
    await groceryPage.addItem(uncheckedItemName, 'Canned Goods');

    await groceryPage.toggleItem(checkedItemName);
    await groceryPage.clearChecked();

    await expect(groceryPage.itemList).not.toContainText(checkedItemName);
    await expect(groceryPage.itemList).toContainText(uncheckedItemName);

    // ------------------------------------------------
    // CLEAN UP REMAINING TEST ITEM
    // ------------------------------------------------
    await groceryPage.deleteItem(uncheckedItemName);
    await expect(groceryPage.itemList).not.toContainText(uncheckedItemName);
});

test('editing an item updates its name, category, and quantity', async ({ page }) => {
    const groceryPage = new GroceryPage(page);
    await groceryPage.goto();

    const originalName = createTestItemName('Yogurt');
    const updatedName = createTestItemName('Cheese');

    await groceryPage.addItem(originalName, 'Dairy', 1);

    await groceryPage.editItem(originalName, updatedName, 'Frozen', 3);

    const frozenGroup = groceryPage.getCategoryGroup('Frozen');
    await expect(frozenGroup).toContainText(updatedName);
    await expect(frozenGroup).toContainText('x3');
    await expect(groceryPage.itemList).not.toContainText(originalName);

    // ------------------------------------------------
    // CLEAN UP TEST ITEM
    // ------------------------------------------------
    await groceryPage.deleteItem(updatedName);
    await expect(groceryPage.itemList).not.toContainText(updatedName);
});
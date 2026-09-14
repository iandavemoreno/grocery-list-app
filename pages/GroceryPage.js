class GroceryPage {
    constructor(page) {
        this.page = page;

        this.nameInput = page.locator('#item-name');
        this.categorySelect = page.locator('#item-category');
        this.quantityInput = page.locator('#item-quantity');
        this.addButton = page.locator('#add-item-form button[type="submit"]');

        this.itemList = page.locator('#item-list');
        this.clearCheckedButton = page.locator('#clear-checked-btn');
    }

    async goto() {
        await this.page.goto('/');
    }

    async addItem(name, category, quantity = 1) {
        await this.nameInput.fill(name);
        await this.categorySelect.selectOption(category);
        await this.quantityInput.fill(String(quantity));

        const addResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/items') &&
            resp.request().method() === 'POST'
        );

        await this.addButton.click();
        await addResponsePromise;
    }

    getItem(name) {
        return this.itemList.locator('.item', { hasText: name });
    }

    getCategoryGroup(category) {
        return this.itemList.locator('.category-group', { hasText: category });
    }

    async toggleItem(name) {
        const checkbox = this.getItem(name).locator('input[type="checkbox"]');

        const toggleResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/toggle') &&
            resp.request().method() === 'PATCH'
        );

        await checkbox.click();
        await toggleResponsePromise;
    }

    async deleteItem(name) {
        const deleteResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/items/') &&
            resp.request().method() === 'DELETE'
        );

        await this.getItem(name).locator('button:has-text("Delete")').click();
        await deleteResponsePromise;
    }

    async editItem(currentName, newName, newCategory, newQuantity) {
    await this.getItem(currentName).locator('button:has-text("Edit")').click();

    await this.nameInput.fill(newName);
    await this.categorySelect.selectOption(newCategory);
    await this.quantityInput.fill(String(newQuantity));

    const editResponsePromise = this.page.waitForResponse(resp =>
        resp.url().includes('/api/items/') &&
        resp.request().method() === 'PUT'
    );

    await this.addButton.click();
    await editResponsePromise;
}

    async clearChecked() {
        const clearResponsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/clear-checked') &&
            resp.request().method() === 'DELETE'
        );

        await this.clearCheckedButton.click();
        await clearResponsePromise;
    }
}

module.exports = GroceryPage;
function uniqueSuffix() {
    return Date.now() + '' + Math.floor(Math.random() * 1000000);
}

function createTestItemName(prefix) {
    return (prefix || 'Test Item') + ' ' + uniqueSuffix();
}

module.exports = { createTestItemName };
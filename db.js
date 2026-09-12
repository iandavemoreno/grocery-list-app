const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'grocery.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        checked INTEGER NOT NULL DEFAULT 0
    )
`);

module.exports = db;
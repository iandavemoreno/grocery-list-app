const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(__dirname));

// Get all items, grouped naturally by category since we order by it here
app.get('/api/items', (req, res) => {
    const items = db.prepare('SELECT * FROM items ORDER BY category, id').all();
    res.json(items);
});

// Add a new item
app.post('/api/items', (req, res) => {
    const { name, category, quantity } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Item name is required.' });
    }

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    const finalQuantity = quantity && quantity > 0 ? quantity : 1;

    const insert = db.prepare('INSERT INTO items (name, category, quantity) VALUES (?, ?, ?)');
    const result = insert.run(name.trim(), category, finalQuantity);

    res.status(201).json({
        id: result.lastInsertRowid,
        name: name.trim(),
        category: category,
        quantity: finalQuantity,
        checked: 0
    });
});

// Toggle an item's checked/unchecked state
app.patch('/api/items/:id/toggle', (req, res) => {
    const id = req.params.id;

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) {
        return res.status(404).json({ error: 'Item not found.' });
    }

    const newChecked = item.checked ? 0 : 1;
    db.prepare('UPDATE items SET checked = ? WHERE id = ?').run(newChecked, id);

    res.json({ id: item.id, checked: newChecked });
});

// Clear every checked-off item at once - note this route is defined
// BEFORE the "/:id" delete route below, on purpose (explained below)
app.delete('/api/items/clear-checked', (req, res) => {
    db.prepare('DELETE FROM items WHERE checked = 1').run();
    res.json({ message: 'Checked items cleared.' });
});

// Delete a single item
app.delete('/api/items/:id', (req, res) => {
    const id = req.params.id;
    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    res.json({ message: 'Item deleted.' });
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
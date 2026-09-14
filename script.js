let allItems = [];
let editingItemId = null;

function loadItems() {
    fetch('/api/items')
        .then(function (response) {
            return response.json();
        })
        .then(function (items) {
            allItems = items;
            renderItems(items);
        });
}

function renderItems(items) {
    const listEl = document.getElementById('item-list');

    if (items.length === 0) {
        listEl.innerHTML = '<p>Your grocery list is empty.</p>';
        return;
    }

    // Group items by category into an object like:
    // { Produce: [item1, item2], Dairy: [item3] }
    const groups = {};
    items.forEach(function (item) {
        if (!groups[item.category]) {
            groups[item.category] = [];
        }
        groups[item.category].push(item);
    });

    let html = '';

    Object.keys(groups).forEach(function (category) {
        html += '<div class="category-group">';
        html += '<div class="category-title">' + category + '</div>';

        groups[category].forEach(function (item) {
            const isChecked = item.checked === 1;
            html += '<div class="item' + (isChecked ? ' checked' : '') + '">';
            html += '<input type="checkbox" ' + (isChecked ? 'checked' : '') +
                ' onchange="toggleItem(' + item.id + ')" aria-label="Mark ' + item.name + ' as picked up">';
            html += '<span>' + item.name + ' (x' + item.quantity + ')</span>';
            html += '<button onclick="deleteItem(' + item.id + ')">Delete</button>';
            html += '<button onclick="editItem(' + item.id + ')">Edit</button>';
            html += '</div>';
        });

        html += '</div>';
    });

    listEl.innerHTML = html;
}

function toggleItem(id) {
    fetch('/api/items/' + id + '/toggle', {
        method: 'PATCH'
    })
    .then(function () {
        loadItems();
    });
}

function deleteItem(id) {
    fetch('/api/items/' + id, {
        method: 'DELETE'
    })
    .then(function () {
        loadItems();
    });
}

function editItem(id) {
    const item = allItems.find(function (i) {
        return i.id === id;
    });

    if (!item) {
        return;
    }

    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-quantity').value = item.quantity;

    editingItemId = id;
    document.getElementById('form-submit-btn').textContent = 'Save Changes';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
}

function cancelEdit() {
    editingItemId = null;
    document.getElementById('add-item-form').reset();
    document.getElementById('item-quantity').value = '1';
    document.getElementById('form-submit-btn').textContent = 'Add Item';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

document.getElementById('add-item-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const nameInput = document.getElementById('item-name');
    const categoryInput = document.getElementById('item-category');
    const quantityInput = document.getElementById('item-quantity');

    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const quantity = parseInt(quantityInput.value, 10);

    if (!name) {
        alert('Please enter an item name.');
        return;
    }

    if (!category) {
        alert('Please select a category.');
        return;
    }

    const isEditing = editingItemId !== null;
    const url = isEditing ? '/api/items/' + editingItemId : '/api/items';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            category: category,
            quantity: quantity
        })
    })
    .then(function (response) {
        return response.json();
    })
    .then(function () {
        cancelEdit();
        loadItems();
    });
});

document.getElementById('clear-checked-btn').addEventListener('click', function () {
    fetch('/api/items/clear-checked', {
        method: 'DELETE'
    })
    .then(function () {
        loadItems();
    });
});

document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
loadItems();
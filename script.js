function loadItems() {
    fetch('/api/items')
        .then(function (response) {
            return response.json();
        })
        .then(function (items) {
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

    fetch('/api/items', {
        method: 'POST',
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
        nameInput.value = '';
        categoryInput.value = '';
        quantityInput.value = '1';
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

loadItems();
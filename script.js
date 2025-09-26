// Este es el "modelo" de tus productos
const menuData = {
    Comidas: [
        { id: 'c1', name: 'Hamburguesa Sencilla', price: 50, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c2', name: 'Hamburguesa Sencilla c/ Piña', price: 60, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c3', name: 'Hamburguesa Doble', price: 65, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c4', name: 'Hamburguesa Doble c/ Piña', price: 75, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c5', name: 'Hamburguesa c/ Aros de Cebolla', price: 75, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c6', name: 'Hot Dog', price: 17, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c7', name: 'Hot Dog c/ Tocino', price: 20, customizable: ['Sin cebolla', 'Sin catsup', 'Sin mostaza', 'Sin picante'] },
        { id: 'c8', name: 'Papas a la Francesa', price: 35, customizable: ['Sin sal', 'Extra catsup'] },
        { id: 'c9', name: 'Papas a la Francesa c/ Queso', price: 40, customizable: ['Sin sal'] },
        { id: 'c10', name: 'Nachos con Queso', price: 40, customizable: ['Sin jalapeños'] },
        { id: 'c11', name: 'Nachos con Carne', price: 55, customizable: ['Sin jalapeños'] },
        { id: 'c12', name: 'Banderillas', price: 25, customizable: [] },
        { id: 'c13', name: 'Aros de Cebolla', price: 40, customizable: [] },
        { id: 'c14', name: 'Alitas Adobadas BBQ', price: 70, customizable: [] },
        { id: 'c15', name: 'Refresco', price: 24, customizable: [] }
    ],
    Bebidas: [
        { id: 'b1', name: 'Refresco', price: 24, customizable: [] },
        { id: 'b2', name: 'Café', price: 15, customizable: ['Con leche', 'Sin azúcar'] },
        { id: 'b3', name: 'Té', price: 15, customizable: ['Con limón', 'Con miel'] }
    ],
    Postres: [
        { id: 'p1', name: 'Flan Napolitano', price: 30, customizable: [] },
        { id: 'p2', name: 'Pastel de Chocolate', price: 38, customizable: [] },
        { id: 'p3', name: 'Duraznos c/ Crema', price: 30, customizable: [] }
    ],
    Extras: [
        { id: 'e1', name: 'Queso Extra', price: 5, customizable: [] },
        { id: 'e2', name: 'Tocino Extra', price: 5, customizable: [] },
        { id: 'e3', name: 'Otro Extra', price: 5, customizable: [] }
    ]
};

const menuItemsContainer = document.querySelector('.menu-items');
const orderList = document.getElementById('order-list');
const totalPriceElement = document.getElementById('total-price');
const navButtons = document.querySelectorAll('.nav-button');
const sendOrderButton = document.getElementById('send-order');
const cancelOrderButton = document.getElementById('cancel-order');
const orderHistoryContainer = document.getElementById('order-list-history');
const clientNameInput = document.getElementById('client-name');

// Elementos del modal
const modal = document.getElementById('customization-modal');
const modalTitle = document.getElementById('modal-title');
const modalOptions = document.getElementById('modal-options');
const modalAddButton = document.getElementById('modal-add');
const modalCancelButton = document.getElementById('modal-cancel');

// Elementos de la nueva sección de Totales
const dailyTotalElement = document.getElementById('daily-total');
const closeDayButton = document.getElementById('close-day-button');

let currentOrder = [];
let selectedItem = null;
let currentCategory = 'Comidas';
let dailyTotal = 0;

// Funciones de localStorage para persistencia
function loadDailyTotal() {
    const savedTotal = localStorage.getItem('dailyTotal');
    if (savedTotal) {
        dailyTotal = parseFloat(savedTotal);
    }
    dailyTotalElement.textContent = `$${dailyTotal.toFixed(2)}`;
}

function saveDailyTotal() {
    localStorage.setItem('dailyTotal', dailyTotal);
    dailyTotalElement.textContent = `$${dailyTotal.toFixed(2)}`;
}

// Función para renderizar los productos en la vista
function renderMenuItems(category) {
    menuItemsContainer.innerHTML = '';
    const items = menuData[category] || [];
    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('menu-card');
        card.dataset.id = item.id;

        card.innerHTML = `
            <div class="menu-card-content no-image">
                <span class="menu-card-title">${item.name}</span>
                <span class="menu-card-price">$${item.price.toFixed(2)}</span>
            </div>
        `;
        menuItemsContainer.appendChild(card);
    });
}

function updateTotalPrice() {
    const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPriceElement.textContent = `$${total.toFixed(2)}`;
}

function updateOrderList() {
    orderList.innerHTML = '';
    currentOrder.forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add('order-item');
        listItem.innerHTML = `
            <span class="item-info">
                ${item.quantity > 1 ? `<span class="item-quantity">${item.quantity}x</span>` : ''}
                ${item.name}
                ${item.customizations.length > 0 ? `<small>(${item.customizations.join(', ')})</small>` : ''}
            </span>
            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-item" data-id="${item.id}" data-customizations="${item.customizations.join(',')}">&times;</button>
        `;
        orderList.appendChild(listItem);
    });
    updateTotalPrice();
}

// Lógica ajustada para diferenciar productos con diferentes personalizaciones
function addItemToOrder(id, name, price, customizations = []) {
    // Convierte el array de personalizaciones a un string para compararlo
    const customizationsString = customizations.sort().join(',');

    // Busca un artículo existente con el mismo ID y las mismas personalizaciones
    const existingItem = currentOrder.find(item => 
        item.id === id && item.customizations.sort().join(',') === customizationsString
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.push({ id, name, price, quantity: 1, customizations });
    }
    updateOrderList();
}

// Lógica del modal que ahora es dinámica
function showCustomizationModal(item) {
    selectedItem = item;
    modalTitle.textContent = `Personalizar ${item.name}`;
    modalOptions.innerHTML = ''; // Limpia las opciones

    if (item.customizable && item.customizable.length > 0) {
        item.customizable.forEach(option => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="customization" value="${option}"> ${option}`;
            modalOptions.appendChild(label);
        });
        modalAddButton.style.display = 'block'; // Asegura que el botón esté visible
    } else {
        modalOptions.innerHTML = '<p>Este producto no tiene opciones de personalización.</p>';
        // Oculta el botón "Agregar" si no hay opciones
        modalAddButton.style.display = 'none';
    }

    modal.classList.add('is-visible');
}

function createNewCommand(clientName, orderItems, total) {
    const commandElement = document.createElement('div');
    commandElement.classList.add('command');
    commandElement.innerHTML = `
        <div class="command-header">
            <h4>Pedido para: ${clientName || 'Cliente sin nombre'}</h4>
            <span class="command-total">$${total.toFixed(2)}</span>
        </div>
        <ul class="command-list">
            ${orderItems.map(item => `<li>${item.quantity}x ${item.name}${item.customizations.length > 0 ? ` (${item.customizations.join(', ')})` : ''}</li>`).join('')}
        </ul>
        <div class="command-buttons">
            <button class="paid-button">Pagada</button>
        </div>
    `;

    commandElement.querySelector('.paid-button').addEventListener('click', () => {
        dailyTotal += total;
        saveDailyTotal();
        commandElement.remove();
    });

    orderHistoryContainer.appendChild(commandElement);
}

// Event Listeners
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        navButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.category;
        renderMenuItems(currentCategory);
    });
});

menuItemsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-card');
    if (card) {
        const selectedProduct = Object.values(menuData).flat().find(item => item.id === card.dataset.id);

        if (selectedProduct) {
            if (selectedProduct.customizable && selectedProduct.customizable.length > 0) {
                showCustomizationModal(selectedProduct);
            } else {
                addItemToOrder(selectedProduct.id, selectedProduct.name, selectedProduct.price);
            }
        }
    }
});

modalAddButton.addEventListener('click', () => {
    const selectedOptions = Array.from(modalOptions.querySelectorAll('input:checked')).map(input => input.value);
    
    if (selectedItem) {
        // Usa la nueva lógica de addItemToOrder para manejar personalizaciones
        addItemToOrder(selectedItem.id, selectedItem.name, selectedItem.price, selectedOptions);
        modal.classList.remove('is-visible');
        modalAddButton.style.display = '';
    }
});

modalCancelButton.addEventListener('click', () => {
    modal.classList.remove('is-visible');
    modalAddButton.style.display = '';
});

orderList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        const idToRemove = e.target.dataset.id;
        const customizationsToRemove = e.target.dataset.customizations.split(',');

        const itemIndex = currentOrder.findIndex(item => 
            item.id === idToRemove && 
            item.customizations.sort().join(',') === customizationsToRemove.sort().join(',')
        );

        if (itemIndex > -1) {
            currentOrder.splice(itemIndex, 1);
            updateOrderList();
        }
    }
});

sendOrderButton.addEventListener('click', () => {
    const clientName = clientNameInput.value;
    if (currentOrder.length > 0) {
        const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
        createNewCommand(clientName, currentOrder, total);
        
        currentOrder = [];
        clientNameInput.value = '';
        updateOrderList();
        alert('Orden enviada a la cocina.');
    } else {
        alert('La orden está vacía. Por favor, agrega productos.');
    }
});

cancelOrderButton.addEventListener('click', () => {
    const confirmCancel = confirm('¿Estás seguro de que deseas cancelar la orden?');
    if (confirmCancel) {
        currentOrder = [];
        clientNameInput.value = '';
        updateOrderList();
    }
});

closeDayButton.addEventListener('click', () => {
    const confirmClose = confirm(`¿Estás seguro de que deseas cerrar el día? El total de ventas es de $${dailyTotal.toFixed(2)}`);
    if (confirmClose) {
        localStorage.removeItem('dailyTotal');
        dailyTotal = 0;
        dailyTotalElement.textContent = `$0.00`;
        alert('Cierre de día realizado. El total de ventas se ha reseteado.');
    }
});

// Inicializa la página y carga el total del día al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems('Comidas');
    loadDailyTotal();
});
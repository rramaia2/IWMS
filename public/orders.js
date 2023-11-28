// orders.js

document.addEventListener('DOMContentLoaded', function () {
    const orderList = document.getElementById('order-list');

    function addOrderToTable(order) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${order.order_id}</td><td>${order.product_name}</td><td>${order.quantity}</td>`;

        orderList.appendChild(tr);
    }

    function getOrdersFromServer() {
        fetch('/get-orders')
            .then((response) => response.json())
            .then((orders) => {
                orderList.innerHTML = '';

                orders.forEach((order) => {
                    addOrderToTable(order);
                });
            })
            .catch((error) => console.error(error));
    }

    // Load existing orders from the server on page load
    getOrdersFromServer();

    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = orderForm.querySelector('input[name="productName"]').value;
        const quantity = orderForm.querySelector('input[name="quantity"]').value;

        // Call the server to place the order
        placeOrderToServer(productName, quantity);
        orderForm.reset();
    });

    function placeOrderToServer(productName, quantity) {
        fetch('/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productName, quantity }),
        })
            .then((response) => response.text())
            .then((message) => {
                console.log(message);
                // Assuming the order was successfully placed, add it to the table
                getOrdersFromServer();
            })
            .catch((error) => console.error(error));
    }
});

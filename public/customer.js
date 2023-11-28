// customer.js

document.addEventListener('DOMContentLoaded', function () {
    const placeOrderForm = document.getElementById('place-order-form');

    placeOrderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const productName = placeOrderForm.querySelector('input[name="productName"]').value;
        const quantity = placeOrderForm.querySelector('input[name="quantity"]').value;

        // Call the server to place the order
        placeOrder(productName, quantity);
    });

    function placeOrder(productName, quantity) {
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
                // Assuming the order was successfully placed, you can update the order list on the customer page
                // Optionally, you can redirect to the orders page or update the orders dynamically
                // For simplicity, let's reload the page
                window.location.reload();
            })
            .catch((error) => console.error(error));
    }
});

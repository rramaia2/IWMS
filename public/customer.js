// customer.js

document.addEventListener('DOMContentLoaded', function () {
    const placeOrderForm = document.getElementById('place-order-form');
    const productAvailabilityTable = document.getElementById('product-availability-table');

    placeOrderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const productName = placeOrderForm.querySelector('input[name="productName"]').value;
        const quantity = placeOrderForm.querySelector('input[name="quantity"]').value;

        // Check if the product is available before placing the order
        checkProductAvailability(productName, quantity);
    });

    function checkProductAvailability(productName, quantity) {
        // Fetch the product availability from the server
        fetch('/get-product-availability')
            .then((response) => response.json())
            .then((availability) => {
                // Find the selected product's availability
                const selectedProductAvailability = availability.find((product) => product.name === productName);

                if (selectedProductAvailability) {
                    // If the product is available, proceed to place the order
                    placeOrder(productName, quantity);
                } else {
                    // If the product is not available, show a pop-up message
                    alert('The Product is Out of Stock');
                }
            })
            .catch((error) => console.error(error));
    }

    function placeOrder(productName, quantity) {
        // Call the server to place the order
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

    // Load and display product availability table
    fetch('/get-product-availability')
        .then((response) => response.json())
        .then((availability) => {
            displayProductAvailabilityTable(availability);
        })
        .catch((error) => console.error(error));

    function displayProductAvailabilityTable(availability) {
        const tableBody = productAvailabilityTable.querySelector('tbody');
        tableBody.innerHTML = '';

        availability.forEach((product) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${product.product_id}</td><td>${product.name}</td><td>${product.availability}</td>`;
            tableBody.appendChild(tr);
        });
    }
});

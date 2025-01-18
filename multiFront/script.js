// script.js
const orderForm = document.getElementById("orderForm");
const openOrdersList = document.getElementById("openOrdersList");
const placedOrdersList = document.getElementById("placedOrdersList");
const tabs = document.querySelectorAll(".tab");
const tabPanes = document.querySelectorAll(".tab-pane");
const orderTabs = document.querySelectorAll(".order-tab");
const orderTabContents = document.querySelectorAll(".order-tab-content");

const apiBaseUrl = "https://api.example.com/orders"; // Replace with your actual API base URL


// Add new open order
function addOpenOrder(order) {
  const li = document.createElement("li");
  li.innerHTML = `
    ${order.stockName} - ${order.price} - ${order.quantity}
    <div>
      <button class="edit">Edit</button>
      <button class="cancel">Cancel</button>
    </div>
  `;
  
  openOrdersList.appendChild(li);

  // Edit button
  li.querySelector(".edit").addEventListener("click", () => {
    console.log("Edit order", order);
    // Implement edit order functionality (e.g., pre-populate the form with current values)
  });

  // Cancel button
  li.querySelector(".cancel").addEventListener("click", () => {
    console.log("Cancel order", order);
    // Implement cancel order functionality (e.g., delete order via API)
  });
}

// Add placed order
function addPlacedOrder(order) {
  const li = document.createElement("li");
  li.innerHTML = `
    ${order.stockName} - ${order.price} - ${order.quantity}
    <div>
      <button class="buy">Buy</button>
      <button class="sell">Sell</button>
      <button class="exit">Exit</button>
    </div>
  `;
  placedOrdersList.appendChild(li);

  // Buy button
  li.querySelector(".buy").addEventListener("click", () => {
    console.log("Buy order", order);
    // Implement buy order functionality (e.g., send buy request via API)
  });

  // Sell button
  li.querySelector(".sell").addEventListener("click", () => {
    console.log("Sell order", order);
    // Implement sell order functionality (e.g., send sell request via API)
  });

  // Exit button
  li.querySelector(".exit").addEventListener("click", () => {
    console.log("Exit order", order);
    // Implement exit order functionality (e.g., cancel order and close position)
  });
}

// Tab switching logic
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === tab.dataset.tab);
    });
  });
});

// Handle tab switching for order types (Regular/Stoploss)
orderTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    orderTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    orderTabContents.forEach((content) => {
      content.classList.toggle("active", content.id === tab.dataset.tab);
    });
  });
});

// Sample data (replace with actual API call data)
const openOrders = [
  { stockName: "AAPL", price: 145.30, quantity: 10 },
  { stockName: "GOOG", price: 2730.15, quantity: 5 }
];

const placedOrders = [
    { stockName: "MSFT", price: 300.25, quantity: 15 },
    { stockName: "AMZN", price: 3450.50, quantity: 3 }
    ];

// Display sample placed orders
placedOrders.forEach((order) => addPlacedOrder(order));

// Display sample open orders
openOrders.forEach((order) => addOpenOrder(order));


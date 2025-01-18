// formHandler.js

document.getElementById("orderForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the usual way
  
    // Get the selected values for each field
    const actionType = document.querySelector('input[name="actionType"]:checked').value; // 'buyOption' or 'sellOption'
    const stockName = document.getElementById("stockName").value;
    const orderType = document.querySelector('input[name="orderType"]:checked').value; // 'mktOption' or 'limitOption'
    const price = document.getElementById("price").value;
    const slTriggerPrice = document.getElementById("slTriggerPrice").value;
    const slLimitPrice = document.getElementById("slLimitPrice").value;
    const quantity = document.getElementById("quantity").value;
    const productType = document.querySelector('input[name="productType"]:checked').value; // 'btnradio1' or 'btnradio2'
  
    // Prepare the data to be sent to the API
    const orderData = {
      transactiontype: actionType, // 'buyOption' or 'sellOption'
      symbol: stockName,
      ordertype: orderType, // 'mktOption' or 'limitOption'
      price: price,
      duration: 'DAY',
      squareoff: slTriggerPrice,
      stoploss: slLimitPrice,
      lots: quantity,
      producttype: productType, // 'btnradio
    };
  
    console.log(orderData);
    // Call the API to place the order
    placeOrder(orderData)
      .then((data) => {
        if (data.success) {
          alert('Order placed successfully!');
        } else {
          alert('Error placing order: ' + data.message);
        }
      })
      .catch((error) => {
        alert('There was an error placing the order.');
      });
  });
  



// Function to place the order using data from the form
function placeOrder(orderData) {
    // Sending the order data to the API via a POST request
    return fetch('http://localhost:3000/api/placeorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Ensures the API expects JSON data
      },
      body: JSON.stringify(orderData), // Convert the order data to JSON format
    })
      .then(response => response.json()) // Parse the response into JSON
      .then(data => {
        return data; // Return the API response
      })
      .catch(error => {
        console.error('Error placing order:', error); // Handle error
      });
  }
  
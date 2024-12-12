var axios = require("axios");
const { Accounts } = require("../models/accounts");
const { Tokens } = require("../models/tokensmap");
const { getLocalIP, getMacAddress } = require("../middlewares/systemdetails");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

// old
// const  placeOrder = async (req, res) => {
//   const Account = await Accounts.find({});

//   const reqData = req.body;
//   const symb = req.body.symbol;
//   console.log(symb);

//   // // get token and symbol
//   const response = await Tokens.find({
//     symbol : reqData.symbol,
//   })
//   const TokenData = response[0];

//   console.log(TokenData[0]);
//   // return res.json(TokenData[0]);

//   Account.map(async (account) => {
//     try {
//       // getting data
//       const pip = await axios.get("https://api64.ipify.org?format=json");
//       const Pip = pip.data.ip;
//       const localIP = getLocalIP();
//       const macAddress = getMacAddress();
//       const AUTH_TOKEN = account.jwtToken;

//       var clientCode = account.clientCode;
//       console.log("clientcode ", clientCode);

//       const PrivateKey = account.apiKey;

//       // "token": "3045",
//       //   "symbol": "SBIN-EQ",
//       //   "name": "SBIN",
//       //   "expiry": "",
//       //   "strike": "-1.000000",
//       //   "lotsize": "1",
//       //   "instrumenttype": "",
//       //   "exch_seg": "NSE",
//       //   "tick_size": "5.000000"

//       // "token": "41610",
//       //   "symbol": "BANKNIFTY24DEC2442500CE",
//       //   "name": "BANKNIFTY",
//       //   "expiry": "24DEC2024",
//       //   "strike": "4250000.000000",
//       //   "lotsize": "15",
//       //   "instrumenttype": "OPTIDX",
//       //   "exch_seg": "NFO",
//       //   "tick_size": "5.000000"

//       // "variety":"NORMAL",
//       // "tradingsymbol":"SBIN-EQ",
//       // "symboltoken":"3045",
//       // "transactiontype":"BUY",
//       // "exchange":"NSE",
//       // "ordertype":"MARKET",
//       // "producttype":"INTRADAY",
//       // "duration":"DAY",
//       // "price":"194.50",
//       // "squareoff":"0",
//       // "stoploss":"0",
//       // "quantity":"1"

//       var data = JSON.stringify({
//         "variety":            reqData.variety,  // normal or stop loss
//         "tradingsymbol":      TokenData.symbol, // name of index
//         "symboltoken":        TokenData.token,
//         "transactiontype":    reqData.transactiontype, // buy or sale
//         "exchange":           TokenData.exch_seg,  // bse , nse, nfo
//         "ordertype":          reqData.ordertype,  //mkt or limit
//         "producttype":        reqData.producttype, // cf or intraday
//         "duration":           reqData.duration, // ioc or day
//         "price":              reqData.price, // price
//         "quantity":           reqData.lots,  // lot
//         "squareoff":          reqData.squareoff,
//         "stoploss":           reqData.stoploss,
//       });

//       var config = {
//         method: "post",
//         url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder",
//         headers: {
//           "Authorization": `Bearer ${AUTH_TOKEN}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "X-UserType": "USER",
//           "X-SourceID": "WEB",
//           "X-ClientLocalIP": localIP,
//           "X-ClientPublicIP": Pip,
//           "X-MACAddress": macAddress,
//           "X-PrivateKey": PrivateKey,
//         },
//         data: data,
//       };

//       axios(config)
//         .then(function (response) {
//           console.log(JSON.stringify(response.data));
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     } catch (error) {
//       return res.status(401).send(error.message);
//     }
//   });
// };


const placeOrder = async (req, res) => {
  try {
    const Account = await Accounts.find({});
    const reqData = req.body;

    // Get token and symbol
    const response = await Tokens.find({ symbol: reqData.symbol });
    const TokenData = response[0];
    const lotsize = TokenData.lotsize;
    const qt = lotsize * reqData.lots;
    // console.log(TokenData);

    // Function to get the required data for each account
    const promises = Account.map(async (account) => {
      try {
        // Fetching IP and other details
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();
        const AUTH_TOKEN = account.jwtToken;

        const data = JSON.stringify({
          variety: reqData.variety, // normal or stop loss
          tradingsymbol: TokenData.symbol, // name of index
          symboltoken: TokenData.token,
          transactiontype: reqData.transactiontype, // buy or sale
          exchange: TokenData.exch_seg, // bse, nse, nfo
          ordertype: reqData.ordertype, // mkt or limit
          producttype: reqData.producttype, // cf or intraday
          duration: reqData.duration, // ioc or day
          price: reqData.price, // price
          quantity: qt, // lot
          squareoff: reqData.squareoff,
          stoploss: reqData.stoploss,
        });

        const config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
          data: data,
        };

        // Execute the API call
        const response = await axios(config);

        //update the order name and u_id into account
        await account.updateOne({
          orders: {
            name: response.data.script,
            u_id: response.data.uniqueorderid,
          },
        });

        console.log(
          `Success for clientCode ${account.clientCode}:`,
          response.data
        );
        return {
          success: true,
          clientCode: account.clientCode,
          data: response.data,
        };
      } catch (error) {
        console.error(
          `Error for clientCode ${account.clientCode}:`,
          error.message
        );
        return {
          success: false,
          clientCode: account.clientCode,
          error: error.message,
        };
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error in placeOrder:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const modifyOrder = async (req, res) => {
  try {
    const Account = await Accounts.find({});
    const reqData = req.body;

    // Get token and symbol
    const response = await Tokens.find({ symbol: reqData.symbol });
    const TokenData = response[0];
    const lotsize = TokenData.lotsize;
    const qt = lotsize * reqData.lots;
    // console.log(TokenData);

    // Function to get the required data for each account
    const promises = Account.map(async (account) => {
      try {
        // Fetching IP and other details
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();
        const AUTH_TOKEN = account.jwtToken;

        // find the unique order id by searching in the accounts order array by combinig two things
        const odr_data = account.findOne((orders.name = req.data.name));
        const uorder_id = odr_data.u_id;

        // fetch order details via order id and then populate in the modify order field this is done in the frontend part

        var orderHead = {
          method: "get",
          url: `https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/details/${uorder_id}`,
          headers: {
            "X-PrivateKey": `Bearer ${AUTH_TOKEN}`,
            "Accept": "application/json, application/json",
            "Content-Type": "application/json",
            "X-SourceID": "WEB, WEB",
            "X-UserType": "USER",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
        };
        const orderData = await axios(orderHead);

        // this data is for modifying order
        const data = JSON.stringify({
          variety: orderData.data.variety, // normal or stop loss
          orderid: orderData.data.orderid, // order id
          ordertype: reqData.ordertype, // mkt or limit
          producttype: orderData.data.producttype, // cf or intraday

          duration: reqData.duration, // ioc or day
          price: reqData.price, // price
          quantity: qt, // lot
          squareoff: reqData.squareoff,
          stoploss: reqData.stoploss,
        });

        const config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/modifyOrder",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
          data: data,
        };

        // Execute the API call

        if (orderData.data.status === "pending") {
          const response = await axios(config);
          console.log(
            `Modify Success for clientCode ${account.clientCode}:`,
            response.data
          );
          return {
            success: false,
            clientCode: account.clientCode,
            data: response.data,
          };
        }

        // update order id into my account schema

        return {
          success: true,
          clientCode: account.clientCode,
          data: "Order is alrady placed can't modify",
        };
      } catch (error) {
        console.error(
          `Error for clientCode ${account.clientCode}:`,
          error.message
        );
        return {
          success: false,
          clientCode: account.clientCode,
          error: error.message,
        };
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error in placeOrder:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const Account = await Accounts.find({});
    const reqData = req.body;

    // Get token and symbol
    const response = await Tokens.find({ symbol: reqData.symbol });
    const TokenData = response[0];
    const lotsize = TokenData.lotsize;
    const qt = lotsize * reqData.lots;
    // console.log(TokenData);

    // Function to get the required data for each account
    const promises = Account.map(async (account) => {
      try {
        // Fetching IP and other details
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();
        const AUTH_TOKEN = account.jwtToken;

        // find the unique order id by searching in the accounts order array by combinig two things
        const odr_data = await account.findOne((orders.name = req.data.name));
        const uorder_id = odr_data.u_id;

        var orderHead = {
          method: "get",
          url: `https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/details/${uorder_id}`,
          headers: {
            "X-PrivateKey": `Bearer ${AUTH_TOKEN}`,
            Accept: "application/json, application/json",
            "Content-Type": "application/json",
            "X-SourceID": "WEB, WEB",
            "X-UserType": "USER",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
        };
        const orderData = await axios(orderHead);

        // this data is for modifying order
        const data = JSON.stringify({
          variety: orderData.data.variety, // normal or stop loss
          orderid: orderData.data.orderid, // order id
        });

        const config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/cancelOrder",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
          data: data,
        };

        // Execute the API call

        if (orderData.data.status === "pending") {
          const response = await axios(config);
          
          //update the order name and u_id into account
        await account.deleteOne({
          orders: {
            name: response.data.script,
            u_id: response.data.uniqueorderid,
          },
        });
          console.log(
            `Cancel order Success for clientCode ${account.clientCode}:`,
            response.data
          );
          return {
            success: false,
            clientCode: account.clientCode,
            data: response.data,
          };
        }

        // update order id into my account schema

        return {
          success: true,
          clientCode: account.clientCode,
          data: "Order is alrady placed can't cancel",
        };
      } catch (error) {
        console.error(
          `Error for clientCode ${account.clientCode}:`,
          error.message
        );
        return {
          success: false,
          clientCode: account.clientCode,
          error: error.message,
        };
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error in placeOrder:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const exitOrder = async (req, res) => {
  try {
    const Account = await Accounts.find({});
    const reqData = req.body;

    // Get token and symbol
    const response = await Tokens.find({ symbol: reqData.symbol });
    const TokenData = response[0];
    const lotsize = TokenData.lotsize;
    const qt = lotsize * reqData.lots;
    // console.log(TokenData);

    // Function to get the required data for each account
    const promises = Account.map(async (account) => {
      try {
        // Fetching IP and other details
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();
        const AUTH_TOKEN = account.jwtToken;

        // get accound details here from the order unique id
        // find the unique order id by searching in the accounts order array by combinig two things
        const odr_data = account.findOne((orders.name = req.data.name));
        const uorder_id = odr_data.u_id;

        // fetch order details via order id and then populate in the modify order field this is done in the frontend part

        var orderHead = {
          method: "get",
          url: `https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/details/${uorder_id}`,
          headers: {
            "X-PrivateKey": `Bearer ${AUTH_TOKEN}`,
            "Accept": "application/json, application/json",
            "Content-Type": "application/json",
            "X-SourceID": "WEB, WEB",
            "X-UserType": "USER",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
        };
        const orderData = await axios(orderHead);

        let transaction = 'SELL'
        // TANSACTION TYPE
        if(orderData.data.transactiontype === 'SELL'){
          transaction =  'BUY'
        }


        // this data is for the order
        const data = JSON.stringify({

          variety: orderData.data.variety, // normal or stop loss
          tradingsymbol: TokenData.symbol, // name of index
          symboltoken: TokenData.token,
          exchange: TokenData.exch_seg, // bse, nse, nfo
          orderid: orderData.data.orderid, // order id
          ordertype: "MARKET", // mkt or limit
          transactiontype: transaction, // buy or sale
          producttype: orderData.data.producttype, // cf or intraday
          duration: orderData.data.duration, // ioc or day
      // TODO : check for price and quantity as lot quantitiy may be differe and the req price may be change
          // price: reqData.price, // price
          quantity: orderData.data.quantity, // lot

        });

        const config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": account.apiKey,
          },
          data: data,
        };

        // Execute the API call
        const response = await axios(config);

        //update the order name and u_id into account
        await account.deleteOne({
          orders: {
            name: response.data.script,
            u_id: response.data.uniqueorderid,
          },
        });

        console.log(
          `Success for clientCode ${account.clientCode}:`,
          response.data
        );
        return {
          success: true,
          clientCode: account.clientCode,
          data: response.data,
        };
      } catch (error) {
        console.error(
          `Error for clientCode ${account.clientCode}:`,
          error.message
        );
        return {
          success: false,
          clientCode: account.clientCode,
          error: error.message,
        };
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error in placeOrder:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { placeOrder, modifyOrder, cancelOrder, exitOrder };

var axios = require("axios");
const { Accounts } = require("../models/accounts");
const { Tokens } = require("../models/tokensmap");
const { getLocalIP, getMacAddress } = require("../middlewares/systemdetails");
const bodyParser = require("body-parser");
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

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
        console.log(`Success for clientCode ${account.clientCode}:`, response.data);
        return { success: true, clientCode: account.clientCode, data: response.data };
      } catch (error) {
        console.error(`Error for clientCode ${account.clientCode}:`, error.message);
        return { success: false, clientCode: account.clientCode, error: error.message };
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

//modify order
const modifyOrder = async (req, res) => {
  const Accounts = await Account.find({});

  const reqData = req.body;

  Accounts.map(async (account) => {
    try {
      // getting data
      const pip = await axios.get("https://api64.ipify.org?format=json");
      const Pip = pip.data.ip;
      const localIP = getLocalIP();
      const macAddress = getMacAddress();
      const AUTH_TOKEN = account.jwtToken;

      var clientCode = account.clientCode;
      console.log("clientcode ", clientCode);

      const PrivateKey = account.apiKey;

      var data = JSON.stringify({
        
        "variety":            reqData.variety,
        "tradingsymbol":      reqData.tradingsymbol,
        "symboltoken":        reqData.symboltoken,
        "transactiontype":    reqData.transactiontype,
        "exchange":           reqData.exchange,
        "ordertype":          reqData.ordertype,
        "producttype":        reqData.producttype,
        "duration":           reqData.duration,
        "price":              reqData.price,
        "squareoff":          reqData.squareoff,
        "stoploss":           reqData.stoploss,
        "quantity":           reqData.quantity,
        
      });

      var config = {
        method: "post",
        url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder",
        headers: {
          "Authorization": `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": localIP,
          "X-ClientPublicIP": Pip,
          "X-MACAddress": macAddress,
          "X-PrivateKey": PrivateKey,
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {}
  });
};

// cancel order
const cancelOrder=  async (req, res) => {
    const Accounts = await Account.find({});
  
    const reqData = req.body;
  
    Accounts.map(async (account) => {
      try {
        // getting data
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();
        const AUTH_TOKEN = account.jwtToken;
  
        var clientCode = account.clientCode;
        console.log("clientcode ", clientCode);
  
        const PrivateKey = account.apiKey;
  
        var data = JSON.stringify({
         "variety":  reqData.variety,
         "orderid": account.orderid,
        });
  
        var config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/cancelOrder",
          headers: {
            "Authorization": `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": PrivateKey,
          },
          data: data,
        };
  
        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {}
    });
  };

module.exports = {placeOrder, modifyOrder, cancelOrder};
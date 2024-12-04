var axios = require("axios");
const { Account } = require("../models/accounts");
const { generateTOTP } = require("../middlewares/getTOTP");
const { getLocalIP, getMacAddress } = require("../middlewares/systemdetails");
const router = express.Router();

const  placeOrder = async (req, res) => {
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
          "Authorization": AUTH_TOKEN,
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

      const PrivateKey = account.privateKey;

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
          "Authorization": AUTH_TOKEN,
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
  
        const PrivateKey = account.privateKey;
  
        var data = JSON.stringify({
         "variety":  reqData.variety,
         "orderid": account.orderid,
        });
  
        var config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/cancelOrder",
          headers: {
            "Authorization": AUTH_TOKEN,
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
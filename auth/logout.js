const axios = require("axios");
const { getLocalIP, getMacAddress } = require("../middlewares/systemdetails");
const { Accounts } = require("../models/accounts");



const logout = async (req, res) => {
    const Account = await Accounts.find({});
    console.log(Account);
  
    Account.map(async (account) => {
      try {
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();
  
        var clientCode = account.clientCode;
        console.log("clientcode ",clientCode);
        const PrivateKey = account.privateKey;
        const AUTH_TOKEN  = account.jwtToken;
  
        var data = JSON.stringify({
          clientcode: clientCode,
        });
  
        var config = {
          method: "post",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/logout",
  
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": PrivateKey,
          },
          data: data,
        };
  
        axios(config)
          .then(function (response) {
            console.log(response.data);
            // // updating token details after login
            // const tokenUpdate = updateAccountTokens(
            //   account.clientCode,
            //   response.data.jwtToken,
            //   response.data.refreshToken,
            //   response.data.feedToken,
            // );
            // console.log(`Updated tokens of:${clientCode}`, tokenUpdate);
  
            res.send(response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {
        console.error(
          `Error in logout Api at Account : ${account.clientCode}`,
          error.message
        );
      }
    });
  }

module.exports = {logout};
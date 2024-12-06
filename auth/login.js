const axios = require("axios");
const { generateTOTP } = require("../middlewares/getTOTP");
const { getLocalIP, getMacAddress } = require("../middlewares/systemdetails");
const { Accounts } = require("../models/accounts");
const { updateAccountTokens } = require("../controllers/accountController");

//old
// const login = async (req, res) => {
//   const Account = await Accounts.find({});
//   console.log(Account);

//   Account.map(async (account) => {
//     try {
//       const pip = await axios.get("https://api64.ipify.org?format=json");
//       const Pip = pip.data.ip;
//       const localIP = getLocalIP();
//       const macAddress = getMacAddress();

//       var cc = account.clientCode;
//       console.log("clientcode ",cc);

//       const password = account.password;
//       const TOTP = await generateTOTP(account.totpKey);
//       const PrivateKey = account.apiKey;

//       const data = JSON.stringify({
//         clientcode: cc,
//         password: password,
//         totp : TOTP,
//         // "state":"STATE_VARIABLE"
//       });

//       var config = {
//         method: "post",
//         url: "https://apiconnect.angelone.in//rest/auth/angelbroking/user/v1/loginByPassword",

//         headers: {
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
//         .then( async (response) => {
//           console.log(response.data);

//           // // updating token details after login
//           const tokenUpdate = await updateAccountTokens(
//             account.clientCode,
//             response.data.data.jwtToken,
//             response.data.data.refreshToken,
//             response.data.data.feedToken,
//           );
//           console.log(`Updated tokens of:${account.clientCode}`, tokenUpdate);

//           return res.status(201).json({ message: 'Token updated successfully!', token: tokenUpdate.clientcode });
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     } catch (error) {
//       console.error(
//         `Error in login Api at Account : ${account.clientCode}`,
//         error.message
//       );
//     }
//   });
// };

// new

const login = async (req, res) => {
  try {
    const accounts = await Accounts.find({});
    // console.log(accounts);

    const results = await Promise.all(
      accounts.map(async (account) => {
        try {
          const pip = await axios.get("https://api64.ipify.org?format=json");
          const Pip = pip.data.ip;
          const localIP = getLocalIP();
          const macAddress = getMacAddress();

          const clientCode = account.clientCode;
          // console.log("clientcode ", clientCode);

          const password = account.password;
          const TOTP = await generateTOTP(account.totpKey);
          const PrivateKey = account.apiKey;

          const data = JSON.stringify({
            clientcode: clientCode,
            password: password,
            totp: TOTP,
          });

          const config = {
            method: "post",
            url: "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-UserType": "USER",
              "X-SourceID": "WEB",
              "X-ClientLocalIP": localIP,
              "X-ClientPublicIP": Pip,
              "X-MACAddress": macAddress,
              "X-PrivateKey": PrivateKey,
            },
            data: data,
          };

          const response = await axios(config);
          // console.log(response.data);
          console.log(`login success in ${clientCode}..`);

          // Update token details after login
          const tokenUpdate = await updateAccountTokens(
            account.clientCode,
            response.data.data.jwtToken,
            response.data.data.refreshToken,
            response.data.data.feedToken
          );
          console.log(`Updated tokens of:${clientCode}`);

          return { success: true, clientCode };
        } catch (error) {
          console.error(
            `Error in login Api at Account: ${account.clientCode}`,
            error.message
          );
          return { success: false, clientCode: account.clientCode };
        }
      })
    );

    // Send the results
    return res
      .status(201)
      .json({ message: "Login and token update process completed", results });
  } catch (error) {
    console.error(
      "Error fetching accounts or processing login:",
      error.message
    );
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getProfile = async (req, res) => {
  const Account = await Accounts.find({});
  // console.log(Account);

  const results = await Promise.all(
    Account.map(async (account) => {
      try {
        const pip = await axios.get("https://api64.ipify.org?format=json");
        const Pip = pip.data.ip;
        const localIP = getLocalIP();
        const macAddress = getMacAddress();

        var clientCode = account.clientCode;
        // console.log("clientcode ", clientCode);
        const PrivateKey = account.apiKey;
        const AUTH_TOKEN = account.jwtToken;

        var data = JSON.stringify({
          clientcode: clientCode,
        });

        var config = {
          method: "get",
          url: "https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getProfile",

          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": localIP,
            "X-ClientPublicIP": Pip,
            "X-MACAddress": macAddress,
            "X-PrivateKey": PrivateKey,
          },
        };

        axios(config)
          .then(function (response) {
            // console.log(response.data);
            console.log(`Got data success in ${clientCode}..`);
            res.send(response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {
        console.error(
          `Error in GetProfile Api at Account : ${account.clientCode}`,
          error.message
        );
      }
    })
  );
};

module.exports = { login, getProfile };

const {Accounts} = require("../models/accounts");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

const addNewAccount = async (req, res) => {
  try {
    const { clientCode, password, totpKey, apiKey } = req.body;
    console.log(req.body);

    const isPresent = await Accounts.findOne({ clientCode });
    if (isPresent) {
      console.log(`Account with clientCode ${clientCode} found. Updating.`);
      const updatedAccount = await Accounts.findOneAndUpdate(
        { clientCode },
        { $set: { password, totpKey, apiKey } },
        { new: true }
      );
      return res.status(200).json({ message: 'Account updated successfully!', account: updatedAccount });
    }

    console.log(`No account with clientCode ${clientCode} found. Creating new.`);
    const newAccount = new Accounts({
      clientCode,
      password,
      totpKey,
      apiKey,
    });

    await newAccount.save();
    return res.status(201).json({ message: 'Account added successfully!', account: newAccount });
  } catch (error) {
    console.error("Error adding/updating account:", error.message);
    return res.status(500).json({ message: 'Error adding account', error: error.message });
  }
};


// Function to update account tokens
const updateAccountTokens = async (clientCode, jwtToken, refreshToken, feedToken) => {
  try {

    const updatedAccount = await Accounts.findOneAndUpdate(
      {clientCode},
      { $set: { jwtToken, refreshToken, feedToken, updatedAt: Date.now() } },
      { new: true }
    );

    if (!updatedAccount) {
        console.log('Account not found');
        return res.status(401).json({ message: "Account not found!"})
    }

    return updatedAccount;
  } catch (error) {
    console.log(`Error updating tokens: ${error.message}`);
    return res.status(401).json({ message: "Error updating tokens", err : error.message });
  }
};

module.exports = { addNewAccount, updateAccountTokens };

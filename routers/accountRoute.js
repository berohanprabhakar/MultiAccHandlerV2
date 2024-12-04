const express = require("express");
const app = express();
const router = express.Router();

const {addNewAccount, updateAccountTokens} = require("../controllers/accountController");

router.post("/addAccount", addNewAccount);

const express = require("express");
const app = express();
const router = express.Router();

const {addNewAccount} = require("../controllers/accountController");
const { login, getProfile } = require("../auth/login");
const { logout } = require("../auth/logout");

router.post("/addAccount", addNewAccount);
router.get("/login", login);
router.get("/logout", logout);
router.get("/getProfile", getProfile);

module.exports = router;
const express = require("express");
const app = express();
const router = express.Router();

const {addNewAccount} = require("../controllers/accountController");
const { login, getProfile } = require("../auth/login");
const { logout } = require("../auth/logout");
const { getTokens } = require("../middlewares/getToken");
const { placeOrder, exitOrder, modifyOrder, cancelOrder } = require("../controllers/orderController");


router.post("/addAccount", addNewAccount);
router.get("/login", login);
router.get("/logout", logout);
router.get("/getProfile", getProfile);
router.get("/updateTokens", getTokens);
router.post("/placeOrder", placeOrder);
router.post("/exitOrder", exitOrder); // TODO : these three are post routes because i have to give name of index via req.body , change it
router.post("/modifyOrder", modifyOrder);
router.post("/cancelOrder", cancelOrder);

module.exports = router;
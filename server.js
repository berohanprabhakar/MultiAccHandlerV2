const express = require("express");
const connectDB = require("./db/dbconfig");
const {addNewAccount} = require("./controllers/accountController");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

connectDB();

const accountRoute = require("./routers/accountRoute");


// route to accounts operation
app.use("/api", accountRoute);

// login route
// app.get('/login', login);

app.listen(3000, () => {
  console.log(`Server listening on http://localhost:${3000}`);
});

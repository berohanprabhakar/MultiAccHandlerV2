const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URL = process.env.MONGODB_URL;



const connectDB  = async () =>{
    try {
        const db =  await mongoose.connect(MONGO_URL);
        console.log('DB connected');
    } catch (err) {
        console.log("Failed to connect DB",err.message);
    }
}

module.exports = connectDB;
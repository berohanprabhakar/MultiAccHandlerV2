const mongoose = require('mongoose');

const OpenOrderSchema = new mongoose.Schema({
    ListId : [
        {clientcode : String, orderid : String, u_od : String},
    ]
})
const Openorders = mongoose.model('Openorders', OpenOrderSchema); 
module.exports = {Openorders}
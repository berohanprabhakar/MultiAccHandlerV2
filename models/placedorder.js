const mongoose = require('mongoose');

const PlacedOrderSchema = new mongoose.Schema({
    ListId : [
        {clientcode : String, orderid : String, u_od : String},
    ]
})

const Placedorders = mongoose.model('Placedorders', PlacedOrderSchema);

module.exports = {Placedorders}
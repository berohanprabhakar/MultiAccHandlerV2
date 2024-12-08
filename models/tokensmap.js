const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    token: {type: String},
    symbol: {type : String},
    name: {type : String, default: ""},
    expiry: {type : String, default: ""},
    strike: {type : String, default: ""},
    lotsize: {type : String,},
    instrumenttype: {type : String},
    exch_seg: {type : String},
    tick_size: {type : String,},
});

const Tokens = mongoose.model('Tokens', TokenSchema);

module.exports = {Tokens};

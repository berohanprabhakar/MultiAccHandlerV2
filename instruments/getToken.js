const axios = require("axios");
const { Tokens } = require("../models/tokensmap");

const getTokens = async function (req, res) {
    try {
        // Step 1: Fetch data from the URL
        const response = await axios.get("https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json");
        const data = response.data;

        // Step 2: Validate data and save to the database
        if (!Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid data format received from the API" });
        }

        // Step 3: Save all tokens to the database
        const tokensArray = data.map(item => ({
            token: item.token,
            symbol: item.symbol,
            name: item.name,
            expiry: item.expiry,
            strike: item.strike,
            lotsize: item.lotsize,
            instrumenttype: item.instrumenttype,
            exch_seg: item.exch_seg,
            tick_size: item.tick_size,
        }));

        await Tokens.insertMany(tokensArray);
        console.log("Tokens saved:", tokensArray.length);
        return res.json({ message: `${tokensArray.length} tokens saved successfully` });
    } catch (error) {
        console.error("Error while saving tokens:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getTokens };

const axios = require("axios");

// Converts PHP to USDT using Coingecko real-time rate
const getUSDTFromPHP = async (phpAmount) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "tether",
          vs_currencies: "php",
        },
      }
    );

    const rate = response.data?.tether?.php;

    if (!rate) throw new Error("Unable to fetch USDT rate");

    const usdt = phpAmount / rate;

    return {
      usdtAmount: parseFloat(usdt.toFixed(6)),
      rate,
    };
  } catch (error) {
    console.error("❌ Failed to fetch USDT rate:", error.message);
    throw new Error("Exchange rate fetch failed.");
  }
};

module.exports = { getUSDTFromPHP };

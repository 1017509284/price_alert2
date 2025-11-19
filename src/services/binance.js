const axios = require('axios');

const BASE_PERP = "https://fapi.binance.com/fapi/v1";

/**
 * 获取 Binance 上所有支持的永续合约列表
 * @returns {Promise<string[]>} 返回合约代币符号数组
 */
async function getAllPerpSymbols() {
    try {
        const url = `${BASE_PERP}/exchangeInfo`;
        const res = await axios.get(url);

        const symbols = res.data.symbols
            .filter(
                (s) =>
                    s.status === "TRADING" &&
                    s.contractType === "PERPETUAL" &&
                    s.quoteAsset === "USDT"
            )
            .map((s) => s.symbol);

        return symbols;
    } catch (error) {
        console.error('获取 Binance 合约代币失败:', error.message);
        throw error;
    }
}

module.exports = {
    getAllPerpSymbols
};

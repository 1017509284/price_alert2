const WebSocket = require('ws');

/**
 * 启动 Binance 永续多币种 WebSocket
 * @param {string[]} symbols 币种数组，例如 ["BTCUSDT", "ETHUSDT"]
 * @param {function} onPrice 回调函数 (symbol, price)
 */
function startMultiPerpPriceStream(symbols, onPrice) {
    if (!Array.isArray(symbols) || symbols.length === 0) {
        console.error("[Binance WS][Perp] symbols 参数必须是数组");
        return;
    }

    const lowerSymbols = symbols.map((s) => s.toLowerCase());
    const streams = lowerSymbols.map((s) => `${s}@ticker`).join("/");
    const wsUrl = `wss://fstream.binance.com/stream?streams=${streams}`;

    const ws = new WebSocket(wsUrl);
    console.log(`[Binance WS][Perp] 正在连接 ${symbols.length} 个交易对的多路流...`);

    ws.on("open", () => {
        console.log(`[Binance WS][Perp] ✅ 已连接 ${symbols.length} 个交易对`);
    });

    ws.on("message", (data) => {
        try {
            const json = JSON.parse(data);
            const s = json.data.s;
            const price = parseFloat(json.data.c);
            if (price && onPrice) onPrice(s, price);
        } catch (err) {
            console.error("[Binance WS][Perp] 解析错误:", err.message);
        }
    });

    ws.on("close", () => {
        console.warn("[Binance WS][Perp] ⚠️ 连接已关闭，3秒后重连...");
        setTimeout(() => startMultiPerpPriceStream(symbols, onPrice), 3000);
    });

    ws.on("error", (err) => {
        console.error("[Binance WS][Perp] 错误:", err.message);
        ws.close();
    });

    return ws;
}

module.exports = {
    startMultiPerpPriceStream
};

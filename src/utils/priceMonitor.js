/**
 * 价格监控器 - 用于检测价格涨跌幅
 */
class PriceMonitor {
    constructor(config = {}) {
        // 配置参数
        this.threshold = config.threshold || 2; // 默认阈值 2%
        this.timeWindow = config.timeWindow || 5000; // 默认时间窗口 5秒

        // 存储每个交易对的价格数据
        // 格式: { symbol: { basePrice: number, baseTime: timestamp, lastPrice: number } }
        this.priceData = new Map();

        // 存储每个交易对的上次告警时间，避免频繁推送
        this.lastAlertTime = new Map();

        // 告警冷却时间（默认 60 秒内同一交易对只告警一次）
        this.alertCooldown = config.alertCooldown || 60000;
    }

    /**
     * 更新价格并检测是否触发告警
     * @param {string} symbol 交易对符号
     * @param {number} price 当前价格
     * @returns {object|null} 如果触发告警，返回告警信息；否则返回 null
     */
    updatePrice(symbol, price) {
        const now = Date.now();

        // 如果是新交易对，初始化数据
        if (!this.priceData.has(symbol)) {
            this.priceData.set(symbol, {
                basePrice: price,
                baseTime: now,
                lastPrice: price
            });
            return null;
        }

        const data = this.priceData.get(symbol);
        const timeDiff = now - data.baseTime;

        // 如果超过时间窗口，重置基准价格
        if (timeDiff >= this.timeWindow) {
            data.basePrice = data.lastPrice;
            data.baseTime = now;
        }

        // 更新最新价格
        data.lastPrice = price;

        // 计算涨跌幅
        const changePercent = ((price - data.basePrice) / data.basePrice) * 100;

        // 检查是否触发阈值
        if (Math.abs(changePercent) >= this.threshold) {
            // 检查冷却时间
            const lastAlert = this.lastAlertTime.get(symbol) || 0;
            if (now - lastAlert < this.alertCooldown) {
                return null; // 在冷却时间内，不发送告警
            }

            // 更新告警时间
            this.lastAlertTime.set(symbol, now);

            // 保存告警信息（使用触发前的基准价格和时间）
            const alertInfo = {
                symbol,
                changePercent: changePercent.toFixed(2),
                currentPrice: price,
                basePrice: data.basePrice,
                direction: changePercent > 0 ? '上涨' : '下跌',
                baseTime: new Date(data.baseTime).toLocaleString('zh-CN'),
                currentTime: new Date(now).toLocaleString('zh-CN')
            };

            // 重置基准价格（在返回告警信息之后）
            data.basePrice = price;
            data.baseTime = now;

            // 返回告警信息
            return alertInfo;
        }

        return null;
    }

    /**
     * 获取当前监控的交易对数量
     */
    getMonitoredCount() {
        return this.priceData.size;
    }

    /**
     * 清除指定交易对的数据
     */
    clearSymbol(symbol) {
        this.priceData.delete(symbol);
        this.lastAlertTime.delete(symbol);
    }

    /**
     * 清除所有数据
     */
    clearAll() {
        this.priceData.clear();
        this.lastAlertTime.clear();
    }
}

module.exports = PriceMonitor;

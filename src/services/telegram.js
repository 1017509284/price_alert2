const TelegramBot = require('node-telegram-bot-api');

/**
 * Telegram 推送服务
 */
class TelegramService {
    constructor(token, chatId) {
        if (!token) {
            console.warn('[Telegram] ⚠️ 未配置 Telegram Bot Token，推送功能将被禁用');
            this.enabled = false;
            return;
        }

        if (!chatId) {
            console.warn('[Telegram] ⚠️ 未配置 Chat ID，推送功能将被禁用');
            this.enabled = false;
            return;
        }

        this.bot = new TelegramBot(token, { polling: false });
        this.chatId = chatId;
        this.enabled = true;
        console.log('[Telegram] ✅ Telegram Bot 已初始化');
    }

    /**
     * 发送价格告警消息
     * @param {object} alert 告警信息对象
     */
    async sendPriceAlert(alert) {
        if (!this.enabled) {
            console.log('[Telegram] 推送已禁用，跳过发送');
            return;
        }

        try {
            const emoji = alert.direction === '上涨' ? '🚀' : '📉';
            const trendEmoji = alert.direction === '上涨' ? '📈' : '📉';
            const message = `
${emoji} *价格告警* ${emoji}

🏦 交易所: \`Binance\`
💱 交易对: \`${alert.symbol}\`
${trendEmoji} 变动: *${alert.changePercent}%* (${alert.direction})

💰 当前价格: \`${alert.currentPrice}\`
⏰ 当前时间: ${alert.currentTime}

📊 基准价格: \`${alert.basePrice}\`
🕐 基准时间: ${alert.baseTime}
            `.trim();

            await this.bot.sendMessage(this.chatId, message, {
                parse_mode: 'Markdown'
            });

            console.log(`[Telegram] ✅ 已发送告警: ${alert.symbol} ${alert.changePercent}%`);
        } catch (error) {
            console.error('[Telegram] ❌ 发送消息失败:', error.message);
        }
    }

    /**
     * 发送普通文本消息
     * @param {string} text 消息内容
     */
    async sendMessage(text) {
        if (!this.enabled) {
            console.log('[Telegram] 推送已禁用，跳过发送');
            return;
        }

        try {
            await this.bot.sendMessage(this.chatId, text);
            console.log('[Telegram] ✅ 消息已发送');
        } catch (error) {
            console.error('[Telegram] ❌ 发送消息失败:', error.message);
        }
    }
}

module.exports = TelegramService;

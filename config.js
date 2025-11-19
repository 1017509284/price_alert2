/**
 * 配置文件
 */
// 加载环境变量
require('dotenv').config();

module.exports = {
    // Telegram Bot 配置
    telegram: {
        // 从环境变量读取，或者在这里直接填写
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || ''
    },

    // 价格监控配置
    priceMonitor: {
        threshold: 2,           // 价格变动阈值（百分比），默认 1%
        timeWindow: 5000,       // 时间窗口（毫秒），默认 5秒
        alertCooldown: 10000    // 告警冷却时间（毫秒），默认 60秒
    },

    // 其他配置
    debug: false                // 是否开启调试模式
};

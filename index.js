const { getAllPerpSymbols } = require('./src/services/binance');
const { startMultiPerpPriceStream } = require('./src/services/websocket');
const TelegramService = require('./src/services/telegram');
const PriceMonitor = require('./src/utils/priceMonitor');
const config = require('./config');

/**
 * 主函数 - 启动价格监控系统
 */
async function main() {
    try {
        console.log('========================================');
        console.log('🚀 Binance 永续合约价格监控系统启动中...');
        console.log('========================================\n');

        // 1. 获取所有永续合约代币列表
        console.log('📡 正在获取 Binance 永续合约代币列表...');
        const symbols = await getAllPerpSymbols();
        console.log(`✅ 成功获取 ${symbols.length} 个 USDT 永续合约代币\n`);

        // 2. 初始化 Telegram 服务
        const telegramService = new TelegramService(
            config.telegram.botToken,
            config.telegram.chatId
        );

        // 3. 初始化价格监控器
        const priceMonitor = new PriceMonitor(config.priceMonitor);
        console.log(`📊 价格监控器已初始化`);
        console.log(`   - 变动阈值: ±${config.priceMonitor.threshold}%`);
        console.log(`   - 时间窗口: ${config.priceMonitor.timeWindow / 1000}秒`);
        console.log(`   - 告警冷却: ${config.priceMonitor.alertCooldown / 1000}秒\n`);

        // 4. 定义价格更新回调函数
        const onPriceUpdate = (symbol, price) => {
            // 更新价格并检测是否触发告警
            const alert = priceMonitor.updatePrice(symbol, price);

            if (alert) {
                // 打印到控制台
                console.log(`⚠️  告警触发: ${alert.symbol} ${alert.direction} ${alert.changePercent}% (价格: ${alert.currentPrice})`);

                // 发送 Telegram 推送
                telegramService.sendPriceAlert(alert).catch(err => {
                    console.error('Telegram 推送失败:', err.message);
                });
            }

            // 调试模式：打印所有价格更新
            if (config.debug) {
                console.log(`[DEBUG] ${symbol}: ${price}`);
            }
        };

        // 5. 启动 WebSocket 连接
        console.log('🔌 正在连接 Binance WebSocket...\n');
        startMultiPerpPriceStream(symbols, onPriceUpdate);

        // 6. 发送启动通知
        if (telegramService.enabled) {
            await telegramService.sendMessage(
                `🚀 价格监控系统已启动\n\n` +
                `监控交易对数量: ${symbols.length}\n` +
                `变动阈值: ±${config.priceMonitor.threshold}%\n` +
                `时间窗口: ${config.priceMonitor.timeWindow / 1000}秒`
            );
        }

        console.log('✅ 系统运行中，正在监控价格变动...\n');
        console.log('按 Ctrl+C 退出程序');

        // 定期打印统计信息
        setInterval(() => {
            console.log(`[统计] 当前监控 ${priceMonitor.getMonitoredCount()} 个交易对`);
        }, 60000); // 每分钟打印一次

    } catch (error) {
        console.error('❌ 程序运行出错:', error.message);
        process.exit(1);
    }
}

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n\n👋 正在退出程序...');
    process.exit(0);
});

// 运行主函数
main();

# Binance 永续合约价格监控系统

实时监控所有 Binance USDT 永续合约的价格变动，当检测到短时间内价格波动超过阈值时，自动通过 Telegram Bot 发送告警通知。

## 功能特性

- ✅ **实时监控** - 通过 WebSocket 实时接收 538+ 个永续合约的价格数据
- ✅ **智能告警** - 检测指定时间窗口内的价格涨跌幅，超过阈值自动告警
- ✅ **Telegram 推送** - 支持通过 Telegram Bot 发送告警消息
- ✅ **告警冷却** - 避免同一交易对频繁推送，可配置冷却时间
- ✅ **自动重连** - WebSocket 断线自动重连，保证服务稳定性

## 项目结构

```
price_alert/
├── index.js                    # 主入口文件
├── config.js                   # 配置文件
├── .env.example                # 环境变量示例
├── package.json                # 项目依赖
├── src/
│   ├── services/
│   │   ├── binance.js          # Binance API 服务
│   │   ├── websocket.js        # WebSocket 价格流服务
│   │   └── telegram.js         # Telegram Bot 推送服务
│   └── utils/
│       └── priceMonitor.js     # 价格监控和涨跌幅检测
└── README.md                   # 项目说明文档
```

## 安装依赖

```bash
npm install
```

## 配置说明

### 1. 配置 Telegram Bot（可选）

如果需要 Telegram 推送功能，需要先创建 Bot 并获取配置信息：

1. 在 Telegram 中找到 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新 Bot，获取 **Bot Token**
3. 将你的 Bot 添加到某个群组或频道
4. 获取 **Chat ID**（可以使用 [@userinfobot](https://t.me/userinfobot) 获取）

### 2. 设置环境变量

复制 `.env.example` 创建 `.env` 文件：

```bash
cp .env .env
```

编辑 `.env` 文件，填入你的配置：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

或者直接在 `config.js` 中修改配置：

```javascript
module.exports = {
    telegram: {
        botToken: 'your_bot_token_here',
        chatId: 'your_chat_id_here'
    },
    priceMonitor: {
        threshold: 2,           // 价格变动阈值（%）
        timeWindow: 5000,       // 时间窗口（毫秒）
        alertCooldown: 60000    // 告警冷却时间（毫秒）
    }
};
```

## 运行程序

```bash
node index.js
```

## 配置参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `threshold` | 价格变动阈值（百分比） | 2% |
| `timeWindow` | 检测时间窗口（毫秒） | 5000ms (5秒) |
| `alertCooldown` | 告警冷却时间（毫秒） | 60000ms (60秒) |
| `debug` | 是否开启调试模式 | false |

## 工作原理

1. **获取交易对列表** - 从 Binance API 获取所有 USDT 永续合约交易对
2. **建立 WebSocket 连接** - 连接 Binance WebSocket 实时接收价格数据
3. **价格监控** - 每个交易对维护一个基准价格和时间戳
4. **涨跌幅计算** - 在时间窗口内计算价格相对于基准价格的涨跌幅
5. **触发告警** - 当涨跌幅超过阈值时触发告警
6. **Telegram 推送** - 发送格式化的告警消息到 Telegram

## 告警消息示例

```
🚀 价格告警

交易对: BTCUSDT
变动: +2.35% (上涨)
当前价格: 45678.90
基准价格: 44623.50
时间: 2025-01-19 16:30:45
```

## 注意事项

1. **WebSocket 连接数限制** - Binance 对 WebSocket 连接有一定限制，本项目使用多路流方式，一个连接监控所有交易对
2. **告警冷却** - 默认 60 秒内同一交易对只会告警一次，避免频繁推送
3. **网络稳定性** - 需要稳定的网络连接，断线会自动重连
4. **无 Telegram 配置时** - 系统仍会正常运行，只是不会发送推送，告警信息会打印到控制台

## 开发和调试

启用调试模式可以查看所有价格更新：

```javascript
// config.js
module.exports = {
    // ...
    debug: true  // 开启调试模式
};
```

## 常见问题

**Q: 为什么没有收到 Telegram 消息？**
- 检查 Bot Token 和 Chat ID 是否正确
- 确认 Bot 已被添加到对应的群组或频道
- 查看控制台是否有错误信息

**Q: 如何调整监控的敏感度？**
- 修改 `threshold` 参数调整涨跌幅阈值
- 修改 `timeWindow` 参数调整时间窗口
- 减小阈值或时间窗口会增加告警频率

**Q: 可以只监控部分交易对吗？**
- 可以修改 `src/services/binance.js` 中的过滤条件
- 或在主函数中对 `symbols` 数组进行筛选

## 许可证

MIT

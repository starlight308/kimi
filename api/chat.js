export default async function handler(req, res) {
    // 只允许POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 调用扣子(Coze) API
        const response = await fetch('https://api.coze.cn/open_api/v2/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.COZE_TOKEN}`
            },
            body: JSON.stringify({
                bot_id: process.env.COZE_BOT_ID,
                user: 'user_' + Date.now(),
                query: message,
                stream: false
            })
        });

        const data = await response.json();
        
        // 扣子返回格式处理
        if (data.messages && data.messages.length > 0) {
            const answer = data.messages.find(m => m.type === 'answer');
            if (answer) {
                return res.status(200).json({ reply: answer.content });
            }
        }
        
        if (data.reply) {
            return res.status(200).json({ reply: data.reply });
        }
        
        return res.status(200).json({ reply: '收到你的消息：' + message });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
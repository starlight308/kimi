export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await fetch('https://api.coze.cn/v3/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.COZE_TOKEN}`
            },
            body: JSON.stringify({
                bot_id: process.env.COZE_BOT_ID,
                user_id: 'user_' + Date.now(),
                additional_messages: [
                    {
                        role: 'user',
                        content: message,
                        content_type: 'text'
                    }
                ]
            })
        });

        const data = await response.json();
        
        // Coze v3 返回格式
        if (data.data && data.data.messages) {
            const answer = data.data.messages.find(m => m.type === 'answer');
            if (answer) {
                return res.status(200).json({ reply: answer.content });
            }
        }
        
        return res.status(200).json({ reply: '收到你的消息：' + message });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

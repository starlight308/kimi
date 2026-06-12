export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 第一步：创建会话
        const conversationRes = await fetch('https://api.coze.cn/v3/conversation/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.COZE_TOKEN}`
            },
            body: JSON.stringify({
                bot_id: process.env.COZE_BOT_ID,
                user_id: 'user_' + Date.now()
            })
        });

        const convData = await conversationRes.json();
        const conversationId = convData.data?.conversation_id;

        if (!conversationId) {
            throw new Error('Failed to create conversation');
        }

        // 第二步：发送消息
        const response = await fetch('https://api.coze.cn/v3/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.COZE_TOKEN}`
            },
            body: JSON.stringify({
                bot_id: process.env.COZE_BOT_ID,
                conversation_id: conversationId,
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
        
        // 处理返回
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

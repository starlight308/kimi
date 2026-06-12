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
        
        // 返回完整数据用于调试
        return res.status(200).json({ 
            reply: data.data?.messages?.find(m => m.type === 'answer')?.content || null,
            debug: JSON.stringify(data).substring(0, 800)
        });

    } catch (error) {
        return res.status(200).json({ 
            reply: null,
            debug: 'Error: ' + error.message
        });
    }
}

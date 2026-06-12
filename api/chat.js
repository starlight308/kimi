export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
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

        const text = await response.text();
        console.log('Raw response:', text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return res.status(200).json({ reply: '解析错误: ' + text.substring(0, 100) });
        }
        
        console.log('Parsed data:', data);

        if (data.messages && data.messages.length > 0) {
            const answer = data.messages.find(m => m.type === 'answer');
            if (answer) {
                return res.status(200).json({ reply: answer.content });
            }
        }
        
        if (data.code !== undefined && data.code !== 0) {
            return res.status(200).json({ reply: 'API错误: ' + (data.msg || data.message || JSON.stringify(data)) });
        }
        
        return res.status(200).json({ reply: '收到你的消息：' + message + ' (调试: ' + JSON.stringify(data).substring(0, 50) + ')' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

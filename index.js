// index.js - 腾讯云云函数入口
exports.main_handler = async (event, context) => {
    // 获取请求路径和方法
    const path = event.path || '/';
    const method = event.httpMethod || 'GET';
    
    // 设置跨域头
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // 处理OPTIONS预检请求
    if (method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    // 只处理 /api/chat 路径的POST请求
    if (path === '/api/chat' && method === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            const { message } = body;
            
            if (!message) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Message is required' })
                };
            }

            // 调用扣子API
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
            
            let reply = '抱歉，暂时无法回复';
            if (data.messages && data.messages.length > 0) {
                const answer = data.messages.find(m => m.type === 'answer');
                if (answer) reply = answer.content;
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ reply })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
    
    // 根路径返回简单提示
    if (path === '/' || path === '') {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: '<html><body><h1>API服务运行中</h1><p>请通过前端页面访问</p></body></html>'
        };
    }

    // 其他路径返回404
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Not Found' })
    };
};